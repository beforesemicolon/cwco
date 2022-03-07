import {CWCO} from "../../cwco";
import {$} from "../../core/$";

export function defineNodeContextMetadata(node: Node) {
	if ($.has(node) && $.get(node)?.$context) {
		return;
	}

	let ctx: CWCO.ObjectLiteral = {};
	const dt: CWCO.ObjectLiteral = $.get(node) || {};

	dt.updateContext = (newCtx: CWCO.ObjectLiteral | null = null) => {
		const oldCtx = ctx;

		if (newCtx && typeof newCtx === 'object' && Object.keys(newCtx).length) {
			ctx = {...ctx, ...newCtx};
		}

		return {oldCtx, newCtx: ctx};
	}

	Object.defineProperty(dt, '$context', {
		get() {
			return {...$.get(getParent(node))?.$context, ...ctx};
		}
	})

	$.set(node, dt);
}

function getParent(node: Node) {
	return node.parentNode instanceof ShadowRoot
		? node.parentNode.host
		: node.parentNode
}

