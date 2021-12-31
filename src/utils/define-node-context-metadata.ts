import {$} from "../metadata";

export function defineNodeContextMetadata(node: Node) {
	if ($.has(node) && $.get(node)?.$context) {
		return;
	}

	let ctx: ObjectLiteral = proxyCtx({}, node);
	let subs: Array<ObserverCallback> = [];
	const dt: ObjectLiteral = $.get(node) || {};

	dt.subscribe = (cb: ObserverCallback) => {
		subs.push(cb);
		return () => {
			subs = subs.filter((c) => c !== cb);
		}
	}

	dt.updateContext = (newCtx: ObjectLiteral | null = null) => {
		if (newCtx && typeof newCtx === 'object') {
			ctx = proxyCtx({...ctx, ...newCtx}, node);
		}

		$.get(node)?.track?.updateNode();
		notify();
	}

	Object.defineProperty(dt, '$context', {
		get() {
			return ctx;
		}
	})

	function notify() {
		((node as WebComponent).root ?? node).childNodes
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

function proxyCtx(obj: ObjectLiteral, node: Node) {
	let keys = Object.keys(obj);

	return new Proxy(obj, {
		get(obj: ObjectLiteral, n: string) {
			let res = Reflect.get(obj, n);

			return res ?? Reflect.get($.get(getParent(node))?.$context ?? {}, n);
		},
		ownKeys(): ArrayLike<string | symbol> {
			return Array.from(new Set([
				...keys,
				...Reflect.ownKeys($.get(getParent(node))?.$context ?? {})
			]));
		},
	});
}

