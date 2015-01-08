(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function Atom(params) {
    this.x = params.x;
    this.y = params.y;
    this._buildNode();
}

Atom.prototype._buildNode = function(){
    this.node = document.createElement('div');
    this.node.innerHTML = 'atom';
    this.node.style['background-color'] = '#3fa9f5';
    this.node.style['padding'] = '10px';
    this.node.style['border-radius'] = '100px';
    this.node._atom = this;
    this._positioning();
};

Atom.prototype._positioning = function() {
    this.node.style.position = 'absolute';
    this.node.style.transform = 'translateX(' + this.x + 'px) translateY(' + this.y + 'px) translateZ(1px)';
    this.node.style['-webkit-transform'] = 'translateX(' + this.x + 'px) translateY(' + this.y + 'px) translateZ(1px)';
};

module.exports = Atom;

},{}],2:[function(require,module,exports){
"use strict";

function Camera() {
    this.x = 0;
    this.y = 0;
    this.scale = 1;
}

Camera.prototype.setPostion  = function(pos) {
    this.x = pos.x;
    this.y = pos.y;
};

Camera.prototype.move  = function(dx, dy) {
    this.x += dx;
    this.y += dy;
};

module.exports = Camera;
},{}],3:[function(require,module,exports){
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
},{"./atom":1,"./stage":4}],4:[function(require,module,exports){
"use strict";
var utils = require('./utils');
var Camera = require('./camera');

function Stage(params) {
    if (!params) {
        utils.throw('params for Stage constructor required.');
    }
    if (!params.container) {
        utils.throw('container parameter is required.');
    }
    this.atoms = [];
    this._container = document.getElementById(params.container);

    this._container.style.width = params.width + 'px';
    this._container.style.height = params.height + 'px';

    this.width = params.width;
    this.height = params.height;
    this.camera = new Camera();

    this._initBackground();
    this._initAtomContainer();
    this._setupDragCamera();
    this._setupAtomDrag();
    this._setupKeyboard();
}

Stage.prototype._setupAtomDrag = function() {
    var mc = new Hammer.Manager(this._container);

    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

    var dragElement;
    mc.on("panstart", function(e) {
        dragElement = e.target;
    });
    mc.on("panmove", function (e) {
        var atom = dragElement._atom;
        if (!atom) {
            return;
        }
        atom.x = e.changedPointers[0].clientX + this.camera.x;
        atom.y = e.changedPointers[0].clientY  + this.camera.y;
        atom._positioning();
    }.bind(this));
};

Stage.prototype.addAtom = function(o) {
    this.atoms.push(o);
    if (this._isAtomVisible(o)) {
        this._atomContainer.appendChild(o.node);
    }
};

Stage.prototype._isAtomVisible = function(atom) {
    var cameraX = this.camera.x;
    var cameraY = this.camera.y;
    var screenWidth = this.width;
    var screenHeight = this.height;
    if (atom.x > cameraX - screenWidth  && atom.x < cameraX + screenWidth * 2 &&
        atom.y > cameraY - screenHeight && atom.y < cameraY + screenHeight * 2) {
        return true;
    }
    return false;
};

//set background(background) {
//    if (background.indexOf('/') !== -1) {
//        this._back.style['background-image'] = 'url("' + background + '")';
//        this._back.style['background-color'] = '';
//    } else {
//        this._back.style['background-image'] = '';
//        this._back.style['background-color'] = background;
//    }
//}
//
//hide() {
//    this._container.style.display = 'none';
//}
//
//show() {
//    this._container.style.display = '';
//}

Stage.prototype.setSize = function(param) {
    //this._stage.setWidth(param.width);
    //this._stage.setHeight(param.height);
    //this._back.width(param.width);
    //this._back.height(param.height);
    //this.camera.trigger('change');
    //this.camera.trigger('change:scale');
    //this._backLayer.draw();
};

Stage.prototype._positionBack = function() {
    this._back.style['background-position'] = -this.camera.x + 'px ' + -this.camera.y + 'px';
};

Stage.prototype._initBackground = function() {
    this._back = document.createElement('div');
    this._container.appendChild(this._back);
    this._back.style.position = 'absolute';
    this._back.style.transform = 'translateZ(-1)';
    this._back.style['-webkit-transform'] = 'translateZ(-1)';
    this._back.style.width = '100%';
    this._back.style.height = '100%';
    this._positionBack();
};

Stage.prototype._positionAtomContainer = function() {
    this._atomContainer.style.transform = 'translateX(' + -this.camera.x + 'px) translateY(' + -this.camera.y + 'px)';
    this._atomContainer.style['-webkit-transform'] = 'translateX(' + -this.camera.x + 'px) translateY(' + -this.camera.y + 'px)';
};

Stage.prototype._initAtomContainer = function() {
    this._atomContainer = document.createElement('div');
    this._container.appendChild(this._atomContainer);
    this._atomContainer.style.position = 'absolute';
    this._atomContainer.style.transform = 'translateZ(-1)';
    this._atomContainer.style['-webkit-transform'] = 'translateZ(-1)';
    this._positionAtomContainer();
};


Stage.prototype._setupDragCamera = function() {
    var mc = new Hammer.Manager(this._back);

    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    var previous = {};
    mc.on("panstart", function(e) {
        previous = e.center;
    });
    mc.on("panmove", function(e) {
        var newPos = {
            x : e.center.x + e.deltaX,
            y : e.center.y + e.deltaY
        };
        var dx = previous.x - newPos.x;
        var dy = previous.y - newPos.y;
        this.camera.move(dx, dy);
        this._positionBack();
        this._positionAtomContainer();
        this._requestCheckVisiability();
        previous = newPos;
    }.bind(this));
};

Stage.prototype._requestCheckVisiability = function() {
    if (this._checkVisibilityWaiting) {
        return;
    }
    this._checkVisibilityWaiting = true;
    setTimeout(function() {
        this.atoms.forEach(function(atom) {
            var visible = this._isAtomVisible(atom);
            if (visible && !atom.node.parentElement) {
                this._atomContainer.appendChild(atom.node);
            } else if (!visible && atom.node.parentElement) {
                atom.node.parentElement.removeChild(atom.node);
            }
        }.bind(this));
        this._checkVisibilityWaiting = false;
    }.bind(this), 100);
};

Stage.prototype._setupKeyboard = function() {
    window.onkeydown = function(e) {
        if (e.keyCode === 37) {
            this.camera.x -= 3;
        }
        if (e.keyCode === 38) {
            this.camera.y -= 3;
        }
        if (e.keyCode === 39) {
            this.camera.x += 3;
        }
        if (e.keyCode === 40) {
            this.camera.y += 3;
        }
    };
};

module.exports = Stage;
},{"./camera":2,"./utils":5}],5:[function(require,module,exports){
module.exports.throw = function(message) {
    throw 'MindJS Error: ' + message;
}
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXG1pbmRqc1xcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21pbmRqcy9zcmMvYXRvbS5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9taW5kanMvc3JjL2NhbWVyYS5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9taW5kanMvc3JjL2Zha2VfZGEwODYxYmIuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvbWluZGpzL3NyYy9zdGFnZS5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9taW5kanMvc3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEF0b20ocGFyYW1zKSB7XG4gICAgdGhpcy54ID0gcGFyYW1zLng7XG4gICAgdGhpcy55ID0gcGFyYW1zLnk7XG4gICAgdGhpcy5fYnVpbGROb2RlKCk7XG59XG5cbkF0b20ucHJvdG90eXBlLl9idWlsZE5vZGUgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMubm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMubm9kZS5pbm5lckhUTUwgPSAnYXRvbSc7XG4gICAgdGhpcy5ub2RlLnN0eWxlWydiYWNrZ3JvdW5kLWNvbG9yJ10gPSAnIzNmYTlmNSc7XG4gICAgdGhpcy5ub2RlLnN0eWxlWydwYWRkaW5nJ10gPSAnMTBweCc7XG4gICAgdGhpcy5ub2RlLnN0eWxlWydib3JkZXItcmFkaXVzJ10gPSAnMTAwcHgnO1xuICAgIHRoaXMubm9kZS5fYXRvbSA9IHRoaXM7XG4gICAgdGhpcy5fcG9zaXRpb25pbmcoKTtcbn07XG5cbkF0b20ucHJvdG90eXBlLl9wb3NpdGlvbmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubm9kZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5ub2RlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyB0aGlzLnggKyAncHgpIHRyYW5zbGF0ZVkoJyArIHRoaXMueSArICdweCkgdHJhbnNsYXRlWigxcHgpJztcbiAgICB0aGlzLm5vZGUuc3R5bGVbJy13ZWJraXQtdHJhbnNmb3JtJ10gPSAndHJhbnNsYXRlWCgnICsgdGhpcy54ICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyB0aGlzLnkgKyAncHgpIHRyYW5zbGF0ZVooMXB4KSc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0b207XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gQ2FtZXJhKCkge1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcbiAgICB0aGlzLnNjYWxlID0gMTtcbn1cblxuQ2FtZXJhLnByb3RvdHlwZS5zZXRQb3N0aW9uICA9IGZ1bmN0aW9uKHBvcykge1xuICAgIHRoaXMueCA9IHBvcy54O1xuICAgIHRoaXMueSA9IHBvcy55O1xufTtcblxuQ2FtZXJhLnByb3RvdHlwZS5tb3ZlICA9IGZ1bmN0aW9uKGR4LCBkeSkge1xuICAgIHRoaXMueCArPSBkeDtcbiAgICB0aGlzLnkgKz0gZHk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTsiLCIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xyXG4gICAgLy8gU2V0IHVwIEJhY2tib25lIGFwcHJvcHJpYXRlbHkgZm9yIHRoZSBlbnZpcm9ubWVudC4gU3RhcnQgd2l0aCBBTUQuXHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gRXhwb3J0IGdsb2JhbCBldmVuIGluIEFNRCBjYXNlIGluIGNhc2UgdGhpcyBzY3JpcHQgaXMgbG9hZGVkIHdpdGhcclxuICAgICAgICAgICAgLy8gb3RoZXJzIHRoYXQgbWF5IHN0aWxsIGV4cGVjdCBhIGdsb2JhbCBCYWNrYm9uZS5cclxuICAgICAgICAgICAgcm9vdC5NaW5kID0gZmFjdG9yeSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBOZXh0IGZvciBOb2RlLmpzIG9yIENvbW1vbkpTLiBqUXVlcnkgbWF5IG5vdCBiZSBuZWVkZWQgYXMgYSBtb2R1bGUuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xyXG4gICAgICAgIHdpbmRvdy5NaW5kID0gbW9kdWxlLmV4cG9ydHM7XHJcbiAgICAgICAgLy8gRmluYWxseSwgYXMgYSBicm93c2VyIGdsb2JhbC5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm9vdC5NaW5kID0gZmFjdG9yeSgpO1xyXG4gICAgfVxyXG59KSh0aGlzLCBmdW5jdGlvbiBmYWN0b3J5KCkge1xyXG4gICAgdmFyIFN0YWdlID0gcmVxdWlyZSgnLi9zdGFnZScpO1xyXG4gICAgdmFyIEF0b20gPSByZXF1aXJlKCcuL2F0b20nKTtcclxuICAgIHZhciBNaW5kID0ge1xyXG4gICAgICAgIFN0YWdlIDogU3RhZ2UsXHJcbiAgICAgICAgQXRvbSA6IEF0b21cclxuICAgIH1cclxuICAgIHJldHVybiBNaW5kO1xyXG59KTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9jYW1lcmEnKTtcclxuXHJcbmZ1bmN0aW9uIFN0YWdlKHBhcmFtcykge1xyXG4gICAgaWYgKCFwYXJhbXMpIHtcclxuICAgICAgICB1dGlscy50aHJvdygncGFyYW1zIGZvciBTdGFnZSBjb25zdHJ1Y3RvciByZXF1aXJlZC4nKTtcclxuICAgIH1cclxuICAgIGlmICghcGFyYW1zLmNvbnRhaW5lcikge1xyXG4gICAgICAgIHV0aWxzLnRocm93KCdjb250YWluZXIgcGFyYW1ldGVyIGlzIHJlcXVpcmVkLicpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hdG9tcyA9IFtdO1xyXG4gICAgdGhpcy5fY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFyYW1zLmNvbnRhaW5lcik7XHJcblxyXG4gICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLndpZHRoID0gcGFyYW1zLndpZHRoICsgJ3B4JztcclxuICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBwYXJhbXMuaGVpZ2h0ICsgJ3B4JztcclxuXHJcbiAgICB0aGlzLndpZHRoID0gcGFyYW1zLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBwYXJhbXMuaGVpZ2h0O1xyXG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XHJcblxyXG4gICAgdGhpcy5faW5pdEJhY2tncm91bmQoKTtcclxuICAgIHRoaXMuX2luaXRBdG9tQ29udGFpbmVyKCk7XHJcbiAgICB0aGlzLl9zZXR1cERyYWdDYW1lcmEoKTtcclxuICAgIHRoaXMuX3NldHVwQXRvbURyYWcoKTtcclxuICAgIHRoaXMuX3NldHVwS2V5Ym9hcmQoKTtcclxufVxyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9zZXR1cEF0b21EcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWMgPSBuZXcgSGFtbWVyLk1hbmFnZXIodGhpcy5fY29udGFpbmVyKTtcclxuXHJcbiAgICBtYy5hZGQobmV3IEhhbW1lci5QYW4oeyB0aHJlc2hvbGQ6IDAsIHBvaW50ZXJzOiAwIH0pKTtcclxuXHJcbiAgICB2YXIgZHJhZ0VsZW1lbnQ7XHJcbiAgICBtYy5vbihcInBhbnN0YXJ0XCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBkcmFnRWxlbWVudCA9IGUudGFyZ2V0O1xyXG4gICAgfSk7XHJcbiAgICBtYy5vbihcInBhbm1vdmVcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICB2YXIgYXRvbSA9IGRyYWdFbGVtZW50Ll9hdG9tO1xyXG4gICAgICAgIGlmICghYXRvbSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF0b20ueCA9IGUuY2hhbmdlZFBvaW50ZXJzWzBdLmNsaWVudFggKyB0aGlzLmNhbWVyYS54O1xyXG4gICAgICAgIGF0b20ueSA9IGUuY2hhbmdlZFBvaW50ZXJzWzBdLmNsaWVudFkgICsgdGhpcy5jYW1lcmEueTtcclxuICAgICAgICBhdG9tLl9wb3NpdGlvbmluZygpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5hZGRBdG9tID0gZnVuY3Rpb24obykge1xyXG4gICAgdGhpcy5hdG9tcy5wdXNoKG8pO1xyXG4gICAgaWYgKHRoaXMuX2lzQXRvbVZpc2libGUobykpIHtcclxuICAgICAgICB0aGlzLl9hdG9tQ29udGFpbmVyLmFwcGVuZENoaWxkKG8ubm9kZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX2lzQXRvbVZpc2libGUgPSBmdW5jdGlvbihhdG9tKSB7XHJcbiAgICB2YXIgY2FtZXJhWCA9IHRoaXMuY2FtZXJhLng7XHJcbiAgICB2YXIgY2FtZXJhWSA9IHRoaXMuY2FtZXJhLnk7XHJcbiAgICB2YXIgc2NyZWVuV2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdmFyIHNjcmVlbkhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgaWYgKGF0b20ueCA+IGNhbWVyYVggLSBzY3JlZW5XaWR0aCAgJiYgYXRvbS54IDwgY2FtZXJhWCArIHNjcmVlbldpZHRoICogMiAmJlxyXG4gICAgICAgIGF0b20ueSA+IGNhbWVyYVkgLSBzY3JlZW5IZWlnaHQgJiYgYXRvbS55IDwgY2FtZXJhWSArIHNjcmVlbkhlaWdodCAqIDIpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbi8vc2V0IGJhY2tncm91bmQoYmFja2dyb3VuZCkge1xyXG4vLyAgICBpZiAoYmFja2dyb3VuZC5pbmRleE9mKCcvJykgIT09IC0xKSB7XHJcbi8vICAgICAgICB0aGlzLl9iYWNrLnN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10gPSAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJztcclxuLy8gICAgICAgIHRoaXMuX2JhY2suc3R5bGVbJ2JhY2tncm91bmQtY29sb3InXSA9ICcnO1xyXG4vLyAgICB9IGVsc2Uge1xyXG4vLyAgICAgICAgdGhpcy5fYmFjay5zdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddID0gJyc7XHJcbi8vICAgICAgICB0aGlzLl9iYWNrLnN0eWxlWydiYWNrZ3JvdW5kLWNvbG9yJ10gPSBiYWNrZ3JvdW5kO1xyXG4vLyAgICB9XHJcbi8vfVxyXG4vL1xyXG4vL2hpZGUoKSB7XHJcbi8vICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4vL31cclxuLy9cclxuLy9zaG93KCkge1xyXG4vLyAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4vL31cclxuXHJcblN0YWdlLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24ocGFyYW0pIHtcclxuICAgIC8vdGhpcy5fc3RhZ2Uuc2V0V2lkdGgocGFyYW0ud2lkdGgpO1xyXG4gICAgLy90aGlzLl9zdGFnZS5zZXRIZWlnaHQocGFyYW0uaGVpZ2h0KTtcclxuICAgIC8vdGhpcy5fYmFjay53aWR0aChwYXJhbS53aWR0aCk7XHJcbiAgICAvL3RoaXMuX2JhY2suaGVpZ2h0KHBhcmFtLmhlaWdodCk7XHJcbiAgICAvL3RoaXMuY2FtZXJhLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgLy90aGlzLmNhbWVyYS50cmlnZ2VyKCdjaGFuZ2U6c2NhbGUnKTtcclxuICAgIC8vdGhpcy5fYmFja0xheWVyLmRyYXcoKTtcclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5fcG9zaXRpb25CYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9iYWNrLnN0eWxlWydiYWNrZ3JvdW5kLXBvc2l0aW9uJ10gPSAtdGhpcy5jYW1lcmEueCArICdweCAnICsgLXRoaXMuY2FtZXJhLnkgKyAncHgnO1xyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9pbml0QmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5fYmFjayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgdGhpcy5fY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2JhY2spO1xyXG4gICAgdGhpcy5fYmFjay5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICB0aGlzLl9iYWNrLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVaKC0xKSc7XHJcbiAgICB0aGlzLl9iYWNrLnN0eWxlWyctd2Via2l0LXRyYW5zZm9ybSddID0gJ3RyYW5zbGF0ZVooLTEpJztcclxuICAgIHRoaXMuX2JhY2suc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcbiAgICB0aGlzLl9iYWNrLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcclxuICAgIHRoaXMuX3Bvc2l0aW9uQmFjaygpO1xyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9wb3NpdGlvbkF0b21Db250YWluZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuX2F0b21Db250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIC10aGlzLmNhbWVyYS54ICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyAtdGhpcy5jYW1lcmEueSArICdweCknO1xyXG4gICAgdGhpcy5fYXRvbUNvbnRhaW5lci5zdHlsZVsnLXdlYmtpdC10cmFuc2Zvcm0nXSA9ICd0cmFuc2xhdGVYKCcgKyAtdGhpcy5jYW1lcmEueCArICdweCkgdHJhbnNsYXRlWSgnICsgLXRoaXMuY2FtZXJhLnkgKyAncHgpJztcclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5faW5pdEF0b21Db250YWluZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuX2F0b21Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9hdG9tQ29udGFpbmVyKTtcclxuICAgIHRoaXMuX2F0b21Db250YWluZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgdGhpcy5fYXRvbUNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWigtMSknO1xyXG4gICAgdGhpcy5fYXRvbUNvbnRhaW5lci5zdHlsZVsnLXdlYmtpdC10cmFuc2Zvcm0nXSA9ICd0cmFuc2xhdGVaKC0xKSc7XHJcbiAgICB0aGlzLl9wb3NpdGlvbkF0b21Db250YWluZXIoKTtcclxufTtcclxuXHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX3NldHVwRHJhZ0NhbWVyYSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1jID0gbmV3IEhhbW1lci5NYW5hZ2VyKHRoaXMuX2JhY2spO1xyXG5cclxuICAgIG1jLmFkZChuZXcgSGFtbWVyLlBhbih7IHRocmVzaG9sZDogMCwgcG9pbnRlcnM6IDAgfSkpO1xyXG4gICAgdmFyIHByZXZpb3VzID0ge307XHJcbiAgICBtYy5vbihcInBhbnN0YXJ0XCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBwcmV2aW91cyA9IGUuY2VudGVyO1xyXG4gICAgfSk7XHJcbiAgICBtYy5vbihcInBhbm1vdmVcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSB7XHJcbiAgICAgICAgICAgIHggOiBlLmNlbnRlci54ICsgZS5kZWx0YVgsXHJcbiAgICAgICAgICAgIHkgOiBlLmNlbnRlci55ICsgZS5kZWx0YVlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBkeCA9IHByZXZpb3VzLnggLSBuZXdQb3MueDtcclxuICAgICAgICB2YXIgZHkgPSBwcmV2aW91cy55IC0gbmV3UG9zLnk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEubW92ZShkeCwgZHkpO1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uQmFjaygpO1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uQXRvbUNvbnRhaW5lcigpO1xyXG4gICAgICAgIHRoaXMuX3JlcXVlc3RDaGVja1Zpc2lhYmlsaXR5KCk7XHJcbiAgICAgICAgcHJldmlvdXMgPSBuZXdQb3M7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9yZXF1ZXN0Q2hlY2tWaXNpYWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuX2NoZWNrVmlzaWJpbGl0eVdhaXRpbmcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLl9jaGVja1Zpc2liaWxpdHlXYWl0aW5nID0gdHJ1ZTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5hdG9tcy5mb3JFYWNoKGZ1bmN0aW9uKGF0b20pIHtcclxuICAgICAgICAgICAgdmFyIHZpc2libGUgPSB0aGlzLl9pc0F0b21WaXNpYmxlKGF0b20pO1xyXG4gICAgICAgICAgICBpZiAodmlzaWJsZSAmJiAhYXRvbS5ub2RlLnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2F0b21Db250YWluZXIuYXBwZW5kQ2hpbGQoYXRvbS5ub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghdmlzaWJsZSAmJiBhdG9tLm5vZGUucGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgYXRvbS5ub2RlLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYXRvbS5ub2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5fY2hlY2tWaXNpYmlsaXR5V2FpdGluZyA9IGZhbHNlO1xyXG4gICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9zZXR1cEtleWJvYXJkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cub25rZXlkb3duID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDM3KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnggLT0gMztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueSAtPSAzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzOSkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS54ICs9IDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnkgKz0gMztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdGFnZTsiLCJtb2R1bGUuZXhwb3J0cy50aHJvdyA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcclxuICAgIHRocm93ICdNaW5kSlMgRXJyb3I6ICcgKyBtZXNzYWdlO1xyXG59Il19
