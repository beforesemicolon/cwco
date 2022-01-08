import {evaluateStringInComponentContext} from "./evaluate-string-in-component-context";
import {CWCO} from "../cwco";

export function resolveExecutable(component: CWCO.WebComponent, nodeData: CWCO.ObjectLiteral, {match, executable}: CWCO.Executable, newValue: string) {
	let res = evaluateStringInComponentContext(executable, component, nodeData);

	if (res && typeof res === 'object') {
		try {
			res = JSON.stringify(res)
		} catch (e) {
		}
	}

	return newValue.replace(match, res);
}
