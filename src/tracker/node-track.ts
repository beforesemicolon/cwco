import {CWCO} from "../cwco";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";
import {$} from "../core/$";
import {resolveExecutables} from "./utils/resolve-executables";
import {isPrimitive} from "../utils/is-primitive";
import {extractExecutableSnippetFromString} from "./utils/extract-executable-snippet-from-string";
import {evaluateStringInComponentContext} from "./utils/evaluate-string-in-component-context";
import {trackNodeTree} from "./track-node-tree";

export class NodeTrack {
	#compiled = false;
	childNodeTracks = new Set<NodeTrack>();
	anchor: HTMLElement | Node | Comment | Array<Element>;
	anchorNodeTrack: NodeTrack | null = null;
	anchorTrack: CWCO.Track | null = null;
	readonly dirs = new WeakMap();
	readonly dirAnchors = new WeakMap();

	constructor(
		public node: Node | HTMLElement | CWCO.WebComponent,
		public component: CWCO.WebComponent,
		public tracks: CWCO.TracksMapByType = {directive: [], attribute: [], property: []}
	) {
		defineNodeContextMetadata(node);

		if (node.nodeType !== 8) {
			this.anchorNodeTrack = new NodeTrack(document.createComment($.get(node).rawNodeString), component)
		}

		this.anchor = node;
	}

	get $context() {
		// use this track node context if it does not happen to be anchored
		// otherwise the anchor context will reflect its ancestor's context
		return (this.anchor === this.node
			? $.get(this.node).$context
			: $.get(
				Array.isArray(this.anchor)
					? (this.anchor as Array<Element>)[0]
					: this.anchor
			)?.$context) || {};
	}
	
	get compiled() {
		return this.#compiled;
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
			if (empty && force && this.node.nodeName.includes('-') && typeof (this.node as CWCO.WebComponent).forceUpdate == 'function') {
				(this.node as CWCO.WebComponent).forceUpdate();
			}

			this.childNodeTracks.forEach(t => {
				t.updateNode(force);
			})
		}
		
		this.#compiled = true;
	}

	private _removeNodeDirectiveAttribute(n: Node | HTMLElement) {
		if (n.nodeType === 1) {
			(n as HTMLElement).removeAttribute(this.anchorTrack?.name || '')
		}
	}

	private _updateNodeProperty(track: CWCO.Track) {
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

	private _updateNodeAttribute(track: CWCO.Track) {
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

	private _updateNodeDirective(track: CWCO.Track) {
		if (track.handler) {
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

			this.dirAnchors.set(track, null)
		}

		return this.node;
	}

	private _swapNodeAndDirNode(dirNode: HTMLElement | Node | Comment | Array<Element>) {
		if (dirNode === this.anchor) {
			return;
		}

		// clear previous child node tracks before pushing all new ones
		// to ensure that the updates will only be applied to these new tracks
		(this.anchorNodeTrack as NodeTrack)?.childNodeTracks.clear();

		// since new nodes are not initially tracked by the component
		// we need to track them as part of the anchor node branch
		// so when there are changes to the anchored node
		// these are tracked and updated separately from the original node
		if (Array.isArray(dirNode)) {
			dirNode.forEach(n => {
				this._removeNodeDirectiveAttribute(n);
				trackNodeTree(n, this.anchorNodeTrack as NodeTrack, this.component)
			})
		} else {
			this._removeNodeDirectiveAttribute(dirNode);
			trackNodeTree(dirNode as Node, this.anchorNodeTrack as NodeTrack, this.component)
		}

		if (dirNode !== this.node) {
			this.anchorNodeTrack?.childNodeTracks.forEach((t: NodeTrack) => {
				t.updateNode();
			})
		}

		let dirIsArray = Array.isArray(dirNode);

		// in case we have an empty array of nodes or simply that
		// the nodes are ar not valid nodes types (text, comment, element)
		// we will override to use the anchor node which is a comment node
		if (
			(dirIsArray && !(dirNode as Array<Element>).length) ||
			(!dirIsArray && !(/[831]/.test(`${(dirNode as Node).nodeType}`)))
		) {
			dirNode = (this.anchorNodeTrack as NodeTrack).node;
			dirIsArray = false;
		}

		const anchorIsArray = Array.isArray(this.anchor);
		// in case the anchor node is currently empty, it means it had a anchor
		// node comment render instead as the above if statement make sure of.
		// in that regard we need to use so we can replace whats it is currently
		// on the dom as an anchor
		const anchorEl = anchorIsArray && !(this.anchor as Array<Element>).length
			? (this.anchorNodeTrack as NodeTrack).node as Comment
			: document.createComment('cw');
		let nextEl: Element | Comment | Text = anchorEl;

		if (anchorIsArray) {
			// here we use the dir node first element or the anchor node
			// to place the anchor element to begin the swapping process
			const el = !(this.anchor as Array<Element>).length
				? (this.anchorNodeTrack as NodeTrack).node
				: (this.anchor as Array<Element>)[0];
			el?.parentNode?.insertBefore(nextEl, el);
		} else {
			(this.anchor as Node).parentNode?.insertBefore(nextEl, this.anchor as Node);
		}

		if (dirIsArray) {
			// for each dir node in the array we place on the dom after
			// the previous as long as it was not in the dom before
			// this will ensure the nodes are placed sequentially
			// and not remounted to avoid un updates in case they are
			// web component nodes
			for (let el of (dirNode as Array<Element>)) {
				if (!el.isConnected) {
					nextEl.after(el);
				}

				nextEl = el;
			}
		} else if(dirNode instanceof Node) {
			nextEl.after(dirNode as Node);
		}

		if (anchorIsArray) {
			// here we start the process of cleaning up any old node
			// placed before in the previous dir node list
			// which is not part of the new dir node list
			for (let el of (this.anchor as Array<Element>)) {
				if (!dirIsArray || !(dirNode as Array<Element>).includes(el)) {
					el.parentNode?.removeChild(el);
				}
			}
		} else if (this.anchor !== dirNode) {
			(this.anchor as Node).parentNode?.removeChild(this.anchor as Node);
		}

		// remove the node which served as the anchor on the dom for the node swap
		anchorEl.parentNode?.removeChild(anchorEl);
	}
}
