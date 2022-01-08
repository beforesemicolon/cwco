import {getComponentNodeEventListener} from "./get-component-node-event-listener";
import {CWCO} from "../cwco";

export function getEventHandlerFunction(component: CWCO.WebComponent, nodeData: CWCO.ObjectLiteral, attribute: Attr): CWCO.EventListenerCallback | null {
	const props = Array.from(new Set([...Object.getOwnPropertyNames(nodeData), ...component.$properties]));
	const values = props.map(k => {
		return nodeData[k] ?? component[k] ?? null;
	});

	const fn = getComponentNodeEventListener(component, attribute.name, attribute.value, props, values);

	if (fn) {
		return fn;
	} else {
		component.onError(new Error(`${component.constructor.name}: Invalid event handler for "${attribute.name}" >>> "${attribute.value}".`))
	}

	return null
}
