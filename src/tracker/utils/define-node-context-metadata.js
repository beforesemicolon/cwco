"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.defineNodeContextMetadata = void 0;
var metadata_1 = require("../../core/metadata");
function defineNodeContextMetadata(node) {
    var _a;
    if (metadata_1.$.has(node) && ((_a = metadata_1.$.get(node)) === null || _a === void 0 ? void 0 : _a.$context)) {
        return;
    }
    var ctx = {};
    var subs = [];
    var dt = metadata_1.$.get(node) || {};
    dt.subscribe = function (cb) {
        subs.push(cb);
        return function () {
            subs = subs.filter(function (c) { return c !== cb; });
        };
    };
    dt.updateContext = function (newCtx) {
        if (newCtx === void 0) { newCtx = null; }
        var oldCtx = ctx;
        if (newCtx && typeof newCtx === 'object' && Object.keys(newCtx).length) {
            ctx = __assign(__assign({}, ctx), newCtx);
        }
        return { oldCtx: oldCtx, newCtx: ctx };
    };
    Object.defineProperty(dt, '$context', {
        get: function () {
            var _a;
            return __assign(__assign({}, (_a = metadata_1.$.get(getParent(node))) === null || _a === void 0 ? void 0 : _a.$context), ctx);
        }
    });
    metadata_1.$.set(node, dt);
}
exports.defineNodeContextMetadata = defineNodeContextMetadata;
function getParent(node) {
    return node.parentNode instanceof ShadowRoot
        ? node.parentNode.host
        : node.parentNode;
}
