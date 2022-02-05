"use strict";
exports.__esModule = true;
exports.resolveHtmlEntities = void 0;
function resolveHtmlEntities(html) {
    var e = document.createElement('textarea');
    e.innerHTML = html;
    return e.textContent || '';
}
exports.resolveHtmlEntities = resolveHtmlEntities;
