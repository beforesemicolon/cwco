import {evaluateStringInComponentContext} from "./evaluate-string-in-component-context";

export function resolveExecutable(component: WebComponent, nodeData: ObjectLiteral, {match, executable}: Executable, newValue: string) {
	let res = evaluateStringInComponentContext(executable, component, nodeData);

	if (res && typeof res === 'object') {
		try {
			res = JSON.stringify(res)
		} catch (e) {
		}
	}

	return newValue.replace(match, res);
}
