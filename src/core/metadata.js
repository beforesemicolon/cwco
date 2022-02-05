"use strict";
exports.__esModule = true;
exports.$ = void 0;
/**
 * metadata is a simple global object that is used to store data related to the node
 * to prevent attaching properties on the node directly also to prevent this data
 * to be manipulated when user has reference of the node object.
 *
 * its weak nature also means that when no node reference exists, these data will simply be
 * garbage collected
 */
exports.$ = new WeakMap();
