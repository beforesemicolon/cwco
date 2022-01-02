import {directiveRegistry} from "./directives/registry";
import {$} from "./metadata";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";

export class Directive {
	constructor(component: WebComponent) {
		$.set(this, {component})
	}

	static register(name: string = '') {
		name = (name || this.name).toLowerCase();

		if (directiveRegistry[name] === undefined) {
			directiveRegistry[name] = this;
		}
	}

	parseValue(value: string, prop: string | null) {
		return value;
	}

	render(val: unknown, {element}: directiveRenderOptions): directiveRenderOptions['anchorNode'] {
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

	updateContext(node: Node, newCtx: ObjectLiteral) {
		defineNodeContextMetadata(node);
		$.get(node)?.updateContext(newCtx);
	}
}
