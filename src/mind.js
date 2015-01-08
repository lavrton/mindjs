(function(root, factory) {
    // Set up Backbone appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            root.Mind = factory();
        });

        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    } else if (typeof exports !== 'undefined') {
        module.exports = factory();
        window.Mind = module.exports;
        // Finally, as a browser global.
    } else {
        root.Mind = factory();
    }
})(this, function factory() {
    var Stage = require('./stage');
    var Atom = require('./atom');
    var Mind = {
        Stage : Stage,
        Atom : Atom
    }
    return Mind;
});