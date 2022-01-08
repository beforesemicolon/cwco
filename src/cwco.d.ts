import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";

declare namespace CWCO {
	export interface booleanAttributes {
		[key: string]: {
			value: boolean;
			name: string;
		}
	}
	
	export interface DirectiveValue {
		name: string;
		value: string;
		prop: string | null;
		handler?: Directive;
	}
	
	export interface Directive {
		parseValue: (value: string, prop: string | null) => string;
		render: (val: any, options: directiveRenderOptions) => directiveRenderOptions['anchorNode'];
		updateContext: (node: Node, ctx: ObjectLiteral) => void;
		getContext: (node: Node) => void
		[key: string]: any;
	}
	
	export interface DirectiveConstructor {
		new (component: WebComponent): CWCO.Directive;
		
		register: (name?: string) =>  void;
	}
	
	export interface directiveRenderOptions {
		element: HTMLElement,
		rawElementOuterHTML: string,
		anchorNode: Text | Comment | Element | Array<Element> | null
	}
	
	export type EventHandlerTrack = {
		eventName: string;
		attribute: Attr;
		fn?: EventListenerCallback;
	};
	
	export type EventListenerCallback = (event: Event) => void;
	
	export type Executable = {
		from: number;
		to: number;
		match: string;
		executable: string;
	}
	
	export interface NodeTrack {
		node: HTMLElement | Node | WebComponent;
		anchor: HTMLElement | Node | Comment | Array<Element>;
		tracks: Map<Node, NodeTrack>;
		attributes: Array<{
			name: string;
			value: string;
			executables: Array<Executable>;
		}>;
		empty: boolean;
		directives: Array<DirectiveValue>;
		property: null | {
			name: string;
			value: string;
			executables: Array<Executable>;
		};
		updateNode: () => void;
		$context: ObjectLiteral;
	}
	
	export type ObjectLiteral = {[key: string]: any};
	
	export type ObserverCallback = (ctx: ObjectLiteral) => void;
	
	export type onUpdateCallback = (property: string, oldValue: unknown, newValue: unknown) => void;
	
	export type Refs = {[key: string]: Node | Node[]};
	
	export interface trackerOptions {
		trackOnly?: boolean;
		tracks: Map<Node, NodeTrack>;
	}
	
	export interface WebComponent extends HTMLElement {
		templateId: string;
		readonly root: HTMLElement | ShadowRoot | null;
		readonly mounted: boolean;
		readonly template: string;
		readonly stylesheet: string;
		readonly customSlot: boolean;
		
		readonly $context: ObjectLiteral;
		readonly $refs: Refs;
		readonly $properties: Array<string>;
		readonly _childNodes: Array<Node>;
		
		updateContext: (ctx: ObjectLiteral) => void;
		
		onMount: () => void;
		onDestroy: () => void;
		onAdoption: () => void;
		onUpdate: (name: string, oldValue: string, newValue: string) => void;
		onError: (error: any) => void;
		forceUpdate: () => void;
		
		[key: string]: any;
	}
	
	export interface WebComponentConstructor {
		new (): WebComponent;
		
		tagName: string;
		mode: ShadowRootModeExtended;
		observedAttributes: Array<string>;
		delegatesFocus: boolean;
		register: (tagName?: string) =>  void;
		registerAll: (components: Array<WebComponentConstructor>) => void;
		isRegistered: boolean;
		initialContext: ObjectLiteral;
	}
	
	export interface WebComponentMetadata {
		root: WebComponent | ShadowRoot;
		mounted: boolean;
		parsed: boolean;
		contextSource: WebComponent | null;
		contextSubscribers: Array<(ctx: object) => void>;
		unsubscribeCtx: (ctx: object) => void;
	}
}
