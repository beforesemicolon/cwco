import {CWCO} from "../../cwco";

export function parseNodeDirective(node: Element, name: string, value: string): CWCO.DirectiveValue {
	const dot = name.indexOf('.');
	let prop = null;

	if (dot >= 0) {
		prop = name.slice(dot + 1);
		name = name.slice(0, dot).toLowerCase();
	}

	return {name, value, prop};
}
