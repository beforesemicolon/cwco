"use strict";
exports.__esModule = true;
exports.parse = void 0;
var self_closing_tags_json_1 = require("./self-closing-tags.json");
var NSURI = {
    HTML: 'http://www.w3.org/1999/xhtml',
    SVG: 'http://www.w3.org/2000/svg'
};
function parse(markup) {
    var tagCommentPattern = /<!--([^]*?)-->|<(\/|!)?([a-z][\w-.:]*)((?:\s*[a-z][\w-.:]*(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)+\s*|\s*)(\/?)>/ig;
    var root = document.createDocumentFragment();
    var stack = [root];
    var match = null;
    var lastIndex = 0;
    var isNSTag = false;
    var URI = '';
    while ((match = tagCommentPattern.exec(markup)) !== null) {
        var fullMatch = match[0], comment = match[1], closeOrBangSymbol = match[2], tagName = match[3], attributes = match[4], selfCloseSlash = match[5];
        tagName = tagName === null || tagName === void 0 ? void 0 : tagName.toUpperCase();
        if (closeOrBangSymbol === '!') {
            continue;
        }
        var parentNode = stack[stack.length - 1] || null;
        // grab in between text
        if (lastIndex !== match.index) {
            var textNode = document.createTextNode(markup.slice(lastIndex, match.index));
            parentNode.appendChild(textNode);
        }
        lastIndex = tagCommentPattern.lastIndex;
        if (comment) {
            var commentNode = document.createComment(comment);
            parentNode.appendChild(commentNode);
            continue;
        }
        isNSTag = isNSTag || /SVG|HTML/i.test(tagName);
        if (/SVG|HTML/i.test(tagName)) {
            URI = NSURI[tagName.toUpperCase()];
        }
        if (selfCloseSlash || self_closing_tags_json_1["default"][tagName]) {
            var node = isNSTag
                ? document.createElementNS(URI, tagName.toLowerCase())
                : document.createElement(tagName);
            setAttributes(node, attributes);
            parentNode.appendChild(node);
        }
        else if (closeOrBangSymbol === '/') {
            isNSTag = /SVG|HTML/i.test(tagName) ? false : isNSTag;
            URI = /SVG|HTML/i.test(tagName) ? '' : URI;
            stack.pop();
        }
        else if (!closeOrBangSymbol) {
            var node = isNSTag
                ? document.createElementNS(URI, tagName.toLowerCase())
                : document.createElement(tagName);
            setAttributes(node, attributes);
            parentNode.appendChild(node);
            stack.push(node);
        }
    }
    // grab ending text
    if (lastIndex < markup.length) {
        var textNode = document.createTextNode(markup.slice(lastIndex));
        root.appendChild(textNode);
    }
    return root;
}
exports.parse = parse;
function setAttributes(node, attributes) {
    var attrPattern = /([a-z][\w-.:]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/ig;
    var match = null;
    while ((match = attrPattern.exec(attributes))) {
        var name_1 = match[1];
        var value = match[2] || match[3] || match[4] || (new RegExp("^" + match[1] + "\\s*=").test(match[0]) ? '' : null);
        node.setAttribute(name_1, value !== null && value !== void 0 ? value : '');
    }
}
