"use strict";
exports.__esModule = true;
exports.Directive = void 0;
var registry_1 = require("../directives/registry");
var metadata_1 = require("./metadata");
var define_node_context_metadata_1 = require("../tracker/utils/define-node-context-metadata");
var Directive = /** @class */ (function () {
    function Directive(component) {
        metadata_1.$.set(this, { component: component });
    }
    Directive.register = function (name) {
        if (name === void 0) { name = ''; }
        name = (name || this.name).toLowerCase();
        if (!registry_1.directiveRegistry.hasOwnProperty(name)) {
            registry_1.directiveRegistry[name] = this;
        }
    };
    Directive.prototype.parseValue = function (value, prop) {
        return value;
    };
    Directive.prototype.render = function (val, _a) {
        var element = _a.element;
        return element;
    };
    Directive.prototype.setRef = function (name, node) {
        var currRef = metadata_1.$.get(this).component.$refs[name];
        if (currRef === undefined) {
            metadata_1.$.get(this).component.$refs[name] = node;
        }
        else if (Array.isArray(currRef)) {
            !currRef.includes(node) && currRef.push(node);
        }
        else if (currRef !== node) {
            metadata_1.$.get(this).component.$refs[name] = [currRef, node];
        }
    };
    Directive.prototype.getContext = function (node) {
        var _a;
        return (_a = metadata_1.$.get(node).$context) !== null && _a !== void 0 ? _a : null;
    };
    Directive.prototype.updateContext = function (node, newCtx) {
        var _a;
        define_node_context_metadata_1.defineNodeContextMetadata(node);
        (_a = metadata_1.$.get(node)) === null || _a === void 0 ? void 0 : _a.updateContext(newCtx);
    };
    return Directive;
}());
exports.Directive = Directive;
