import {extractExecutableSnippetFromString} from "./utils/extract-executable-snippet-from-string";
import {parseNodeDirective} from "./utils/parse-node-directive";
import {resolveExecutable} from "./utils/resolve-executable";
import {getEventHandlerFunction} from "./utils/get-event-handler-function";
import {directiveRegistry} from './directives/registry';
import {evaluateStringInComponentContext} from "./utils/evaluate-string-in-component-context";
import {$} from "./metadata";
import {trackNode} from "./utils/track-node";
import {CWCO} from "./cwco";

/**
 * handles all logic related to tracking and updating a tracked node.
 * It is a extension of the component that handles all the logic related to updating nodes
 * in conjunction with the node component
 */
export class NodeTrack implements CWCO.NodeTrack {
	node: HTMLElement | Node;
	readonly attributes: Array<{
		name: string;
		value: string;
		executables: Array<CWCO.Executable>;
	}> = []
	readonly directives: Array<CWCO.DirectiveValue> = [];
	property: {
		name: string;
		value: string;
		executables: Array<CWCO.Executable>;
	} = {
		name: '',
		value: '',
		executables: []
	};
	readonly component: CWCO.WebComponent;
	anchor: HTMLElement | Node | Comment | Array<Element>;
	anchorDir: CWCO.DirectiveValue | null = null;
	empty = false;
	readonly tracks = new Map();
	readonly dirValues = new WeakMap();
	readonly dirAnchors = new WeakMap();

	constructor(node: HTMLElement | Node, component: CWCO.WebComponent) {
		this.node = node;
		this.anchor = node;
		this.component = component;

		$.get(this.node).rawNodeString = /#text|#comment/.test(node.nodeName)
			? node.nodeValue
			: (node as HTMLElement).outerHTML;

		this._setTracks();

	}

	get $context() {
		// use this track node context if it does not happen to be anchored
		// otherwise the anchor context will reflect its ancestor's context
		return (this.anchor === this.node
			? $.get(this.node).$context
			: $.get((this.anchor as Array<Element>)[0] ?? this.anchor)?.$context) || {};
	}

	updateNode() {
		let updated = false;
		let directiveNode: any = this.node;

		for (let directive of this.directives) {
			if (directive && directive.handler) {
				try {
					const {handler} = directive;

					let val = handler.parseValue(directive.value, directive.prop);
					extractExecutableSnippetFromString(val).forEach((exc) => {
						val = resolveExecutable(this.component, this.$context, exc, val);
					});

					const value = evaluateStringInComponentContext(val, this.component, this.$context);
					
					// compare with previous directive value before rendering the directive
					if (this.dirValues.get(directive) !== value) {
						updated = true;
						
						directiveNode = handler.render(value, {
							element: this.node,
							anchorNode: this.dirAnchors.get(directive) ?? null,
							rawElementOuterHTML: $.get(this.node).rawNodeString
						} as CWCO.directiveRenderOptions);
						
						this.dirValues.set(directive, value);
						
						if (directiveNode !== this.node) {
							this.dirAnchors.set(directive, directiveNode);
							this.anchorDir = directive;
							break;
						}
					} else if(this.anchorDir === directive) {
						// if this directive happens to be the one which cause this node to be anchored
						// and its value did not change, we can just quit the updating al together
						// since nothing else will update this node
						return false;
					}
				} catch (e: any) {
					this.component.onError(new Error(`"${directive.name}" on ${$.get(this.node).rawNodeString}: ${e.message}`));
				}

				this.dirAnchors.set(directive, null)
			}
		}

		if (directiveNode === this.node) {
			this.anchorDir = null;
			this.anchor = this._switchNodeAndAnchor(directiveNode);

			if (this.property?.executables.length) {
				const newValue = this.property.executables.reduce((val, exc) => {
					return resolveExecutable(this.component, this.$context, exc, val);
				}, this.property.value)

				if (newValue !== (this.node as CWCO.ObjectLiteral)[this.property.name]) {
					updated = true;
					(this.node as CWCO.ObjectLiteral)[this.property.name] = newValue;
				}
			}

			for (let {name, value, executables} of this.attributes) {
				if (executables.length) {
					let newValue = executables.reduce((val, exc) => {
						return resolveExecutable(this.component, this.$context, exc, val);
					}, value);

					if ((this.node as HTMLElement).getAttribute(name) !== newValue) {
						updated = true;
						(this.node as HTMLElement).setAttribute(name, newValue);
					}
				}
			}

			this.tracks.forEach((track) => {
				track.updateNode();
			});

		} else {
			this.anchor = this._switchNodeAndAnchor(directiveNode);
		}

		return updated;
	}

	private _setTracks() {
		const dirPattern = new RegExp(`^(${Object.keys(directiveRegistry).join('|')})\\.?`);
		const {nodeName, nodeValue, textContent, attributes} = this.node as HTMLElement;
		const eventHandlers: Array<CWCO.EventHandlerTrack> = [];

		if (nodeName === '#text') {
			this.property = {
				name: 'nodeValue',
				value: nodeValue || '',
				executables: []
			}
		} else {
			const attrs = [];
			const isRepeatedNode = (this.node as HTMLElement)?.hasAttribute('repeat');

			if (nodeName === 'TEXTAREA') {
				this.property = {
					name: 'textContent',
					value: textContent || '',
					executables: []
				}
			} else if (nodeName === 'STYLE') {
				const selectorPattern = /[a-z:#\.*\[][^{}]*[^\s:]\s*(?={){/gmi;
				const propValueStylePattern = /[a-z][a-z-]*:([^;]*)(;|})/gmi;
				let styleText = (textContent ?? '');
				let match: RegExpExecArray | null = null;
				let executables: Array<CWCO.Executable> = [];

				while ((match = selectorPattern.exec(styleText)) !== null) {
					let propValueMatch: RegExpExecArray | null = null;
					let propValue = styleText.slice(selectorPattern.lastIndex);

					while ((propValueMatch = propValueStylePattern.exec(propValue)) !== null) {
						executables.push(...extractExecutableSnippetFromString(propValueMatch[1], ['[', ']']))
					}
				}

				if (executables.length) {
					this.property = {
						name: 'textContent',
						value: styleText,
						executables
					}
				}
			}

			// @ts-ignore
			for (let attr of [...attributes]) {
				if (dirPattern.test(attr.name)) {
					const directive = parseNodeDirective(this.node as HTMLElement, attr.name, attr.value);

					if (directiveRegistry[directive.name]) {
						const Dir = directiveRegistry[directive.name];
						directive.handler = new Dir(this.component);
					}

					switch (directive.name) {
						case 'if':
							this.directives.unshift(directive);
							break;
						case 'repeat':
							if (this.directives[0]?.name === 'if') {
								this.directives.splice(1, 0, directive);
							} else {
								this.directives.unshift(directive);
							}
							break;
						default:
							this.directives.push(directive);
					}

					(this.node as Element).removeAttribute(attr.name);
				} else if (attr.name.startsWith('on')) {
					eventHandlers.push({
						eventName: attr.name.slice(2).toLowerCase(),
						attribute: attr
					});
				} else {
					attrs.push(attr)
				}
			}

			eventHandlers.forEach(({eventName, fn, attribute}) => {
				(this.node as HTMLElement).removeAttribute(attribute.name);

				if (!fn && !isRepeatedNode) {
					this.node.addEventListener(eventName, getEventHandlerFunction(this.component, this.$context, attribute));
				}
			});

			for (let attr of attrs) {
				if (attr.value.trim()) {
					this.attributes.push({
						name: attr.name,
						value: attr.value,
						executables: extractExecutableSnippetFromString(attr.value)
					})
				}
			}
		}

		if (this.property?.value.trim() && !this.property.executables.length) {
			this.property.executables = extractExecutableSnippetFromString(this.property.value)
		}

		this.empty = !this.directives.length &&
			!this.attributes.some(attr => attr.executables.length) &&
			!this.property.executables.length;
	}

	private _createDefaultAnchor() {
		return document.createComment(` ${this.node.nodeValue ?? (this.node as HTMLElement).outerHTML} `)
	}

	private _switchNodeAndAnchor(dirNode: HTMLElement | Node | Comment | Array<Element>) {
		if (dirNode === this.anchor) {
			return dirNode;
		}

		let dirIsArray = Array.isArray(dirNode);

		if (
			(dirIsArray && !(dirNode as Array<Element>).length) ||
			(!dirIsArray && !(/[831]/.test(`${(dirNode as Node).nodeType}`)))
		) {
			dirNode = this._createDefaultAnchor();
			dirIsArray = false;
		}

		const anchorIsArray = Array.isArray(this.anchor);
		const anchorEl = document.createComment('bfs')
		let nextEl: Element | Comment | Text = anchorEl;

		if (anchorIsArray) {
			(this.anchor as Array<Element>)[0]?.parentNode?.insertBefore(nextEl, (this.anchor as Array<Element>)[0]);
		} else {
			(this.anchor as HTMLElement).before(nextEl);
		}

		if (dirIsArray) {
			for (let el of (dirNode as Array<Element>)) {
				if (!el.isConnected) {
					nextEl.after(el);
					this._trackNode(el);
					$.get(el).shadowNode = this.node;
				}

				nextEl = el;
			}
		} else {
			nextEl.after(dirNode as Node);

			if (!$.has(dirNode)) {
				this._trackNode(dirNode as Node);
			}
		}

		if (anchorIsArray) {
			for (let el of (this.anchor as Array<Element>)) {
				if (!dirIsArray || !(dirNode as Array<Element>).includes(el)) {
					el.parentNode?.removeChild(el);
					this._unTrackNode(el);
				}
			}
		} else if (this.anchor !== dirNode) {
			(this.anchor as Node).parentNode?.removeChild(this.anchor as Node);
			this._unTrackNode(this.anchor as Node);
		}

		anchorEl.parentNode?.removeChild(anchorEl);

		this.anchor = dirNode;

		return dirNode;
	}

	private _trackNode(n: Node) {
		trackNode(n, this.component, {
			tracks: this.tracks
		})
	}

	private _unTrackNode(n: Node) {
		if (n !== this.node) {
			this.tracks.delete(n);
			n.childNodes.forEach(c => this._unTrackNode(c));
		}
	}

}
