"use strict";
exports.__esModule = true;
exports.directives = void 0;
var if_directive_1 = require("./if.directive");
var ref_directive_1 = require("./ref.directive");
var attr_directive_1 = require("./attr.directive");
var repeat_directive_1 = require("./repeat.directive");
var bind_directive_1 = require("./bind.directive");
if_directive_1.If.register();
ref_directive_1.Ref.register();
attr_directive_1.Attr.register();
repeat_directive_1.Repeat.register();
bind_directive_1.Bind.register();
exports.directives = new Set([
    if_directive_1.If.name.toLowerCase(),
    ref_directive_1.Ref.name.toLowerCase(),
    attr_directive_1.Attr.name.toLowerCase(),
    repeat_directive_1.Repeat.name.toLowerCase(),
    bind_directive_1.Bind.name.toLowerCase(),
]);
