import {CWCO} from "../../cwco";

export function evaluateStringInComponentContext(
	executable: string,
	component: CWCO.WebComponent,
	nodeData: CWCO.ObjectLiteral = {}
) {
	if (!executable.trim()) {
		return '';
	}

	const ctx = component.$context;
	const keys = Array.from(new Set([
		...Object.getOwnPropertyNames(nodeData),
		...component.$properties,
		...Object.getOwnPropertyNames(ctx),
	]));
	const values = keys.map((key: string) => {
		return nodeData[key] ?? component[key] ?? ctx[key] ?? null
	})

	return (
		new Function(...keys, `"use strict";\n return ${executable};`)
	).apply(component, values) ?? '';
}
