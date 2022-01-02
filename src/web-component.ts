// simply importing directive here will automatically register them and make them available for
// anything later on
import './directives';
import booleanAttr from './utils/boolean-attributes.json';
import {$} from "./metadata";
import {parse} from './utils/parse';
import {setComponentPropertiesFromObservedAttributes} from './utils/set-component-properties-from-observed-attributes';
import {setupComponentPropertiesForAutoUpdate} from './utils/setup-component-properties-for-auto-update';
import {turnCamelToKebabCasing} from './utils/turn-camel-to-kebab-casing';
import {turnKebabToCamelCasing} from './utils/turn-kebab-to-camel-casing';
import {getStyleString} from './utils/get-style-string';
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import {trackNode} from "./utils/track-node";
import {jsonParse} from "./utils/json-parse";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";
import {resolveHtmlEntities} from "./utils/resolve-html-entities";

/**
 * a extension on the native web component API to simplify and automate most of the pain points
 * when it comes to creating and working with web components on the browser
 */
export class WebComponent extends HTMLElement {
	readonly $refs: Refs = {};
	$properties: Array<string> = ['$context', '$refs'];
	/**
	 * the id of the template tag placed in the body of the document which contains the template content
	 */
	templateId: string = '';
	/**
	 * style for the component whether inside the style tag, as object or straight CSS string
	 */
	private _stylesheet: string = '';
	public get stylesheet(): string {
        return this._stylesheet;
    }
    public set stylesheet(value: string) {
        this._stylesheet = value;
    }
	/**
	 * template for the element HTML content
	 */
	private _template: string = '';
	public get template(): string {
        return this._template;
    }
    public set template(value: string) {
        this._template = value;
    }
	_childNodes: Array<Node> = [];
	
	constructor() {
		super();

		let {mode, observedAttributes, delegatesFocus} = this.constructor as WebComponentConstructor;

		if (!$.has(this)) {
			$.set(this, {})
		}

		const meta = $.get(this);

		meta.root = this;
		meta.mounted = false;
		meta.parsed = false;
		meta.clearAttr = false;
		meta.tracks = new Map();
		meta.unsubscribeCtx = () => {};
		meta.attrPropsMap = observedAttributes.reduce((map, attr) => ({
			...map,
			[attr]: turnKebabToCamelCasing(attr)
		}), {} as ObjectLiteral);

		if (mode !== 'none') {
			$.get(this).root = this.attachShadow({mode, delegatesFocus});
		}
	}
	
	/**
	 * an array of attribute names as they will look in the html tag
	 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elementsusing_the_lifecycle_callbacks
	 * @type {[]}
	 */
	static observedAttributes: Array<string> = [];
	
	/**
	 * shadow root mode
	 * https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode
	 * plus an additional option of "none" to signal you dont want
	 * the content to be places inside the shadow root but directly under the tag
	 * @type {string}
	 */
	static mode = ShadowRootModeExtended.OPEN;
	
	/**
	 * shadow root delegate focus option
	 * https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus
	 * @type {boolean}
	 */
	static delegatesFocus = false;
	
	/**
	 * a valid name of the html tag
	 * @type {string}
	 */
	static tagName = '';
	
	/**
	 * the initial context data for the component
	 */
	static initialContext = {};
	
	/**
	 * parses special template HTML string taking in consideration
	 * all the additional syntax specific to this framework
	 */
	static parseHTML(markup: string): DocumentFragment {
		return parse(markup)
	}
	
	/**
	 * registers the component with the CustomElementRegistry taking an optional tag name if not
	 * specified as static member of the class as tagName
	 * @param tagName
	 */
	static register(tagName?: string | undefined) {
		tagName = typeof tagName === 'string' && tagName
			? tagName
			: typeof this.tagName === 'string' && this.tagName
				? this.tagName
				: turnCamelToKebabCasing(this.name);
		
		this.tagName = tagName;
		
		if (!customElements.get(tagName)) {
			customElements.define(tagName, this);
		}
	}
	
	/**
	 * registers a list of provided web component classes
	 * @param components
	 */
	static registerAll(components: Array<WebComponentConstructor>) {
		components.forEach(comp => comp.register());
	}
	
	/**
	 * returns whether the component is registered or not
	 */
	static get isRegistered() {
		return customElements.get(this.tagName) !== undefined;
	}
	
	/**
	 * whether or not the component should use the real slot element or mimic its behavior
	 * when rendering template
	 */
	get customSlot() {
		return false;
	}
	
	/**
	 * the root element. If shadow root present it will be the shadow root otherwise
	 * the actual element
	 * @returns {*}
	 */
	get root(): HTMLElement | ShadowRoot | null {
		return (this.constructor as WebComponentConstructor).mode === 'closed' ? null : $.get(this).root;
	}
	
	/**
	 * whether or not the element is attached to the DOM and works differently than Element.isConnected
	 * @returns {boolean}
	 */
	get mounted() {
		return $.get(this)?.mounted ?? false;
	}
	
	get parsed() {
		return $.get(this).parsed;
	}
	
	get $context(): ObjectLiteral {
		return $.get(this).$context;
	}
	
	updateContext(ctx: ObjectLiteral) {
		$.get(this).updateContext(ctx);
	}
	
	connectedCallback() {
		defineNodeContextMetadata(this);
		const {initialContext, observedAttributes, name} = this.constructor as WebComponentConstructor;
		const {parsed, tracks, root, attrPropsMap} = $.get(this);

		if (Object.keys(initialContext).length) {
			$.get(this).updateContext(initialContext);
		}

		const onPropUpdate = (prop: string, oldValue: any, newValue: any) => {
			if (this.mounted) {
				this.forceUpdate();
				this.onUpdate(prop, oldValue, newValue);
			} else if(this.parsed) {
				this.onError(new Error(`[Possibly a memory leak]: Cannot set property "${prop}" on unmounted component.`));
			}
		};

		try {
			$.get(this).unsubscribeCtx = $.get(this).subscribe((newContext: ObjectLiteral) => {
				onPropUpdate('$context', $.get(this).$context, newContext);
			})

			$.get(this).mounted = true;

			/*
			only need to parse the element the very first time it gets mounted

			this will make sure that if the element is removed from the dom and mounted again
			all that needs to be done if update the DOM to grab the possible new context and updated data
			 */
			if (parsed) {
				this.updateContext({});
			} else {

				this.$properties.push(
					...setComponentPropertiesFromObservedAttributes(this, observedAttributes, attrPropsMap, onPropUpdate),
					...setupComponentPropertiesForAutoUpdate(this, onPropUpdate)
				)
				
				Object.freeze(this.$properties);
				
				let contentNode;
				const hasShadowRoot = (this.constructor as WebComponentConstructor).mode !== 'none';
				const style = getStyleString(this.stylesheet, (this.constructor as WebComponentConstructor).tagName, hasShadowRoot);
				let temp: string = this.template;
				
				if (!temp && this.templateId) {
					const t = document.getElementById(this.templateId);
					
					temp = t?.nodeName === 'TEMPLATE' ? t.innerHTML : temp;
				}
				
				contentNode = parse(resolveHtmlEntities(style + temp));

				this._childNodes = Array.from(this.childNodes);
				
				if (this.customSlot) {
					this.innerHTML = '';
				}
				
				trackNode(contentNode, this, {
					tracks,
				});
				
				const {tagName, mode} = (this.constructor as WebComponentConstructor);
				
				if (mode === 'none') {
					[
						...Array.from(contentNode.querySelectorAll('style')),
						...Array.from(contentNode.querySelectorAll('link')),
					].forEach((el: HTMLElement) => {
						const existingEl: HTMLStyleElement | null = document.head.querySelector(`${el.nodeName.toLowerCase()}.${tagName}`);
						
						if (existingEl) {
							existingEl.textContent = el.textContent;
						} else {
							document.head.appendChild(el);
						}
					})
				}
				
				$.get(this).parsed = true;
				root.appendChild(contentNode);
			}


			this.onMount();
		} catch (e) {
			this.onError(e as ErrorEvent);
		}
	}
	
	/**
	 * livecycle callback for when the element is attached to the DOM
	 */
	onMount() {
	}
	
	disconnectedCallback() {
		try {
			$.get(this).mounted = false;
			$.get(this).unsubscribeCtx();
			this.onDestroy();
		} catch (e) {
			this.onError(e as Error)
		}
	}
	
	/**
	 * livecycle callback for when the element is removed from the DOM
	 */
	onDestroy() {
	}
	
	attributeChangedCallback(name: string, oldValue: any, newValue: any) {
		if (newValue === null && !this.hasAttribute(name) && $.get(this).clearAttr) {
			$.get(this).clearAttr = false;
		} else if (this.mounted) {
			try {
				if (!(name.startsWith('data-') || name === 'class' || name === 'style')) {
					const prop: any = $.get(this).attrPropsMap[name];

					// @ts-ignore
					this[prop] = booleanAttr.hasOwnProperty(prop)
						? this.hasAttribute(name)
						: jsonParse(newValue);
				} else {
					this.forceUpdate();
					this.onUpdate(name, oldValue, newValue);
				}
			} catch (e) {
				this.onError(e as ErrorEvent)
			}
		}
	}
	
	/**
	 * livecycle callback for when the element attributes or class properties are updated
	 */
	onUpdate(name: string, oldValue: unknown, newValue: unknown) {
	}
	
	/**
	 * updates any already tracked node with current component data including context and node level data.
	 */
	forceUpdate() {
		if (this.mounted) {
			cancelAnimationFrame($.get(this).updateFrame);
			$.get(this).updateFrame = requestAnimationFrame(() => {
				$.get(this).tracks.forEach((t: NodeTrack) => {
					t.updateNode();
				});
			});

			return true;
		}

		return false;
	}
	
	adoptedCallback() {
		try {
			this.onAdoption();
		} catch (e) {
			this.onError(e as Error)
		}
	}
	
	/**
	 * livecycle callback for when element is moved into a new document
	 */
	onAdoption() {
	}
	
	/**
	 * error callback for when an error occurs
	 */
	onError(error: ErrorEvent | Error) {
		console.error(this.constructor.name, error);
	}
}

