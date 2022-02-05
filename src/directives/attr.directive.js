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
exports.Attr = void 0;
var directive_1 = require("../core/directive");
var turn_kebab_to_camel_casing_1 = require("../utils/turn-kebab-to-camel-casing");
var turn_camel_to_kebab_casing_1 = require("../utils/turn-camel-to-kebab-casing");
var boolean_attributes_json_1 = require("../core/boolean-attributes.json");
var Attr = /** @class */ (function (_super) {
    __extends(Attr, _super);
    function Attr() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Attr.prototype.parseValue = function (value, prop) {
        var _a = (prop !== null && prop !== void 0 ? prop : '').split('.'), attrName = _a[0], _b = _a[1], property = _b === void 0 ? null : _b;
        var commaIdx = value.lastIndexOf(',');
        return "[\"" + attrName + "\", \"" + (property || '') + "\", " + (commaIdx >= 0 ? value.slice(commaIdx + 1).trim() : value) + ", \"" + (commaIdx >= 0 ? value.slice(0, commaIdx).trim() : '') + "\"]";
    };
    Attr.prototype.render = function (_a, _b) {
        var _c;
        var attrName = _a[0], property = _a[1], shouldAdd = _a[2], val = _a[3];
        var element = _b.element;
        switch (attrName) {
            case 'style':
                if (property) {
                    property = turn_kebab_to_camel_casing_1.turnKebabToCamelCasing(property);
                    element.style[property] = shouldAdd ? val : '';
                }
                else {
                    (_c = val
                        .match(/([a-z][a-z-]+)(?=:):([^;]+)/g)) === null || _c === void 0 ? void 0 : _c.forEach(function (style) {
                        var _a = style.split(':').map(function (s) { return s.trim(); }), name = _a[0], styleValue = _a[1];
                        if (shouldAdd) {
                            element.style.setProperty(name, styleValue);
                        }
                        else {
                            element.setAttribute('style', element.style.cssText.replace(new RegExp(name + "\\s*:\\s*" + styleValue + ";?", 'g'), ''));
                        }
                    });
                }
                break;
            case 'class':
                if (property) {
                    if (shouldAdd) {
                        element.classList.add(property);
                    }
                    else {
                        element.classList.remove(property);
                    }
                }
                else {
                    var classes = val.split(/\s+/g);
                    if (shouldAdd) {
                        classes.forEach(function (cls) { return element.classList.add(cls); });
                    }
                    else {
                        classes.forEach(function (cls) { return element.classList.remove(cls); });
                    }
                }
                break;
            case 'data':
                if (property) {
                    if (shouldAdd) {
                        element.dataset[turn_kebab_to_camel_casing_1.turnKebabToCamelCasing(property)] = val;
                    }
                    else {
                        element.removeAttribute("data-" + turn_camel_to_kebab_casing_1.turnCamelToKebabCasing(property));
                    }
                }
                break;
            default:
                if (attrName) {
                    if (shouldAdd) {
                        element.setAttribute(attrName, boolean_attributes_json_1["default"].hasOwnProperty(attrName) ? '' : "" + (val || shouldAdd));
                    }
                    else {
                        element.removeAttribute(attrName);
                    }
                }
        }
        return element;
    };
    return Attr;
}(directive_1.Directive));
exports.Attr = Attr;
