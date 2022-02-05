"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Ref = void 0;
var directive_1 = require("../core/directive");
var Ref = /** @class */ (function (_super) {
    __extends(Ref, _super);
    function Ref() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Ref.prototype.parseValue = function (value) {
        return "\"" + value + "\"";
    };
    Ref.prototype.render = function (name, _a) {
        var element = _a.element;
        if (/^[a-z$_][a-z0-9$_]*$/i.test(name)) {
            this.setRef(name, element);
            return element;
        }
        throw new Error("Invalid \"ref\" property name \"" + name + "\"");
    };
    return Ref;
}(directive_1.Directive));
exports.Ref = Ref;
