"use strict";
exports.__esModule = true;
exports.Track = void 0;
var track_type_1 = require("../enums/track-type");
var Track = /** @class */ (function () {
    function Track(name, value, type) {
        if (type === void 0) { type = track_type_1.TrackType.attribute; }
        this.name = name;
        this.value = value;
        this.type = type;
        this.executables = [];
        this.handler = null;
        this.prop = null;
        this.prevValue = null;
    }
    return Track;
}());
exports.Track = Track;
