"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.proxify = void 0;
var is_primitive_1 = require("./is-primitive");
var TypedArray = Object.getPrototypeOf(Uint8Array);
function proxify(name, object, notify, self) {
    if (notify === void 0) { notify = function () {
    }; }
    if (self === void 0) { self = null; }
    self = self !== null && self !== void 0 ? self : object;
    if (!object ||
        object.__isProxy || // ignore objects already gone through proxify
        is_primitive_1.isPrimitive(object) || // ignore primitives
        typeof object === 'function' || // ignore functions
        (
        // ignore any object that is not in this array or an object literal
        ![Array, Map, Set, TypedArray].some(function (o) { return object instanceof o; }) &&
            (object.constructor && object.constructor.name !== 'Object'))) {
        return object;
    }
    return new Proxy(object, {
        get: function (obj, n) {
            if (n === "__isProxy") {
                return true;
            }
            var res = Reflect.get(obj, n);
            if (res) {
                if (typeof res === 'object') {
                    return proxify(name, res, notify, self);
                }
                if (typeof res === 'function') {
                    if (typeof n !== 'symbol') {
                        // for each can be used to loop over the properties of an object
                        // to change the value of each property which is the reason to proxify the items
                        // but the same cannot be said to methods like map, reduce and filter
                        // which return a new object and not the original one so for those
                        // to have the change event triggered, the return objects must be used to replace the object
                        // and get proxified in the process
                        if (/forEach/.test(n)) {
                            return function (cb, thisArg) {
                                obj[n](function (v, k, l) {
                                    cb.call(thisArg !== null && thisArg !== void 0 ? thisArg : obj, proxify(name, v, notify, self), k, l);
                                }, thisArg !== null && thisArg !== void 0 ? thisArg : obj);
                            };
                        }
                        else if (/values|entries|keys/.test(n)) {
                            // keys need to also be proxified becuase they may be objects which are used in the
                            // template for rendering
                            return function () {
                                var _a;
                                return (_a = {},
                                    _a[Symbol.iterator] = function () {
                                        var _i, _a, _b, k, v, _c, _d, v;
                                        return __generator(this, function (_e) {
                                            switch (_e.label) {
                                                case 0:
                                                    if (!(n === 'entries')) return [3 /*break*/, 5];
                                                    _i = 0, _a = obj[n]();
                                                    _e.label = 1;
                                                case 1:
                                                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                                                    _b = _a[_i], k = _b[0], v = _b[1];
                                                    return [4 /*yield*/, [proxify(name, k, notify, self), proxify(name, v, notify, self)]];
                                                case 2:
                                                    _e.sent();
                                                    _e.label = 3;
                                                case 3:
                                                    _i++;
                                                    return [3 /*break*/, 1];
                                                case 4: return [3 /*break*/, 9];
                                                case 5:
                                                    _c = 0, _d = obj[n]();
                                                    _e.label = 6;
                                                case 6:
                                                    if (!(_c < _d.length)) return [3 /*break*/, 9];
                                                    v = _d[_c];
                                                    return [4 /*yield*/, proxify(name, v, notify, self)];
                                                case 7:
                                                    _e.sent();
                                                    _e.label = 8;
                                                case 8:
                                                    _c++;
                                                    return [3 /*break*/, 6];
                                                case 9: return [2 /*return*/];
                                            }
                                        });
                                    },
                                    _a);
                            };
                        }
                        return function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var r = res.apply(obj, args);
                            // reading any item while it is still in the object should be proxified
                            // to allow for detecting changes
                            if (typeof r === 'object' && ((Array.isArray(obj) && /at|find/.test(n)) ||
                                ((obj instanceof Map) && /get/.test(n)) ||
                                ((obj instanceof WeakMap) && /get/.test(n)))) {
                                return proxify(name, r, notify, self);
                            }
                            // this is done under the assumption that the function
                            // will always update the object
                            if ((Array.isArray(obj) && /push|pop|splice|shift|unshift|reverse|sort|fill|copyWithin/.test(n)) ||
                                ((obj instanceof Map) && /set|delete|clear/.test(n)) ||
                                ((obj instanceof Set) && /add|delete|clear/.test(n)) ||
                                ((obj instanceof WeakSet) && /add|delete/.test(n)) ||
                                ((obj instanceof WeakMap) && /set|delete/.test(n))) {
                                notify(name, self);
                            }
                            return r;
                        };
                    }
                    else {
                        // make sure the object it bound to the function for when it is called
                        res = res.bind(obj);
                    }
                }
            }
            return res;
        },
        set: function (obj, n, value) {
            var res = Reflect.set(obj, n, value);
            notify(name, self);
            return res;
        },
        deleteProperty: function (target, p) {
            var res = Reflect.deleteProperty(target, p);
            notify(name, self);
            return res;
        },
        defineProperty: function (target, p, attributes) {
            var res = Reflect.defineProperty(target, p, attributes);
            notify(name, self);
            return res;
        }
    });
}
exports.proxify = proxify;
