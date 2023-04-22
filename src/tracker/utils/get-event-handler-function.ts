import {CWCO} from "../../cwco";
import {$} from "../../core/$";

export function getEventHandlerFunction(component: CWCO.WebComponent, node: Node, attribute: Attr): CWCO.EventListenerCallback {
	let nodeData = $.get(node).$context;
	const props = Array.from(new Set([...Object.getOwnPropertyNames(nodeData), ...component.$properties]));
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

	return (event: Event) => {
		nodeData = $.get(node).$context;
		const values = props.map(k => nodeData[k] ?? component[k] ?? null);
		
		func.call(component, event, ...values)
	};
}
