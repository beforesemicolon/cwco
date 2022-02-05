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
exports.Bind = void 0;
var directive_1 = require("../core/directive");
var Bind = /** @class */ (function (_super) {
    __extends(Bind, _super);
    function Bind() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Bind.prototype.parseValue = function (value, prop) {
        return "[\"" + (prop || '').trim() + "\", \"" + value + "\"]";
    };
    Bind.prototype.render = function (_a, _b) {
        var prop = _a[0], value = _a[1];
        var element = _b.element, anchorNode = _b.anchorNode;
        if (prop) {
            element[prop] = value;
        }
        else {
            element.textContent = value;
        }
        return element;
    };
    return Bind;
}(directive_1.Directive));
exports.Bind = Bind;
