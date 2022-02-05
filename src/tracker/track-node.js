"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.trackNode = void 0;
var metadata_1 = require("../core/metadata");
var extract_executable_snippet_from_css_1 = require("./utils/extract-executable-snippet-from-css");
var registry_1 = require("../directives/registry");
var parse_node_directive_1 = require("./utils/parse-node-directive");
var get_event_handler_function_1 = require("./utils/get-event-handler-function");
var extract_executable_snippet_from_string_1 = require("./utils/extract-executable-snippet-from-string");
var track_type_1 = require("../enums/track-type");
var track_1 = require("./track");
var define_node_context_metadata_1 = require("./utils/define-node-context-metadata");
var trackNode = function (node, component) {
    var tracks = {
        directive: [],
        attribute: [],
        property: []
    };
    define_node_context_metadata_1.defineNodeContextMetadata(node);
    // because there are certain actions here that will modify the node itself like removing attributes
    // we can preserve the original node string representation to recreate it if necessary later
    metadata_1.$.get(node).rawNodeString = (node.nodeType === 3 ? node.nodeValue : node.outerHTML) || '';
    var _a = node, nodeName = _a.nodeName, nodeValue = _a.nodeValue, nodeType = _a.nodeType, textContent = _a.textContent, attributes = _a.attributes;
    var track = null;
    nodeValue = nodeValue || '';
    textContent = textContent || '';
    switch (nodeName) {
        case '#text':
            track = getNodeTrack('nodeValue', nodeValue);
            if (track) {
                tracks.property.push(track);
            }
            break;
        case 'TEXTAREA':
            track = getNodeTrack('textContent', textContent);
            if (track) {
                tracks.property.push(track);
            }
            break;
        case 'STYLE':
            track = getNodeTrack('textContent', textContent, track_type_1.TrackType.property, extract_executable_snippet_from_css_1.extractExecutableSnippetFromCSS);
            if (track) {
                tracks.property.push(track);
            }
            break;
    }
    if (nodeType === 1) {
        var dirPattern_1 = new RegExp("^(" + Object.keys(registry_1.directiveRegistry).join('|') + ")\\.?");
        var eventHandlers_1 = [];
        var attrs_2 = [];
        // @ts-ignore
        __spreadArray([], attributes).forEach(function (attr, i) {
            if (dirPattern_1.test(attr.name)) {
                var _a = parse_node_directive_1.parseNodeDirective(node, attr.name, attr.value), name_1 = _a.name, value = _a.value, prop = _a.prop;
                var dir = registry_1.directiveRegistry[name_1];
                track = new track_1.Track(name_1, value, track_type_1.TrackType.directive);
                track.prop = prop;
                track.handler = dir;
                if (name_1 === 'if') {
                    tracks.directive[0] = track;
                }
                else if (name_1 === 'repeat') {
                    tracks.directive[1] = track;
                }
                else {
                    tracks.directive[i + 2] = track;
                }
                node.removeAttribute(attr.name);
            }
            else if (attr.name.startsWith('on')) {
                eventHandlers_1.push({
                    eventName: attr.name.slice(2).toLowerCase(),
                    attribute: attr
                });
            }
            else {
                attrs_2.push(attr);
            }
        });
        tracks.directive = Object.values(tracks.directive); // to eliminate empty slots
        eventHandlers_1.forEach(function (_a) {
            var eventName = _a.eventName, fn = _a.fn, attribute = _a.attribute;
            node.removeAttribute(attribute.name);
            if (!fn) {
                node.addEventListener(eventName, get_event_handler_function_1.getEventHandlerFunction(component, metadata_1.$.get(node).$context, attribute));
            }
        });
        for (var _i = 0, attrs_1 = attrs_2; _i < attrs_1.length; _i++) {
            var attr = attrs_1[_i];
            if (attr.value.trim()) {
                track = getNodeTrack(attr.name, attr.value, track_type_1.TrackType.attribute);
                if (track) {
                    tracks.attribute.push(track);
                }
            }
        }
    }
    return tracks;
};
exports.trackNode = trackNode;
function getNodeTrack(name, value, type, extractor) {
    if (type === void 0) { type = track_type_1.TrackType.property; }
    if (extractor === void 0) { extractor = extract_executable_snippet_from_string_1.extractExecutableSnippetFromString; }
    if ((value || '').trim()) {
        var track = new track_1.Track(name, value, type);
        track.executables = extractor(value);
        if (track.executables.length) {
            return track;
        }
    }
    return null;
}
