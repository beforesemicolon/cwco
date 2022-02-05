// cwco, copyright (c) by Elson Correia / Before Semicolon
// Distributed under an MIT license: https://github.com/beforesemicolon/cwco/blob/master/LICENSE
import {WebComponent} from './core/web-component';
import {Directive} from './core/directive';
import {ContextProviderComponent} from './core/context-provider-component';
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
