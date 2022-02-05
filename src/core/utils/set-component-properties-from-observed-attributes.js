"use strict";
exports.__esModule = true;
exports.setComponentPropertiesFromObservedAttributes = void 0;
var proxify_1 = require("../../utils/proxify");
var boolean_attributes_json_1 = require("../boolean-attributes.json");
var directives_1 = require("../../directives");
var json_parse_1 = require("../../utils/json-parse");
var metadata_1 = require("../metadata");
var is_primitive_1 = require("../../utils/is-primitive");
function setComponentPropertiesFromObservedAttributes(comp, attrs, attrsMap, cb) {
    if (attrsMap === void 0) { attrsMap = {}; }
    var properties = [];
    attrs.forEach(function (attr) {
        var _a, _b;
        attr = attr.trim();
        if (!directives_1.directives.has(attr) && !(attr.startsWith('data-') || attr === 'class' || attr === 'style')) {
            var prop_1 = attrsMap[attr];
            var value_1 = (_b = ((_a = comp.getAttribute(attr)) !== null && _a !== void 0 ? _a : comp[prop_1])) !== null && _b !== void 0 ? _b : '';
            properties.push(prop_1);
            if (typeof value_1 === 'string') {
                value_1 = proxify_1.proxify(prop_1, json_parse_1.jsonParse(value_1), function (name, val) {
                    cb(name, val, val);
                });
            }
            if ((boolean_attributes_json_1["default"]).hasOwnProperty(prop_1)) {
                value_1 = comp.hasAttribute(attr);
                prop_1 = boolean_attributes_json_1["default"][prop_1].name;
            }
            Object.defineProperty(comp, prop_1, {
                get: function () {
                    return value_1;
                },
                set: function (newValue) {
                    var oldValue = value_1;
                    if (!is_primitive_1.isPrimitive(newValue)) {
                        if (comp.hasAttribute(attr)) {
                            metadata_1.$.get(comp).clearAttr = true;
                            comp.removeAttribute(attr);
                        }
                        value_1 = proxify_1.proxify(prop_1, newValue, function () {
                            cb(prop_1, oldValue, newValue);
                        });
                        cb(prop_1, oldValue, value_1);
                    }
                    else if (oldValue !== newValue) {
                        value_1 = newValue;
                        cb(prop_1, oldValue, value_1);
                    }
                }
            });
        }
    });
    return properties;
}
exports.setComponentPropertiesFromObservedAttributes = setComponentPropertiesFromObservedAttributes;
