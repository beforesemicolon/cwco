// cwco, copyright (c) by Elson Correia / Before Semicolon
// Distributed under an MIT license: https://github.com/beforesemicolon/cwco/blob/master/LICENSE
import {WebComponent} from './core/WebComponent';
import {Directive} from './core/Directive';
import {ContextProviderComponent} from './core/ContextProviderComponent';
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
