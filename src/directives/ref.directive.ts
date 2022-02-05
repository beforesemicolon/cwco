import {Directive} from "../core/directive";
import {CWCO} from "../cwco";

export class Ref extends Directive {
	parseValue(value: string): string {
		return `"${value}"`;
	}

	render(name: string, {element}: CWCO.directiveRenderOptions) {
		if (/^[a-z$_][a-z0-9$_]*$/i.test(name)) {
			this.setRef(name, element);
			return element;
		}

		throw new Error(`Invalid "ref" property name "${name}"`)
	}
}

