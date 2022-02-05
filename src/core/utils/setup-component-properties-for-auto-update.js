"use strict";
exports.__esModule = true;
exports.setupComponentPropertiesForAutoUpdate = void 0;
var turn_camel_to_kebab_casing_1 = require("../../utils/turn-camel-to-kebab-casing");
var directives_1 = require("../../directives");
var proxify_1 = require("../../utils/proxify");
var is_primitive_1 = require("../../utils/is-primitive");
function setupComponentPropertiesForAutoUpdate(comp, onUpdate) {
    var properties = [];
    var _loop_1 = function (prop) {
        var attr = turn_camel_to_kebab_casing_1.turnCamelToKebabCasing(prop);
        // ignore private properties and $ properties as well as attribute properties
        if (!directives_1.directives.has(prop) && !/\$|_/.test(prop[0]) && !comp.constructor.observedAttributes.includes(attr)) {
            // @ts-ignore
            var value_1 = comp[prop];
            properties.push(prop);
            value_1 = proxify_1.proxify(prop, value_1, function () {
                onUpdate(prop, value_1, value_1);
            });
            Object.defineProperty(comp, prop, {
                get: function () {
                    return value_1;
                },
                set: function (newValue) {
                    var oldValue = value_1;
                    if (!is_primitive_1.isPrimitive(newValue)) {
                        value_1 = proxify_1.proxify(prop, newValue, function () {
                            onUpdate(prop, oldValue, newValue);
                        });
                        onUpdate(prop, oldValue, value_1);
                    }
                    else if (oldValue !== newValue) {
                        value_1 = newValue;
                        onUpdate(prop, oldValue, value_1);
                    }
                }
            });
        }
    };
    for (var _i = 0, _a = Object.getOwnPropertyNames(comp); _i < _a.length; _i++) {
        var prop = _a[_i];
        _loop_1(prop);
    }
    return properties;
}
exports.setupComponentPropertiesForAutoUpdate = setupComponentPropertiesForAutoUpdate;
