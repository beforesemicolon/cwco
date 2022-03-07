import {directiveRegistry} from "../directives/registry";
import {$} from "./$";
import {defineNodeContextMetadata} from "../tracker/utils/define-node-context-metadata";
import {CWCO} from "../cwco";

export class Directive implements CWCO.Directive  {
	constructor(component: CWCO.WebComponent) {
		$.set(this, {component})
	}

	static register(name: string = '') {
		name = (name || this.name).toLowerCase();

		if (!directiveRegistry.hasOwnProperty(name)) {
			directiveRegistry[name] = this;
		}
	}

	parseValue(value: string, prop: string | null) {
		return value;
	}

	render(val: unknown, {element}: CWCO.directiveRenderOptions): CWCO.directiveRenderOptions['anchorNode'] {
		return element;
	}

	setRef(name: string, node: Node) {
		const currRef = $.get(this).component.$refs[name];

		if (currRef === undefined) {
			$.get(this).component.$refs[name] = node;
		} else if(Array.isArray(currRef)) {
			!currRef.includes(node) && currRef.push(node);
		} else if(currRef !== node) {
			$.get(this).component.$refs[name] = [currRef, node];
		}
	}

	getContext(node: Node) {
		return $.get(node).$context ?? null;
	}

	updateContext(node: Node, newCtx: CWCO.ObjectLiteral) {
		defineNodeContextMetadata(node);
		$.get(node)?.updateContext(newCtx);
	}
}
