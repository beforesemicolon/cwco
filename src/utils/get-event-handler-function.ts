import {CWCO} from "../cwco";

export function getEventHandlerFunction(component: CWCO.WebComponent, nodeData: CWCO.ObjectLiteral, attribute: Attr): CWCO.EventListenerCallback {
	const props = Array.from(new Set([...Object.getOwnPropertyNames(nodeData), ...component.$properties]));
	const values = props.map(k => {
		return nodeData[k] ?? component[k] ?? null;
	});
	const value = attribute.value.trim()
	const match = value.match(/^(?:((?:this\.)?([a-z$_][a-z0-9$_\\.]*)\s*\((.*)\))|\{(.*)\})$/i);
	let func: Function;

	if (match) {
		let [_, fn, fnName, fnArgs, executable] = match;

		if (executable) {
			func = new Function('$event', ...props, `"use strict";\n ${executable};`);
		} else {
			// @ts-ignore
			if (typeof component[fnName] === 'function') {
				fn = fn.replace(/^this\./, '');
				func = new Function('$event', ...props, `"use strict";\n this.${fn}`);
			} else {
				func = new Function('$event', ...props, `"use strict";\n ${fn}`);
			}
		}
	} else {
		func = new Function('$event', ...props, `"use strict";\n ${value}`);
	}

	return (event: Event) => func.call(component, event, ...values);
}
