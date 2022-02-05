import {evaluateStringInComponentContext} from "./evaluate-string-in-component-context";
import {CWCO} from "../../cwco";
import {jsonParse} from "../../utils/json-parse";
import {jsonStringify} from "../../utils/json-stringify";

export function resolveExecutables(
	str: string,
	component: CWCO.WebComponent,
	nodeData: CWCO.ObjectLiteral,
	executables: Array<CWCO.Executable>
) {
	const parts: Array<any> = [];
	let lastIndex = 0;
	let isString = true;

	if (executables.length) {
		for (let {from, to, executable} of executables) {
			if (lastIndex !== from) {
				parts.push(str.slice(lastIndex, from));
			}

			lastIndex = to + 1;

			const res = evaluateStringInComponentContext(executable, component, nodeData);

			isString = isString && typeof res === 'string';

			parts.push(res)
		}

		if (lastIndex !== str.length) {
			parts.push(str.slice(lastIndex));
		}
	} else {
		parts.push(str);
	}

	if (!isString && parts.length === 1) {
	    return parts[0]
	}

	return parts.map(jsonStringify).join('');
}
