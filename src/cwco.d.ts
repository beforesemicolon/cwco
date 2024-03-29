import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import {TrackType} from "./enums/track-type";

declare namespace CWCO {
	export interface booleanAttributes {
		[key: string]: {
			value: boolean;
			name: string;
		}
	}
	
	export interface StylesheetObject {
		[k: string]: Partial<CSSStyleDeclaration> | StylesheetObject | number
	}
	
	export type Stylesheet = StylesheetObject | string;
	
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
		setRef: (name: string, node: Node) => void;
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

	export interface Track {
		name: string;
		value: string;
		executables: Executable[];
		handler: DirectiveConstructor | null;
		prop: string | null;
		prevValue: any;
		type: TrackType;
	}

	export interface TracksMapByType {
		attribute: Track[];
		directive: Track[];
		property: Track[];
	}
	
	export type MountUnSubscriber = () => void;
	
	export type ObjectLiteral = {[key: string]: any};
	
	export type ObserverCallback = (ctx: ObjectLiteral) => void;
	
	export type onUpdateCallback = (property: string, oldValue: unknown, newValue: unknown) => void;
	
	export type Refs = {[key: string]: HTMLElement | HTMLElement[]};
	
	export interface WebComponent extends HTMLElement {
		templateId: string;
		readonly root: HTMLElement | ShadowRoot | null;
		readonly mounted: boolean;
		readonly template: string;
		readonly stylesheet: Stylesheet;
		readonly customSlot: boolean;
		
		readonly $context: ObjectLiteral;
		readonly $refs: Refs;
		readonly $properties: Array<string>;
		readonly _childNodes: Array<Node>;
		
		updateContext: (ctx: ObjectLiteral) => void;
		
		onMount: () => MountUnSubscriber | void;
		onDestroy: () => void;
		onAdoption: () => void;
		onUpdate: (name: string, oldValue: string, newValue: string) => void;
		onError: (error: any) => void;
		forceUpdate: (deep: boolean) => void;
		
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
}
