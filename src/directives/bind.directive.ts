import {Directive} from "../directive";

export class Bind extends Directive {
	parseValue(value: string, prop: string | null) {
		return `['${(prop || '').trim()}', "${value}"]`;
	}

	render([prop, value]: [string, any], {element, anchorNode}: directiveRenderOptions) {
		if (prop) {
			(element as ObjectLiteral)[prop] = value;
		} else {
			element.textContent = value;
		}

		return element;
	}
}

