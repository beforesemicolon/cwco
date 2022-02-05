"use strict";
exports.__esModule = true;
exports.NodeTrack = void 0;
var define_node_context_metadata_1 = require("./utils/define-node-context-metadata");
var metadata_1 = require("../core/metadata");
var resolve_executables_1 = require("./utils/resolve-executables");
var is_primitive_1 = require("../utils/is-primitive");
var extract_executable_snippet_from_string_1 = require("./utils/extract-executable-snippet-from-string");
var evaluate_string_in_component_context_1 = require("./utils/evaluate-string-in-component-context");
var track_node_tree_1 = require("./track-node-tree");
var NodeTrack = /** @class */ (function () {
    function NodeTrack(node, component, tracks) {
        if (tracks === void 0) { tracks = { directive: [], attribute: [], property: [] }; }
        this.node = node;
        this.component = component;
        this.tracks = tracks;
        this.childNodeTracks = new Set();
        this.anchorNodeTrack = null;
        this.anchorTrack = null;
        this.dirs = new WeakMap();
        this.dirAnchors = new WeakMap();
        if (node.nodeType !== 8) {
            define_node_context_metadata_1.defineNodeContextMetadata(node);
            this.anchorNodeTrack = new NodeTrack(document.createComment(metadata_1.$.get(node).rawNodeString), component);
        }
        this.anchor = node;
    }
    Object.defineProperty(NodeTrack.prototype, "$context", {
        get: function () {
            var _a;
            // use this track node context if it does not happen to be anchored
            // otherwise the anchor context will reflect its ancestor's context
            return (this.anchor === this.node
                ? metadata_1.$.get(this.node).$context
                : (_a = metadata_1.$.get(Array.isArray(this.anchor) ? this.anchor[0] : this.anchor)) === null || _a === void 0 ? void 0 : _a.$context) || {};
        },
        enumerable: false,
        configurable: true
    });
    NodeTrack.prototype.updateNode = function (force) {
        var _a;
        if (force === void 0) { force = false; }
        // if it is a text node
        if (this.node.nodeType === 3) {
            for (var _i = 0, _b = this.tracks.property; _i < _b.length; _i++) {
                var t = _b[_i];
                this._updateNodeProperty(t);
            }
        }
        else {
            var empty = !this.tracks.directive.length &&
                !this.tracks.attribute.length &&
                !this.tracks.property.length;
            for (var _c = 0, _d = this.tracks.directive; _c < _d.length; _c++) {
                var t = _d[_c];
                var dirNode = this._updateNodeDirective(t);
                if (dirNode) {
                    this._swapNodeAndDirNode(dirNode);
                    this.anchor = dirNode;
                    if (dirNode !== this.node) {
                        (_a = this.anchorNodeTrack) === null || _a === void 0 ? void 0 : _a.childNodeTracks.forEach(function (t) {
                            t.updateNode();
                        });
                        return;
                    }
                }
            }
            for (var _e = 0, _f = this.tracks.attribute; _e < _f.length; _e++) {
                var t = _f[_e];
                this._updateNodeAttribute(t);
            }
            for (var _g = 0, _h = this.tracks.property; _g < _h.length; _g++) {
                var t = _h[_g];
                this._updateNodeProperty(t);
            }
            // for empty web component with no tracks needs to
            // be force updated if force is True since
            // there is nothing that will trigger update inside the
            // component like attribute tracks would
            if (empty && force && this.node.nodeName.includes('-')) {
                this.node.forceUpdate();
            }
            this.childNodeTracks.forEach(function (t) {
                t.updateNode(force);
            });
        }
    };
    NodeTrack.prototype._removeNodeDirectiveAttribute = function (n) {
        var _a;
        if (n.nodeType === 1) {
            n.removeAttribute(((_a = this.anchorTrack) === null || _a === void 0 ? void 0 : _a.name) || '');
        }
    };
    NodeTrack.prototype._updateNodeProperty = function (track) {
        var newValue = resolve_executables_1.resolveExecutables(track.value, this.component, this.$context, track.executables);
        if (!is_primitive_1.isPrimitive(newValue) || newValue !== this.node[track.name]) {
            this.node[track.name] = newValue;
            return true;
        }
        return false;
    };
    NodeTrack.prototype._updateNodeAttribute = function (track) {
        var newValue = resolve_executables_1.resolveExecutables(track.value, this.component, this.$context, track.executables);
        if (is_primitive_1.isPrimitive(newValue)) {
            if (this.node.getAttribute(track.name) !== newValue) {
                this.node.setAttribute(track.name, newValue);
                return true;
            }
        }
        else {
            var attrPropsMap = metadata_1.$.get(this.node).attrPropsMap;
            var attrProp = attrPropsMap ? attrPropsMap[track.name] : track.name;
            if (this.node.hasAttribute(track.name)) {
                metadata_1.$.get(this.node).clearAttr = true;
                this.node.removeAttribute(track.name);
            }
            this.node[attrProp] = newValue;
            return true;
        }
        return false;
    };
    NodeTrack.prototype._updateNodeDirective = function (track) {
        var _a;
        if (track.handler) {
            var handler = track.handler;
            var dir = this.dirs.get(track) || new handler(this.component);
            this.dirs.set(track, dir);
            var val = dir.parseValue(track.value, track.prop);
            var value = resolve_executables_1.resolveExecutables(val, this.component, this.$context, extract_executable_snippet_from_string_1.extractExecutableSnippetFromString(val));
            if (typeof value === 'string') {
                value = evaluate_string_in_component_context_1.evaluateStringInComponentContext(value, this.component, this.$context);
            }
            if (track.prevValue !== value) {
                track.prevValue = value;
                var dirNode = dir.render(value, {
                    element: this.node,
                    anchorNode: (_a = this.dirAnchors.get(track)) !== null && _a !== void 0 ? _a : null,
                    rawElementOuterHTML: metadata_1.$.get(this.node).rawNodeString
                });
                if (dirNode !== this.node) {
                    this.dirAnchors.set(track, dirNode);
                    this.anchorTrack = track;
                }
                return dirNode;
            }
            else if (this.anchorTrack === track) {
                // if this directive happens to be the one which cause this node to be anchored
                // and its value did not change, we can just quit the updating al together
                // since nothing else will update this node
                return this.anchor;
            }
            this.dirAnchors.set(track, null);
        }
        return this.node;
    };
    NodeTrack.prototype._swapNodeAndDirNode = function (dirNode) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        if (dirNode === this.anchor) {
            return;
        }
        // clear previous child node tracks before pushing all new ones
        // to ensure that the updates will only be applied to these new tracks
        this.anchorNodeTrack.childNodeTracks.clear();
        // since new nodes are not initially tracked by the component
        // we need to track them as part of the anchor node branch
        // so when there are changes to the anchored node
        // these are tracked and updated separately from the original node
        if (Array.isArray(dirNode)) {
            dirNode.forEach(function (n) {
                _this._removeNodeDirectiveAttribute(n);
                track_node_tree_1.trackNodeTree(n, _this.anchorNodeTrack, _this.component);
            });
        }
        else {
            this._removeNodeDirectiveAttribute(dirNode);
            track_node_tree_1.trackNodeTree(dirNode, this.anchorNodeTrack, this.component);
        }
        var dirIsArray = Array.isArray(dirNode);
        // in case we have an empty array of nodes or simply that
        // the nodes are ar not valid nodes types (text, comment, element)
        // we will override to use the anchor node which is a comment node
        if ((dirIsArray && !dirNode.length) ||
            (!dirIsArray && !(/[831]/.test("" + dirNode.nodeType)))) {
            dirNode = this.anchorNodeTrack.node;
            dirIsArray = false;
        }
        var anchorIsArray = Array.isArray(this.anchor);
        // in case the anchor node is currently empty, it means it had a anchor
        // node comment render instead as the above if statement make sure of.
        // in that regard we need to use so we can replace whats it is currently
        // on the dom as an anchor
        var anchorEl = anchorIsArray && !this.anchor.length
            ? this.anchorNodeTrack.node
            : document.createComment('cw');
        var nextEl = anchorEl;
        if (anchorIsArray) {
            // here we use the dir node first element or the anchor node
            // to place the anchor element to begin the swapping process
            var el = !this.anchor.length
                ? this.anchorNodeTrack.node
                : this.anchor[0];
            (_a = el === null || el === void 0 ? void 0 : el.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(nextEl, el);
        }
        else {
            (_b = this.anchor.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(nextEl, this.anchor);
        }
        if (dirIsArray) {
            // for each dir node in the array we place on the dom after
            // the previous as long as it was not in the dom before
            // this will ensure the nodes are placed sequentially
            // and not remounted to avoid un updates in case they are
            // web component nodes
            for (var _i = 0, _f = dirNode; _i < _f.length; _i++) {
                var el = _f[_i];
                if (!el.isConnected) {
                    nextEl.after(el);
                }
                nextEl = el;
            }
        }
        else if (dirNode instanceof Node) {
            nextEl.after(dirNode);
        }
        if (anchorIsArray) {
            // here we start the process of cleaning up any old node
            // placed before in the previous dir node list
            // which is not part of the new dir node list
            for (var _g = 0, _h = this.anchor; _g < _h.length; _g++) {
                var el = _h[_g];
                if (!dirIsArray || !dirNode.includes(el)) {
                    (_c = el.parentNode) === null || _c === void 0 ? void 0 : _c.removeChild(el);
                }
            }
        }
        else if (this.anchor !== dirNode) {
            (_d = this.anchor.parentNode) === null || _d === void 0 ? void 0 : _d.removeChild(this.anchor);
        }
        // remove the node which served as the anchor on the dom for the node swap
        (_e = anchorEl.parentNode) === null || _e === void 0 ? void 0 : _e.removeChild(anchorEl);
    };
    return NodeTrack;
}());
exports.NodeTrack = NodeTrack;
