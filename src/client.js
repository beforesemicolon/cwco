"use strict";
// cwco, copyright (c) by Elson Correia / Before Semicolon
// Distributed under an MIT license: https://github.com/beforesemicolon/cwco/blob/master/LICENSE
exports.__esModule = true;
var web_component_1 = require("./core/web-component");
var directive_1 = require("./core/directive");
var context_provider_component_1 = require("./core/context-provider-component");
var html_1 = require("./utils/html");
// @ts-ignore
if (window) {
    // @ts-ignore
    window.WebComponent = web_component_1.WebComponent;
    // @ts-ignore
    window.ContextProviderComponent = context_provider_component_1.ContextProviderComponent;
    // @ts-ignore
    window.Directive = directive_1.Directive;
    // @ts-ignore
    window.html = html_1.html;
}
