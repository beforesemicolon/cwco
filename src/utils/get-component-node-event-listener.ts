import {CWCO} from "../cwco";

export function getComponentNodeEventListener(
	component: CWCO.WebComponent,
	name: string,
	value: string,
	props: Array<string> = [],
	values: Array<unknown> = [],
): CWCO.EventListenerCallback | null {
	value = value.trim()
	const match = value.match(/^(?:((?:this\.)?([a-z$_][a-z0-9$_]*)\s*\((.*)\))|\{(.*)\})$/i);

	if (match) {
		let [_, fn, fnName, fnArgs, executable] = match;

		if (executable) {
			const fn = new Function('$event', ...props, `"use strict";\n return ${executable};`);

			return (event: Event) => fn.call(component, event, ...values);
		} else {
			fn = fn.replace(/^this\./, '');
			const func = new Function('$event', ...props, `"use strict";\n return this.${fn}`);

			// @ts-ignore
			if (typeof component[fnName] === 'function') {
				return (event: Event) => func.call(component, event, ...values);
			}
		}
	}

	return null;
}
