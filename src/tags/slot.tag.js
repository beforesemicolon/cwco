"use strict";
exports.__esModule = true;
exports.slotTag = void 0;
var slotTag = function (node, _a, cb) {
    var _b = _a === void 0 ? {} : _a, component = _b.component;
    if (component.type === 'context') {
        cb(renderCustomSlot(node, component.childNodes));
    }
    else {
        renderSlot(node, cb);
    }
};
exports.slotTag = slotTag;
function renderSlot(node, cb) {
    var onSlotChange = function () {
        var nodes = node.assignedNodes();
        cb(nodes);
        node.removeEventListener('slotchange', onSlotChange, false);
    };
    node.addEventListener('slotchange', onSlotChange, false);
}
function renderCustomSlot(node, childNodes) {
    var _a, _b;
    var name = node.getAttribute('name');
    var nodeList;
    var comment = document.createComment("slotted [" + (name || '') + "]");
    (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(comment, node);
    if (name) {
        nodeList = childNodes.filter(function (n) {
            return n.nodeType === 1 && n.getAttribute('slot') === name;
        });
    }
    else {
        nodeList = childNodes.filter(function (n) {
            return n.nodeType !== 1 || !n.hasAttribute('slot');
        });
    }
    if (!nodeList.length) {
        nodeList = Array.from(node.childNodes);
    }
    var anchor = comment;
    for (var _i = 0, nodeList_1 = nodeList; _i < nodeList_1.length; _i++) {
        var n = nodeList_1[_i];
        anchor.after(n);
        anchor = n;
    }
    (_b = comment.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(comment);
    return nodeList;
}
