"use strict";
exports.__esModule = true;
exports.getStyleString = void 0;
function getStyleString(stylesheet, tagName, hasShadowRoot) {
    if (hasShadowRoot === void 0) { hasShadowRoot = true; }
    stylesheet = stylesheet.trim().replace(/\s{2,}/g, ' ');
    if (!stylesheet) {
        return '';
    }
    var div = document.createElement('div');
    div.innerHTML = stylesheet;
    var styleTag = document.createElement('style');
    var links = [];
    var styles = [styleTag];
    Array.from(div.childNodes).forEach(function (child) {
        if (child.nodeName === 'LINK' && (child.getAttribute('rel') || '').trim() === 'stylesheet') {
            links.push(child);
        }
        else if (child.nodeName === 'STYLE') {
            styles.push(child);
        }
        else if (child.nodeName === '#text') {
            styleTag.appendChild(child);
        }
    });
    if (!hasShadowRoot) {
        for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
            var style = styles_1[_i];
            style.classList.add(tagName);
            style.textContent = (style.innerHTML).replace(/:(host-context|host)(?:\s*\((.*?)\))?/gmi, function (_, h, s) {
                if (h === 'host-context') {
                    return (s || '').trim() + " " + tagName;
                }
                return "" + tagName + (s || '').trim();
            });
        }
    }
    return links.map(function (el) { return el.outerHTML; }).join('') + styles.map(function (el) { return el.textContent && el.outerHTML; }).join('');
}
exports.getStyleString = getStyleString;
