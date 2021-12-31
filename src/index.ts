// cwco, copyright (c) by Elson Correia
// Distributed under an MIT license: https://github.com/beforesemicolon/cwco/blob/master/LICENSE

import {JSDOM} from 'jsdom';

const dom = new JSDOM()
global.HTMLElement = dom.window.HTMLElement;
(global as any).window = dom.window;
(global as any).customElements = dom.window.customElements;

export {WebComponent} from './web-component';
export {ContextProviderComponent} from './context-provider-component';
export {Directive} from './directive';
