import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import {WebComponent} from "./web-component";

/**
 * a special WebComponent that handles slot tag differently allowing for render template right into HTML files
 */
export class ContextProviderComponent extends WebComponent {
	get customSlot() {
		return true;
	}

	static mode = ShadowRootModeExtended.NONE;
	
	get template() {
		return '<slot></slot>';
	}

	get stylesheet() {
		return ':host { display: block; }';
	}
}
