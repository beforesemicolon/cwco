import {Directive} from "../directive";

export class Ref extends Directive {
	parseValue(value: string): string {
		return `"${value}"`;
	}

	render(name: string, {element}: directiveRenderOptions) {
		if (/^[a-z$_][a-z0-9$_]*$/i.test(name)) {
			this.setRef(name, element);
			return element;
		}

		throw new Error(`Invalid "ref" property name "${name}"`)
	}
}

