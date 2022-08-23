import {Directive} from "../core/Directive";
import {CWCO} from "../cwco";

export class If extends Directive {
	render(condition: boolean, {element, anchorNode}: CWCO.directiveRenderOptions) {
		return condition
			? element
			: (anchorNode || new Comment(` if: ${condition} `));
	}
}

