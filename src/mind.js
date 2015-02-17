"use strict";
(function(factory) {
    // Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['hammer'], function(Hammer) {
            window.Hammer = Hammer;
            window.Mind = factory();
            return window.Mind;
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = factory();
        window.Mind = module.exports;
        // Finally, as a browser global.
    } else {
        window.Mind = factory();
        if (!window.Hammer) {
            throw "HammerJS is not detected. mind.js not working without it!";
        }
    }
}(function factory() {
    var Stage = require('./stage');
    var Node = require('./node');
    var Connector = require('./connector');

    return {
        Stage: Stage,
        Node: Node,
        Connector : Connector
    };

}));