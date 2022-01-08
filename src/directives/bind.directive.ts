import {Directive} from "../directive";
import {CWCO} from "../cwco";

export class Bind extends Directive {
	parseValue(value: string, prop: string | null) {
		return `["${(prop || '').trim()}", "${value}"]`;
	}

	render([prop, value]: [string, any], {element, anchorNode}: CWCO.directiveRenderOptions) {
		if (prop) {
			(element as CWCO.ObjectLiteral)[prop] = value;
		} else {
			element.textContent = value;
		}

		return element;
	}
}

