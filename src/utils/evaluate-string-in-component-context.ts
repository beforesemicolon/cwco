import {CWCO} from "../cwco";

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
		...Object.getOwnPropertyNames(ctx),
		...component.$properties
	]));

	return (
		new Function(...keys, `"use strict";\n return ${executable};`)
	).apply(component, keys.map((key: string) => nodeData[key] ?? component[key] ?? ctx[key] ?? null)) ?? '';
}
