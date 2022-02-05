import {CWCO} from "../cwco";
import WebComponent = CWCO.WebComponent;
import Executable = CWCO.Executable;
import {extractExecutableSnippetFromString} from "../utils/extract-executable-snippet-from-string";
import {extractExecutableSnippetFromCSS} from "../utils/extract-executable-snippet-from-css";
import {parseNodeDirective} from "../utils/parse-node-directive";
import {directiveRegistry} from "../directives/registry";
import {getEventHandlerFunction} from "../utils/get-event-handler-function";
import DirectiveConstructor = CWCO.DirectiveConstructor;
import {$} from "../metadata";
import {defineNodeContextMetadata} from "../utils/define-node-context-metadata";
import {slotTag} from "../tags/slot.tag";
import {resolveExecutables} from "../utils/resolve-executables";
import {isPrimitive} from "../utils/is-primitive";
import {evaluateStringInComponentContext} from "../utils/evaluate-string-in-component-context";

export const trackNode = (node: Node | HTMLElement, component: WebComponent): TracksMapByType => {
	const tracks: TracksMapByType = {
		directive: [],
		attribute: [],
		property: [],
	};

	// because there are certain actions here that will modify the node itself like removing attributes
	// we can preserve the original node string representation to recreate it if necessary later
	$.get(node).rawNodeString = (node.nodeType === 3 ? node.nodeValue : (node as HTMLElement).outerHTML) || '';

	let {nodeName, nodeValue, nodeType, textContent, attributes} = node as HTMLElement;
	let track = null;
	nodeValue = nodeValue || '';
	textContent = textContent || '';

	switch (nodeName) {
		case '#text':
			track = getNodeTrack('nodeValue', nodeValue)
			if (track) {
				tracks.property.push(track);
			}
			break;
		case 'TEXTAREA':
			track = getNodeTrack('textContent', textContent)
			if (track) {
				tracks.property.push(track);
			}
			break;
		case 'STYLE':
			track = getNodeTrack('textContent', textContent, TrackType.property, extractExecutableSnippetFromCSS)
			if (track) {
				tracks.property.push(track);
			}
			break;
	}

	if (nodeType === 1) {
		const dirPattern = new RegExp(`^(${Object.keys(directiveRegistry).join('|')})\\.?`);
		const eventHandlers: Array<CWCO.EventHandlerTrack> = [];
		const attrs: Attr[] = [];

		// @ts-ignore
		[...attributes].forEach((attr, i) => {
			if (dirPattern.test(attr.name)) {
				const {name, value, prop} = parseNodeDirective(node as HTMLElement, attr.name, attr.value);
				const dir = directiveRegistry[name];

				track = new Track(name, value, TrackType.directive);
				track.prop = prop;
				track.handler = dir;

				if(name === 'if') {
					tracks.directive[0] = track;
				} else if(name === 'repeat') {
					tracks.directive[1] = track;
				} else {
					tracks.directive[i + 2] = track;
				}

				(node as HTMLElement).removeAttribute(attr.name);
			} else if (attr.name.startsWith('on')) {
				eventHandlers.push({
					eventName: attr.name.slice(2).toLowerCase(),
					attribute: attr
				});
			} else {
				attrs.push(attr)
			}
		})

		tracks.directive = Object.values(tracks.directive); // to eliminate empty slots

		eventHandlers.forEach(({eventName, fn, attribute}) => {
			(node as HTMLElement).removeAttribute(attribute.name);

			if (!fn) {
				node.addEventListener(eventName, getEventHandlerFunction(component, $.get(node).$context, attribute));
			}
		});

		for (let attr of attrs) {
			if (attr.value.trim()) {
				track = getNodeTrack(attr.name, attr.value, TrackType.attribute)
				if (track) {
					tracks.attribute.push(track);
				}
			}
		}
	}

	return tracks;
}

export const trackNodeTree = (node: Node | WebComponent | HTMLElement, ancestorNodeTrack: NodeTrack, component: WebComponent) => {
	const {nodeName, nodeValue, childNodes, nodeType} = node;

	// if the track already exist simply push it to the ancestor
	if ($.get(node)?.track) {
		ancestorNodeTrack.childNodeTracks.add($.get(node)?.track);
		return;
	}

	// skip comments and empty text nodes to save unnecessary processing
	if (nodeName === '#comment' || (nodeName === '#text' && !nodeValue?.trim())) {
		return;
	}

	if (nodeName === 'SLOT') {
		slotTag(node as HTMLSlotElement, {
			component: {
				type: component.customSlot ? 'context' : 'default',
				childNodes: component._childNodes
			}
		}, (nodes: Node[]) => {
			nodes.forEach(node => {
				trackNodeTree(node, ancestorNodeTrack, component);
			})
		})
	} else if ((nodeType === 1 || nodeType === 3)) {
		defineNodeContextMetadata(node);
		const tracks = trackNode(node, component);
		const isComponentNode = nodeName.includes('-');

		// collect the node track if it is a web component node
		// ,or it is just a node with tracks;
		if (isComponentNode || (tracks.attribute.length || tracks.property.length || tracks.directive.length)) {
			const nodeTrack = new NodeTrack(node, component, tracks);
			$.get(node).track = nodeTrack;
			ancestorNodeTrack.childNodeTracks.add(nodeTrack);
			ancestorNodeTrack = nodeTrack; // continue collecting for this node track
		}

		// no need to continue for inside these tags either because:
		// - contains content which we don't want to deal with (script)
		// - content is already handled by the "trackNode" function
		if (/SCRIPT|STYLE|TEXTAREA|#text/i.test(nodeName)) {
			return;
		}
	}

	Array.from(childNodes).forEach(c => trackNodeTree(c, ancestorNodeTrack, component));
}

export enum TrackType {
	attribute,
	property,
	directive
}

export class Track {
	public executables: Executable[] = [];
	public handler: DirectiveConstructor | null = null;
	public prop: string | null = null;
	public prevValue: any = null;

	constructor(
		public name: string,
		public value: string,
		public type: TrackType = TrackType.attribute
	) {
	}
}

export interface TracksMapByType {
	attribute: Track[];
	directive: Track[];
	property: Track[];
}

export class NodeTrack {
	childNodeTracks = new Set<NodeTrack>();
	anchor: HTMLElement | Node | Comment | Array<Element>;
	anchorNodeTrack: NodeTrack | null = null;
	anchorTrack: Track | null = null;
	readonly dirs = new WeakMap();
	readonly dirAnchors = new WeakMap();

	constructor(
		public node: Node | HTMLElement | WebComponent,
		public component: WebComponent,
		public tracks: TracksMapByType = {directive: [], attribute: [], property: []}
	) {
		if (node.nodeType !== 8) {
			defineNodeContextMetadata(node);

			this.anchorNodeTrack = new NodeTrack(document.createComment($.get(node).rawNodeString), component)
		}

		this.anchor = node;
	}

	get $context() {
		// use this track node context if it does not happen to be anchored
		// otherwise the anchor context will reflect its ancestor's context
		return (this.anchor === this.node
			? $.get(this.node).$context
			: $.get((this.anchor as Array<Element>)[0] ?? this.anchor)?.$context) || {};
	}

	updateNode(force = false) {
		// if it is a text node
		if (this.node.nodeType === 3) {
			for (let t of this.tracks.property) {
				this._updateNodeProperty(t)
			}
		} else {
			const empty = !this.tracks.directive.length &&
				!this.tracks.attribute.length &&
				!this.tracks.property.length;

			for (let t of this.tracks.directive) {
				const dirNode = this._updateNodeDirective(t);

				if (dirNode) {
					this._swapNodeAndDirNode(dirNode);
					this.anchor = dirNode;

					if (dirNode !== this.node) {
						this.anchorNodeTrack?.childNodeTracks.forEach((t: NodeTrack) => {
							t.updateNode();
						})
						return;
					}
				}
			}

			for (let t of this.tracks.attribute) {
				this._updateNodeAttribute(t)
			}

			for (let t of this.tracks.property) {
				this._updateNodeProperty(t)
			}

			// for empty web component with no tracks needs to
			// be force updated if force is True since
			// there is nothing that will trigger update inside the
			// component like attribute tracks would
			if (empty && force && this.node.nodeName.includes('-')) {
			    (this.node as WebComponent).forceUpdate();
			}

			this.childNodeTracks.forEach(t => {
				t.updateNode(force);
			})
		}
	}

	private _removeNodeDirectiveAttribute(n: Node | HTMLElement) {
		if (n.nodeType === 1) {
		    (n as HTMLElement).removeAttribute(this.anchorTrack?.name || '')
		}
	}

	private _updateNodeProperty(track: Track) {
		const newValue = resolveExecutables(
			track.value,
			this.component,
			this.$context,
			track.executables
		);

		if (!isPrimitive(newValue) || newValue !== (this.node as CWCO.ObjectLiteral)[track.name]) {
			(this.node as CWCO.ObjectLiteral)[track.name] = newValue;
			return true;
		}

		return false;
	}

	private _updateNodeAttribute(track: Track) {
		let newValue = resolveExecutables(
			track.value,
			this.component,
			this.$context,
			track.executables
		);

		if (isPrimitive(newValue)) {
			if ((this.node as HTMLElement).getAttribute(track.name) !== newValue) {
				(this.node as HTMLElement).setAttribute(track.name, newValue);
				return true;
			}
		} else {
			const {attrPropsMap} = $.get(this.node);
			const attrProp = attrPropsMap ? attrPropsMap[track.name] : track.name;

			if ((this.node as HTMLElement).hasAttribute(track.name)) {
				$.get(this.node).clearAttr = true;
				(this.node as HTMLElement).removeAttribute(track.name);
			}


			(this.node as CWCO.ObjectLiteral)[attrProp] = newValue;
			return true;
		}

		return false;
	}

	private _updateNodeDirective(track: Track) {
		if (track.handler) {
			try {
				const {handler} = track;
				const dir = this.dirs.get(track) || new handler(this.component);
				this.dirs.set(track, dir);

				let val = dir.parseValue(track.value, track.prop);

				let value = resolveExecutables(
					val,
					this.component,
					this.$context,
					extractExecutableSnippetFromString(val)
				);

				if (typeof value === 'string') {
					value = evaluateStringInComponentContext(value, this.component, this.$context);
				}

				if (track.prevValue !== value) {
					track.prevValue = value;

					const dirNode = dir.render(value, {
						element: this.node,
						anchorNode: this.dirAnchors.get(track) ?? null,
						rawElementOuterHTML: $.get(this.node).rawNodeString
					} as CWCO.directiveRenderOptions);

					if (dirNode !== this.node) {
						this.dirAnchors.set(track, dirNode);
						this.anchorTrack = track;
					}

					return dirNode;
				} else if(this.anchorTrack === track) {
					// if this directive happens to be the one which cause this node to be anchored
					// and its value did not change, we can just quit the updating al together
					// since nothing else will update this node
					return this.anchor;
				}
			} catch(e: any) {
				this.component.onError(new Error(`"${track.name}" on ${$.get(this.node).rawNodeString}: ${e.message}`));
			}

			this.dirAnchors.set(track, null)
		}

		return this.node;
	}

	private _swapNodeAndDirNode(dirNode: HTMLElement | Node | Comment | Array<Element>) {
		if (dirNode === this.anchor) {
			return;
		}

		// clear child node tracks before pushing all tracks
		(this.anchorNodeTrack as NodeTrack).childNodeTracks.clear();

		if (Array.isArray(dirNode)) {
			dirNode.forEach(n => {
				this._removeNodeDirectiveAttribute(n);
				trackNodeTree(n, this.anchorNodeTrack as NodeTrack, this.component)
			})
		} else {
			this._removeNodeDirectiveAttribute(dirNode);
			trackNodeTree(dirNode as Node, this.anchorNodeTrack as NodeTrack, this.component)
		}

		let dirIsArray = Array.isArray(dirNode);

		if (
			(dirIsArray && !(dirNode as Array<Element>).length) ||
			(!dirIsArray && !(/[831]/.test(`${(dirNode as Node).nodeType}`)))
		) {
			dirNode = (this.anchorNodeTrack as NodeTrack).node;
			dirIsArray = false;
		}

		const anchorIsArray = Array.isArray(this.anchor);
		const anchorEl = document.createComment('cw')
		let nextEl: Element | Comment | Text = anchorEl;

		if (anchorIsArray) {
			(this.anchor as Array<Element>)[0]?.parentNode?.insertBefore(nextEl, (this.anchor as Array<Element>)[0]);
		} else {
			(this.anchor as Node).parentNode?.insertBefore(nextEl, this.anchor as Node);
		}

		if (dirIsArray) {
			for (let el of (dirNode as Array<Element>)) {
				if (!el.isConnected) {
					nextEl.after(el);
					$.get(el).shadowNode = this.node;
				}

				nextEl = el;
			}
		} else {
			nextEl.after(dirNode as Node);
		}

		if (anchorIsArray) {
			for (let el of (this.anchor as Array<Element>)) {
				if (!dirIsArray || !(dirNode as Array<Element>).includes(el)) {
					el.parentNode?.removeChild(el);
				}
			}
		} else if (this.anchor !== dirNode) {
			(this.anchor as Node).parentNode?.removeChild(this.anchor as Node);
		}

		anchorEl.parentNode?.removeChild(anchorEl);
	}
}

function getNodeTrack(name: string, value: string, type: TrackType = TrackType.property, extractor = extractExecutableSnippetFromString) {
	if ((value || '').trim()) {
		const track = new Track(name, value, type);
		track.executables = extractor(value);

		if (track.executables.length) {
			return track;
		}
	}

	return null;
}