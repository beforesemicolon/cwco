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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.WebComponent = void 0;
// simply importing directive here will automatically register them and make them available for
// anything later on
require("../directives");
var boolean_attributes_json_1 = require("./boolean-attributes.json");
var metadata_1 = require("./metadata");
var parse_1 = require("../parser/parse");
var set_component_properties_from_observed_attributes_1 = require("./utils/set-component-properties-from-observed-attributes");
var setup_component_properties_for_auto_update_1 = require("./utils/setup-component-properties-for-auto-update");
var turn_camel_to_kebab_casing_1 = require("../utils/turn-camel-to-kebab-casing");
var turn_kebab_to_camel_casing_1 = require("../utils/turn-kebab-to-camel-casing");
var get_style_string_1 = require("./utils/get-style-string");
var ShadowRootModeExtended_enum_1 = require("../enums/ShadowRootModeExtended.enum");
var json_parse_1 = require("../utils/json-parse");
var resolve_html_entities_1 = require("../utils/resolve-html-entities");
var node_track_1 = require("../tracker/node-track");
var track_node_tree_1 = require("../tracker/track-node-tree");
/**
 * a extension on the native web component API to simplify and automate most of the pain points
 * when it comes to creating and working with web components on the browser
 */
var WebComponent = /** @class */ (function (_super) {
    __extends(WebComponent, _super);
    function WebComponent() {
        var _this = _super.call(this) || this;
        _this.$refs = {};
        _this.$properties = ['$context', '$refs'];
        /**
         * the id of the template tag placed in the body of the document which contains the template content
         */
        _this.templateId = '';
        _this._childNodes = [];
        var _a = _this.constructor, mode = _a.mode, observedAttributes = _a.observedAttributes, delegatesFocus = _a.delegatesFocus;
        var selfTrack = new node_track_1.NodeTrack(_this, _this);
        var meta = metadata_1.$.get(_this);
        meta.root = _this;
        meta.mounted = false;
        meta.parsed = false;
        meta.clearAttr = false;
        meta.selfTrack = selfTrack;
        meta.externalNodes = []; // nodes moved outside the component that needs to be updated on ctx change
        meta.unsubscribeCtx = function () { };
        meta.attrPropsMap = observedAttributes.reduce(function (map, attr) {
            var _a;
            return (__assign(__assign({}, map), (_a = {}, _a[attr] = turn_kebab_to_camel_casing_1.turnKebabToCamelCasing(attr), _a)));
        }, {});
        if (mode !== 'none') {
            metadata_1.$.get(_this).root = _this.attachShadow({ mode: mode, delegatesFocus: delegatesFocus });
        }
        return _this;
    }
    /**
     * parses special template HTML string taking in consideration
     * all the additional syntax specific to this framework
     */
    WebComponent.parseHTML = function (markup) {
        return parse_1.parse(markup);
    };
    /**
     * registers the component with the CustomElementRegistry taking an optional tag name if not
     * specified as static member of the class as tagName
     * @param tagName
     */
    WebComponent.register = function (tagName) {
        tagName = typeof tagName === 'string' && tagName
            ? tagName
            : typeof this.tagName === 'string' && this.tagName
                ? this.tagName
                : turn_camel_to_kebab_casing_1.turnCamelToKebabCasing(this.name);
        this.tagName = tagName;
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
        }
    };
    /**
     * registers a list of provided web component classes
     * @param components
     */
    WebComponent.registerAll = function (components) {
        components.forEach(function (comp) { return comp.register(); });
    };
    Object.defineProperty(WebComponent, "isRegistered", {
        /**
         * returns whether the component is registered or not
         */
        get: function () {
            return customElements.get(this.tagName) !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebComponent.prototype, "template", {
        /**
         * template for the element HTML content
         */
        get: function () {
            return '';
        },
        enumerable: false,
        configurable: true
    });
    ;
    Object.defineProperty(WebComponent.prototype, "stylesheet", {
        /**
         * style for the component whether inside the style tag, as object or straight CSS string
         */
        get: function () {
            return '';
        },
        enumerable: false,
        configurable: true
    });
    ;
    Object.defineProperty(WebComponent.prototype, "customSlot", {
        /**
         * whether or not the component should use the real slot element or mimic its behavior
         * when rendering template
         */
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebComponent.prototype, "root", {
        /**
         * the root element. If shadow root present it will be the shadow root otherwise
         * the actual element
         * @returns {*}
         */
        get: function () {
            return this.constructor.mode === 'closed' ? null : metadata_1.$.get(this).root;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebComponent.prototype, "mounted", {
        /**
         * whether or not the element is attached to the DOM and works differently than Element.isConnected
         * @returns {boolean}
         */
        get: function () {
            var _a, _b;
            return (_b = (_a = metadata_1.$.get(this)) === null || _a === void 0 ? void 0 : _a.mounted) !== null && _b !== void 0 ? _b : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebComponent.prototype, "parsed", {
        get: function () {
            return metadata_1.$.get(this).parsed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebComponent.prototype, "$context", {
        get: function () {
            return metadata_1.$.get(this).$context;
        },
        enumerable: false,
        configurable: true
    });
    WebComponent.prototype.updateContext = function (ctx) {
        var _a = metadata_1.$.get(this).updateContext(ctx), oldCtx = _a.oldCtx, newCtx = _a.newCtx;
        metadata_1.$.get(this).selfTrack.childNodeTracks.forEach(function (t) {
            t.updateNode(true);
        });
        this.onUpdate('$context', oldCtx, newCtx);
    };
    WebComponent.prototype.connectedCallback = function () {
        var _a;
        var _this = this;
        var _b = this.constructor, initialContext = _b.initialContext, observedAttributes = _b.observedAttributes, tagName = _b.tagName, mode = _b.mode;
        var _c = metadata_1.$.get(this), parsed = _c.parsed, selfTrack = _c.selfTrack, root = _c.root, attrPropsMap = _c.attrPropsMap;
        if (Object.keys(initialContext).length) {
            metadata_1.$.get(this).updateContext(initialContext);
        }
        var onPropUpdate = function (prop, oldValue, newValue) {
            if (_this.mounted) {
                try {
                    _this.forceUpdate();
                    _this.onUpdate(prop, oldValue, newValue);
                }
                catch (e) {
                    _this.onError(e);
                }
            }
            else if (_this.parsed) {
                _this.onError(new Error("[Possibly a memory leak]: Cannot set property \"" + prop + "\" on unmounted component."));
            }
        };
        try {
            metadata_1.$.get(this).mounted = true;
            /*
            only need to parse the element the very first time it gets mounted

            this will make sure that if the element is removed from the dom and mounted again
            all that needs to be done if update the DOM to grab the possible new context and updated data
             */
            if (parsed) {
                this.updateContext({});
            }
            else {
                (_a = this.$properties).push.apply(_a, __spreadArray(__spreadArray([], set_component_properties_from_observed_attributes_1.setComponentPropertiesFromObservedAttributes(this, observedAttributes, attrPropsMap, onPropUpdate)), setup_component_properties_for_auto_update_1.setupComponentPropertiesForAutoUpdate(this, onPropUpdate)));
                Object.freeze(this.$properties);
                var hasShadowRoot = this.constructor.mode !== 'none';
                var temp = this.template;
                var style = '';
                if (!temp && this.templateId) {
                    var t = document.getElementById(this.templateId);
                    temp = (t === null || t === void 0 ? void 0 : t.nodeName) === 'TEMPLATE' ? t.innerHTML : temp;
                }
                if (mode !== 'none' || !document.head.querySelectorAll(("." + tagName).toLowerCase()).length) {
                    style = get_style_string_1.getStyleString(this.stylesheet, tagName.toLowerCase(), hasShadowRoot);
                }
                var contentNode = parse_1.parse(resolve_html_entities_1.resolveHtmlEntities(style + temp));
                this._childNodes = Array.from(this.childNodes);
                if (this.customSlot) {
                    this.innerHTML = '';
                }
                track_node_tree_1.trackNodeTree(contentNode, selfTrack, this);
                selfTrack.childNodeTracks.forEach(function (t) {
                    t.updateNode();
                });
                if (mode === 'none') {
                    __spreadArray(__spreadArray([], Array.from(contentNode.querySelectorAll('link'))), Array.from(contentNode.querySelectorAll('style'))).forEach(function (el) {
                        document.head.appendChild(el);
                        metadata_1.$.get(_this).externalNodes.push(el);
                    });
                }
                metadata_1.$.get(this).parsed = true;
                root.appendChild(contentNode);
            }
            this.onMount();
        }
        catch (e) {
            this.onError(e);
        }
    };
    /**
     * livecycle callback for when the element is attached to the DOM
     */
    WebComponent.prototype.onMount = function () {
    };
    WebComponent.prototype.disconnectedCallback = function () {
        try {
            metadata_1.$.get(this).mounted = false;
            metadata_1.$.get(this).unsubscribeCtx();
            this.onDestroy();
        }
        catch (e) {
            this.onError(e);
        }
    };
    /**
     * livecycle callback for when the element is removed from the DOM
     */
    WebComponent.prototype.onDestroy = function () {
    };
    WebComponent.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
        if (metadata_1.$.get(this).clearAttr) {
            metadata_1.$.get(this).clearAttr = false;
        }
        else if (this.mounted) {
            try {
                if (!(name.startsWith('data-') || name === 'class' || name === 'style')) {
                    var prop = metadata_1.$.get(this).attrPropsMap[name];
                    // @ts-ignore
                    this[prop] = boolean_attributes_json_1["default"].hasOwnProperty(prop)
                        ? this.hasAttribute(name)
                        : json_parse_1.jsonParse(newValue);
                }
                else {
                    this.forceUpdate();
                    this.onUpdate(name, oldValue, newValue);
                }
            }
            catch (e) {
                this.onError(e);
            }
        }
    };
    /**
     * livecycle callback for when the element attributes or class properties are updated
     */
    WebComponent.prototype.onUpdate = function (name, oldValue, newValue) {
    };
    /**
     * updates any already tracked node with current component data including context and node level data.
     */
    WebComponent.prototype.forceUpdate = function () {
        var _this = this;
        cancelAnimationFrame(metadata_1.$.get(this).updateFrame);
        metadata_1.$.get(this).updateFrame = requestAnimationFrame(function () {
            metadata_1.$.get(_this).selfTrack.childNodeTracks.forEach(function (t) {
                t.updateNode();
            });
        });
    };
    WebComponent.prototype.adoptedCallback = function () {
        try {
            this.onAdoption();
        }
        catch (e) {
            this.onError(e);
        }
    };
    /**
     * livecycle callback for when element is moved into a new document
     */
    WebComponent.prototype.onAdoption = function () {
    };
    /**
     * error callback for when an error occurs
     */
    WebComponent.prototype.onError = function (error) {
        console.error(this.constructor.name, error);
    };
    /**
     * an array of attribute names as they will look in the html tag
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elementsusing_the_lifecycle_callbacks
     * @type {[]}
     */
    WebComponent.observedAttributes = [];
    /**
     * shadow root mode
     * https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode
     * plus an additional option of "none" to signal you dont want
     * the content to be places inside the shadow root but directly under the tag
     * @type {string}
     */
    WebComponent.mode = ShadowRootModeExtended_enum_1.ShadowRootModeExtended.OPEN;
    /**
     * shadow root delegate focus option
     * https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus
     * @type {boolean}
     */
    WebComponent.delegatesFocus = false;
    /**
     * a valid name of the html tag
     * @type {string}
     */
    WebComponent.tagName = '';
    /**
     * the initial context data for the component
     */
    WebComponent.initialContext = {};
    return WebComponent;
}(HTMLElement));
exports.WebComponent = WebComponent;
