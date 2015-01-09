"use strict";
(function(factory) {
    // Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            // Export global even in AMD case in case this script is loaded with
            root.Mind = factory();
            return root.Mind;
        });
        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    } else if (typeof exports !== 'undefined') {
        module.exports = factory();
        window.Mind = module.exports;
        // Finally, as a browser global.
    } else {
        root.Mind = factory();
    }
}(function factory() {
    var Stage = require('./stage');
    var Node = require('./node');
    return {
        Stage: Stage,
        Node: Node
    };
}));