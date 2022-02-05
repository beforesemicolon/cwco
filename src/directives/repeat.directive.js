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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.Repeat = void 0;
var directive_1 = require("../core/directive");
var parse_1 = require("../parser/parse");
var Repeat = /** @class */ (function (_super) {
    __extends(Repeat, _super);
    function Repeat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Repeat.prototype.parseValue = function (value) {
        var idx = value.lastIndexOf(';');
        var iPart = value;
        var kPart = '';
        if (idx > 0) {
            iPart = value.slice(0, idx);
            kPart = value.slice(idx + 1);
        }
        var _a = (iPart + " ").split(/\s+as\s+/g).map(function (s) { return s.trim(); }), v = _a[0], _b = _a[1], vAs = _b === void 0 ? "$item" : _b;
        var _c = (kPart + " ").split(/\s+as\s+/g).map(function (s) { return s.trim(); }), k = _c[0], _d = _c[1], kAs = _d === void 0 ? "$key" : _d;
        return "[" + v + ", \"" + vAs + "\", \"" + (k === '$key' ? kAs : '') + "\"]";
    };
    Repeat.prototype.render = function (_a, _b) {
        var repeatData = _a[0], vAs = _a[1], kAs = _a[2];
        var element = _b.element, rawElementOuterHTML = _b.rawElementOuterHTML, anchorNode = _b.anchorNode;
        anchorNode = (anchorNode !== null && anchorNode !== void 0 ? anchorNode : []);
        var list = [];
        if (element.nodeType === 1) {
            var times = void 0;
            if (Number.isInteger(repeatData)) {
                times = repeatData;
            }
            else {
                repeatData = repeatData instanceof Set ? Object.entries(Array.from(repeatData))
                    : repeatData instanceof Map ? Array.from(repeatData.entries())
                        : repeatData[Symbol.iterator] ? Object.entries(__spreadArray([], repeatData))
                            : Object.entries(repeatData);
                times = repeatData.length;
            }
            for (var index = 0; index < times; index++) {
                if (anchorNode[index]) {
                    this.updateNodeContext(anchorNode[index], index, vAs, kAs, repeatData);
                    list.push(anchorNode[index]);
                    continue;
                }
                var el = parse_1.parse(rawElementOuterHTML).children[0];
                this.updateNodeContext(el, index, vAs, kAs, repeatData);
                list.push(el);
            }
        }
        return list;
    };
    Repeat.prototype.updateNodeContext = function (el, index, vAs, kAs, list) {
        var _a;
        var _b;
        if (list === void 0) { list = []; }
        var _c = (_b = list[index]) !== null && _b !== void 0 ? _b : [index, index + 1], key = _c[0], value = _c[1];
        // set context so this and inner nodes can catch these values
        this.updateContext(el, (_a = {},
            _a[vAs || '$item'] = value,
            _a[kAs || '$key'] = key,
            _a));
    };
    return Repeat;
}(directive_1.Directive));
exports.Repeat = Repeat;
