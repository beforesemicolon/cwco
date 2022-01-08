import {$} from "../metadata";
import {CWCO} from "../cwco";

export function defineNodeContextMetadata(node: Node) {
	if ($.has(node) && $.get(node)?.$context) {
		return;
	}

	let ctx: CWCO.ObjectLiteral = {};
	let subs: Array<CWCO.ObserverCallback> = [];
	const dt: CWCO.ObjectLiteral = $.get(node) || {};

	dt.subscribe = (cb: CWCO.ObserverCallback) => {
		subs.push(cb);
		return () => {
			subs = subs.filter((c) => c !== cb);
		}
	}

	dt.updateContext = (newCtx: CWCO.ObjectLiteral | null = null) => {
		if (newCtx && typeof newCtx === 'object') {
			ctx = {...ctx, ...newCtx};
		}
		
		// if the node is not tracked (contains no bound prop or attr)
		// or is a component node which calling updateNode ended up not changing anything
		// we can continue to propagate the context
		// this is because if a track node ends up updated, it will automatically
		// update all its inner tracker which will read the context just fine
		if (!$.get(node).track || (!$.get(node).track.updateNode() && node.nodeName.includes('-'))) {
			notify();
		}
	}

	Object.defineProperty(dt, '$context', {
		get() {
			return {...$.get(getParent(node))?.$context, ...ctx};
		}
	})

	function notify() {
		((node as CWCO.WebComponent).root ?? node).childNodes
			.forEach((n) => {
				if (typeof $.get(n)?.updateContext === 'function') {
					$.get(n).updateContext();
				}
			});

		subs.forEach((cb) => {
			cb(dt.$context);
		});
	}

	$.set(node, dt);
}

function getParent(node: Node) {
	return node.parentNode instanceof ShadowRoot
		? node.parentNode.host
		: node.parentNode
}

