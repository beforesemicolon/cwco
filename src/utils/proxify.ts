import {isPrimitive} from "./is-primitive";

const TypedArray = Object.getPrototypeOf(Uint8Array);

export function proxify(name: string, object: any, notify: (name: string, o: any) => void = () => {
}, self = null): any {
	self = self ?? object;
	
	if (
		!object ||
		object.__isProxy || // ignore objects already gone through proxify
		isPrimitive(object) || // ignore primitives
		typeof object === 'function' || // ignore functions
		(
			// ignore any object that is not in this array or an object literal
			![Array, Map, Set, TypedArray].some(o => object instanceof o) &&
			(object.constructor && object.constructor.name !== 'Object')
		)
	) {
		return object;
	}

	return new Proxy(object, {
		get(obj, n: string) {
			if (n === "__isProxy") {
				return true;
			}
			
			if (n === "__raw") {
				return object;
			}
			
			let res = Reflect.get(obj, n);

			if (res) {
				if (typeof res === 'object') {
					return proxify(name, res, notify, self);
				}

				if (typeof res === 'function') {
					if (typeof n !== 'symbol') {
						// for each can be used to loop over the properties of an object
						// to change the value of each property which is the reason to proxify the items
						// but the same cannot be said to methods like map, reduce and filter
						// which return a new object and not the original one so for those
						// to have the change event triggered, the return objects must be used to replace the object
						// and get proxified in the process
						if (/forEach/.test(n)) {
							return (cb: (v: any, k: number, l: any) => void, thisArg?: any) => {
								obj[n]((v: any, k: number, l: any) => {
									cb.call(thisArg ?? obj, proxify(name, v, notify, self), k, l);
								}, thisArg ?? obj);
							};
						} else if (/values|entries|keys/.test(n)) {
							// keys need to also be proxified becuase they may be objects which are used in the
							// template for rendering
							return () => ({
								*[Symbol.iterator]() {
									if (n === 'entries') {
										for (const [k, v] of obj[n]()) {
											yield [proxify(name, k, notify, self), proxify(name, v, notify, self)];
										}
									} else {
										for (const v of obj[n]()) {
											yield proxify(name, v, notify, self);
										}
									}

								}
							})
						}

						return (...args: any[]) => {
							const r = res.apply(obj, args);

							// reading any item while it is still in the object should be proxified
							// to allow for detecting changes
							if (typeof r === 'object' && (
								(Array.isArray(obj) && /at|find/.test(n)) ||
								((obj instanceof Map) && /get/.test(n)) ||
								((obj instanceof WeakMap) && /get/.test(n))
							)) {
								return proxify(name, r, notify, self);
							}

							// this is done under the assumption that the function
							// will always update the object
							if (
								(Array.isArray(obj) && /push|pop|splice|shift|unshift|reverse|sort|fill|copyWithin/.test(n)) ||
								((obj instanceof Map) && /set|delete|clear/.test(n)) ||
								((obj instanceof Set) && /add|delete|clear/.test(n)) ||
								((obj instanceof WeakSet) && /add|delete/.test(n)) ||
								((obj instanceof WeakMap) && /set|delete/.test(n))
							) {
								notify(name, self);
							}

							return r;
						}
					} else {
						// make sure the object it bound to the function for when it is called
						res = res.bind(obj);
					}
				}
			}

			return res;
		},
		set(obj, n: string, value) {
			const res = Reflect.set(obj, n, value);

			notify(name, self);

			return res;
		},
		deleteProperty(target: any, p: string | symbol): boolean {
            const res = Reflect.deleteProperty(target, p);

            notify(name, self);

            return res;
        },
		defineProperty(target: any, p: string | symbol, attributes: PropertyDescriptor): boolean {
            const res = Reflect.defineProperty(target, p, attributes);

            notify(name, self);

            return res;
        },
	});
}
