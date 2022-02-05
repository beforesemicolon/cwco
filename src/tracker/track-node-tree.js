"use strict";
exports.__esModule = true;
exports.trackNodeTree = void 0;
var metadata_1 = require("../core/metadata");
var slot_tag_1 = require("../tags/slot.tag");
var define_node_context_metadata_1 = require("./utils/define-node-context-metadata");
var node_track_1 = require("./node-track");
var track_node_1 = require("./track-node");
var trackNodeTree = function (node, ancestorNodeTrack, component) {
    var _a, _b;
    var nodeName = node.nodeName, nodeValue = node.nodeValue, childNodes = node.childNodes, nodeType = node.nodeType;
    // if the track already exist simply push it to the ancestor
    if ((_a = metadata_1.$.get(node)) === null || _a === void 0 ? void 0 : _a.track) {
        ancestorNodeTrack.childNodeTracks.add((_b = metadata_1.$.get(node)) === null || _b === void 0 ? void 0 : _b.track);
        return;
    }
    // skip comments and empty text nodes to save unnecessary processing
    if (nodeName === '#comment' || (nodeName === '#text' && !(nodeValue === null || nodeValue === void 0 ? void 0 : nodeValue.trim()))) {
        return;
    }
    if (nodeName === 'SLOT') {
        slot_tag_1.slotTag(node, {
            component: {
                type: component.customSlot ? 'context' : 'default',
                childNodes: component._childNodes
            }
        }, function (nodes) {
            nodes.forEach(function (node) {
                exports.trackNodeTree(node, ancestorNodeTrack, component);
            });
        });
    }
    else if ((nodeType === 1 || nodeType === 3)) {
        define_node_context_metadata_1.defineNodeContextMetadata(node);
        var tracks = track_node_1.trackNode(node, component);
        var isComponentNode = nodeName.includes('-');
        // collect the node track if it is a web component node
        // ,or it is just a node with tracks;
        if (isComponentNode || (tracks.attribute.length || tracks.property.length || tracks.directive.length)) {
            var nodeTrack = new node_track_1.NodeTrack(node, component, tracks);
            metadata_1.$.get(node).track = nodeTrack;
            ancestorNodeTrack.childNodeTracks.add(nodeTrack);
            ancestorNodeTrack = nodeTrack; // continue collecting for this node track
        }
        // no need to continue for inside these tags either because:
        // - contains content which we don't want to deal with (script)
        // - content is already handled by the "trackNode" function
        if (/SCRIPT|STYLE|TEXTAREA|#text/i.test(nodeName)) {
            return;
        }
    }
    Array.from(childNodes).forEach(function (c) { return exports.trackNodeTree(c, ancestorNodeTrack, component); });
};
exports.trackNodeTree = trackNodeTree;
