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
exports.ContextProviderComponent = void 0;
var ShadowRootModeExtended_enum_1 = require("../enums/ShadowRootModeExtended.enum");
var web_component_1 = require("./web-component");
/**
 * a special WebComponent that handles slot tag differently allowing for render template right into HTML files
 */
var ContextProviderComponent = /** @class */ (function (_super) {
    __extends(ContextProviderComponent, _super);
    function ContextProviderComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ContextProviderComponent.prototype, "customSlot", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContextProviderComponent.prototype, "template", {
        get: function () {
            return '<slot></slot>';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContextProviderComponent.prototype, "stylesheet", {
        get: function () {
            return ':host { display: block; }';
        },
        enumerable: false,
        configurable: true
    });
    ContextProviderComponent.mode = ShadowRootModeExtended_enum_1.ShadowRootModeExtended.NONE;
    return ContextProviderComponent;
}(web_component_1.WebComponent));
exports.ContextProviderComponent = ContextProviderComponent;
