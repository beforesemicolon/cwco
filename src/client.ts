// cwco, copyright (c) by Elson Correia
// Distributed under an MIT license: https://github.com/beforesemicolon/cwco/blob/master/LICENSE

import {WebComponent} from './web-component';
import {Directive} from './directive';
import {ContextProviderComponent} from './context-provider-component';
import {html} from "./utils/html";

// @ts-ignore
if (window) {
	// @ts-ignore
	window.WebComponent = WebComponent;
	// @ts-ignore
	window.ContextProviderComponent = ContextProviderComponent;
	// @ts-ignore
	window.Directive = Directive;
	// @ts-ignore
	window.html = html;
}
