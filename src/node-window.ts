// cwco, copyright (c) by Elson Correia / Before Semicolon
// Distributed under an MIT license: https://github.com/beforesemicolon/cwco/blob/master/LICENSE
import {JSDOM} from 'jsdom';

const dom = new JSDOM()
global.HTMLElement = dom.window.HTMLElement;
(global as any).window = dom.window;
(global as any).customElements = dom.window.customElements;
(global as any).document = dom.window.document;
(global as any).ShadowRoot = dom.window.ShadowRoot;

