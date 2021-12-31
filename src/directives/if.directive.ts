import {Directive} from "../directive";

export class If extends Directive {
	render(condition: boolean, {element, anchorNode}: directiveRenderOptions) {
		return condition
			? element
			: (anchorNode || new Comment(` if: ${condition} `));
	}
}

