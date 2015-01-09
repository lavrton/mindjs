(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
},{"./node":3,"./stage":4}],3:[function(require,module,exports){
"use strict";

function Node(params) {
    this.x = params.x || 0;
    this.y = params.y || 0;
    this.template = params.template || 'node';
    this._buildNode();
}

Node.prototype._buildNode = function(){
    this.node = document.createElement('div');
    this.node.innerHTML = this.template;

    this.node.className = 'node';
    this.node._atom = this;
    this._positioning();
};

Node.prototype._positioning = function() {
    this.node.style.position = 'absolute';
    this.node.style.transform = 'translateX(' + this.x + 'px) translateY(' + this.y + 'px) translateZ(1px)';
    this.node.style['-webkit-transform'] = 'translateX(' + this.x + 'px) translateY(' + this.y + 'px) translateZ(1px)';
};

module.exports = Node;

},{}],4:[function(require,module,exports){
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
    this.camera = new Camera();
    this.height = params.height || 300;
    this.width = params.width || 300;
    this._setupElements(params.container);
    this._setupDragCamera();
    this._setupAtomDrag();
    this._setupKeyboard();
}

Stage.prototype._setupElements = function(container) {
    this._container = document.getElementById(container);
    if (!this._container) {
        utils.throw('can not find container with id ' + container);
    }
    this._container.style.width = this.width + 'px';
    this._container.style.height = this.height + 'px';

    // first background
    this._initBackground();
    // and atoms on top
    this._initAtomContainer();
};
Stage.prototype._setupAtomDrag = function() {
    var mc = new Hammer.Manager(this._container);

    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

    var dragElement, offset;
    mc.on("panstart", function(e) {
        if (e.target._atom) {
            offset = {
                x : e.target._atom.x - e.changedPointers[0].clientX,
                y : e.target._atom.y - e.changedPointers[0].clientY
            };
        }
        dragElement = e.target;
    });
    mc.on("panmove", function (e) {
        var atom = dragElement._atom;
        if (!atom) {
            return;
        }
        var pointer = e.changedPointers[0];
        atom.x = pointer.clientX + this.camera.x + offset.x;
        atom.y = pointer.clientY  + this.camera.y + offset.y;
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
    var screenWidth = this._container.offsetWidth;
    var screenHeight = this._container.offsetHeight;
    return !!(
        atom.x > cameraX - screenWidth &&
        atom.x < cameraX + screenWidth * 2 &&
        atom.y > cameraY - screenHeight &&
        atom.y < cameraY + screenHeight * 2
    );

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
},{"./camera":1,"./utils":5}],5:[function(require,module,exports){
module.exports.throw = function(message) {
    throw 'MindJS Error: ' + message;
}
},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXG1pbmRqc1xcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21pbmRqcy9zcmMvY2FtZXJhLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21pbmRqcy9zcmMvZmFrZV9jN2QxZDI3ZC5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9taW5kanMvc3JjL25vZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvbWluZGpzL3NyYy9zdGFnZS5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9taW5kanMvc3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gQ2FtZXJhKCkge1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcbiAgICB0aGlzLnNjYWxlID0gMTtcbn1cblxuQ2FtZXJhLnByb3RvdHlwZS5zZXRQb3N0aW9uICA9IGZ1bmN0aW9uKHBvcykge1xuICAgIHRoaXMueCA9IHBvcy54O1xuICAgIHRoaXMueSA9IHBvcy55O1xufTtcblxuQ2FtZXJhLnByb3RvdHlwZS5tb3ZlICA9IGZ1bmN0aW9uKGR4LCBkeSkge1xuICAgIHRoaXMueCArPSBkeDtcbiAgICB0aGlzLnkgKz0gZHk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTsiLCJcInVzZSBzdHJpY3RcIjtcclxuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcclxuICAgIC8vIFN0YXJ0IHdpdGggQU1ELlxyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIEV4cG9ydCBnbG9iYWwgZXZlbiBpbiBBTUQgY2FzZSBpbiBjYXNlIHRoaXMgc2NyaXB0IGlzIGxvYWRlZCB3aXRoXHJcbiAgICAgICAgICAgIHJvb3QuTWluZCA9IGZhY3RvcnkoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJvb3QuTWluZDtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBOZXh0IGZvciBOb2RlLmpzIG9yIENvbW1vbkpTLiBqUXVlcnkgbWF5IG5vdCBiZSBuZWVkZWQgYXMgYSBtb2R1bGUuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xyXG4gICAgICAgIHdpbmRvdy5NaW5kID0gbW9kdWxlLmV4cG9ydHM7XHJcbiAgICAgICAgLy8gRmluYWxseSwgYXMgYSBicm93c2VyIGdsb2JhbC5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm9vdC5NaW5kID0gZmFjdG9yeSgpO1xyXG4gICAgfVxyXG59KGZ1bmN0aW9uIGZhY3RvcnkoKSB7XHJcbiAgICB2YXIgU3RhZ2UgPSByZXF1aXJlKCcuL3N0YWdlJyk7XHJcbiAgICB2YXIgTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBTdGFnZTogU3RhZ2UsXHJcbiAgICAgICAgTm9kZTogTm9kZVxyXG4gICAgfTtcclxufSkpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBOb2RlKHBhcmFtcykge1xuICAgIHRoaXMueCA9IHBhcmFtcy54IHx8IDA7XG4gICAgdGhpcy55ID0gcGFyYW1zLnkgfHwgMDtcbiAgICB0aGlzLnRlbXBsYXRlID0gcGFyYW1zLnRlbXBsYXRlIHx8ICdub2RlJztcbiAgICB0aGlzLl9idWlsZE5vZGUoKTtcbn1cblxuTm9kZS5wcm90b3R5cGUuX2J1aWxkTm9kZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5ub2RlLmlubmVySFRNTCA9IHRoaXMudGVtcGxhdGU7XG5cbiAgICB0aGlzLm5vZGUuY2xhc3NOYW1lID0gJ25vZGUnO1xuICAgIHRoaXMubm9kZS5fYXRvbSA9IHRoaXM7XG4gICAgdGhpcy5fcG9zaXRpb25pbmcoKTtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9wb3NpdGlvbmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubm9kZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5ub2RlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyB0aGlzLnggKyAncHgpIHRyYW5zbGF0ZVkoJyArIHRoaXMueSArICdweCkgdHJhbnNsYXRlWigxcHgpJztcbiAgICB0aGlzLm5vZGUuc3R5bGVbJy13ZWJraXQtdHJhbnNmb3JtJ10gPSAndHJhbnNsYXRlWCgnICsgdGhpcy54ICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyB0aGlzLnkgKyAncHgpIHRyYW5zbGF0ZVooMXB4KSc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5vZGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9jYW1lcmEnKTtcclxuXHJcbmZ1bmN0aW9uIFN0YWdlKHBhcmFtcykge1xyXG4gICAgaWYgKCFwYXJhbXMpIHtcclxuICAgICAgICB1dGlscy50aHJvdygncGFyYW1zIGZvciBTdGFnZSBjb25zdHJ1Y3RvciByZXF1aXJlZC4nKTtcclxuICAgIH1cclxuICAgIGlmICghcGFyYW1zLmNvbnRhaW5lcikge1xyXG4gICAgICAgIHV0aWxzLnRocm93KCdjb250YWluZXIgcGFyYW1ldGVyIGlzIHJlcXVpcmVkLicpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hdG9tcyA9IFtdO1xyXG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XHJcbiAgICB0aGlzLmhlaWdodCA9IHBhcmFtcy5oZWlnaHQgfHwgMzAwO1xyXG4gICAgdGhpcy53aWR0aCA9IHBhcmFtcy53aWR0aCB8fCAzMDA7XHJcbiAgICB0aGlzLl9zZXR1cEVsZW1lbnRzKHBhcmFtcy5jb250YWluZXIpO1xyXG4gICAgdGhpcy5fc2V0dXBEcmFnQ2FtZXJhKCk7XHJcbiAgICB0aGlzLl9zZXR1cEF0b21EcmFnKCk7XHJcbiAgICB0aGlzLl9zZXR1cEtleWJvYXJkKCk7XHJcbn1cclxuXHJcblN0YWdlLnByb3RvdHlwZS5fc2V0dXBFbGVtZW50cyA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xyXG4gICAgdGhpcy5fY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyKTtcclxuICAgIGlmICghdGhpcy5fY29udGFpbmVyKSB7XHJcbiAgICAgICAgdXRpbHMudGhyb3coJ2NhbiBub3QgZmluZCBjb250YWluZXIgd2l0aCBpZCAnICsgY29udGFpbmVyKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS53aWR0aCA9IHRoaXMud2lkdGggKyAncHgnO1xyXG4gICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICsgJ3B4JztcclxuXHJcbiAgICAvLyBmaXJzdCBiYWNrZ3JvdW5kXHJcbiAgICB0aGlzLl9pbml0QmFja2dyb3VuZCgpO1xyXG4gICAgLy8gYW5kIGF0b21zIG9uIHRvcFxyXG4gICAgdGhpcy5faW5pdEF0b21Db250YWluZXIoKTtcclxufTtcclxuU3RhZ2UucHJvdG90eXBlLl9zZXR1cEF0b21EcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWMgPSBuZXcgSGFtbWVyLk1hbmFnZXIodGhpcy5fY29udGFpbmVyKTtcclxuXHJcbiAgICBtYy5hZGQobmV3IEhhbW1lci5QYW4oeyB0aHJlc2hvbGQ6IDAsIHBvaW50ZXJzOiAwIH0pKTtcclxuXHJcbiAgICB2YXIgZHJhZ0VsZW1lbnQsIG9mZnNldDtcclxuICAgIG1jLm9uKFwicGFuc3RhcnRcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmIChlLnRhcmdldC5fYXRvbSkge1xyXG4gICAgICAgICAgICBvZmZzZXQgPSB7XHJcbiAgICAgICAgICAgICAgICB4IDogZS50YXJnZXQuX2F0b20ueCAtIGUuY2hhbmdlZFBvaW50ZXJzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgICAgICB5IDogZS50YXJnZXQuX2F0b20ueSAtIGUuY2hhbmdlZFBvaW50ZXJzWzBdLmNsaWVudFlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhZ0VsZW1lbnQgPSBlLnRhcmdldDtcclxuICAgIH0pO1xyXG4gICAgbWMub24oXCJwYW5tb3ZlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIGF0b20gPSBkcmFnRWxlbWVudC5fYXRvbTtcclxuICAgICAgICBpZiAoIWF0b20pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcG9pbnRlciA9IGUuY2hhbmdlZFBvaW50ZXJzWzBdO1xyXG4gICAgICAgIGF0b20ueCA9IHBvaW50ZXIuY2xpZW50WCArIHRoaXMuY2FtZXJhLnggKyBvZmZzZXQueDtcclxuICAgICAgICBhdG9tLnkgPSBwb2ludGVyLmNsaWVudFkgICsgdGhpcy5jYW1lcmEueSArIG9mZnNldC55O1xyXG4gICAgICAgIGF0b20uX3Bvc2l0aW9uaW5nKCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLmFkZEF0b20gPSBmdW5jdGlvbihvKSB7XHJcbiAgICB0aGlzLmF0b21zLnB1c2gobyk7XHJcbiAgICBpZiAodGhpcy5faXNBdG9tVmlzaWJsZShvKSkge1xyXG4gICAgICAgIHRoaXMuX2F0b21Db250YWluZXIuYXBwZW5kQ2hpbGQoby5ub2RlKTtcclxuICAgIH1cclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5faXNBdG9tVmlzaWJsZSA9IGZ1bmN0aW9uKGF0b20pIHtcclxuICAgIHZhciBjYW1lcmFYID0gdGhpcy5jYW1lcmEueDtcclxuICAgIHZhciBjYW1lcmFZID0gdGhpcy5jYW1lcmEueTtcclxuICAgIHZhciBzY3JlZW5XaWR0aCA9IHRoaXMuX2NvbnRhaW5lci5vZmZzZXRXaWR0aDtcclxuICAgIHZhciBzY3JlZW5IZWlnaHQgPSB0aGlzLl9jb250YWluZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgcmV0dXJuICEhKFxyXG4gICAgICAgIGF0b20ueCA+IGNhbWVyYVggLSBzY3JlZW5XaWR0aCAmJlxyXG4gICAgICAgIGF0b20ueCA8IGNhbWVyYVggKyBzY3JlZW5XaWR0aCAqIDIgJiZcclxuICAgICAgICBhdG9tLnkgPiBjYW1lcmFZIC0gc2NyZWVuSGVpZ2h0ICYmXHJcbiAgICAgICAgYXRvbS55IDwgY2FtZXJhWSArIHNjcmVlbkhlaWdodCAqIDJcclxuICAgICk7XHJcblxyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9wb3NpdGlvbkJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuX2JhY2suc3R5bGVbJ2JhY2tncm91bmQtcG9zaXRpb24nXSA9IC10aGlzLmNhbWVyYS54ICsgJ3B4ICcgKyAtdGhpcy5jYW1lcmEueSArICdweCc7XHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX2luaXRCYWNrZ3JvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9iYWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB0aGlzLl9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fYmFjayk7XHJcbiAgICB0aGlzLl9iYWNrLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgIHRoaXMuX2JhY2suc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVooLTEpJztcclxuICAgIHRoaXMuX2JhY2suc3R5bGVbJy13ZWJraXQtdHJhbnNmb3JtJ10gPSAndHJhbnNsYXRlWigtMSknO1xyXG4gICAgdGhpcy5fYmFjay5zdHlsZS53aWR0aCA9ICcxMDAlJztcclxuICAgIHRoaXMuX2JhY2suc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xyXG4gICAgdGhpcy5fcG9zaXRpb25CYWNrKCk7XHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX3Bvc2l0aW9uQXRvbUNvbnRhaW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5fYXRvbUNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgLXRoaXMuY2FtZXJhLnggKyAncHgpIHRyYW5zbGF0ZVkoJyArIC10aGlzLmNhbWVyYS55ICsgJ3B4KSc7XHJcbiAgICB0aGlzLl9hdG9tQ29udGFpbmVyLnN0eWxlWyctd2Via2l0LXRyYW5zZm9ybSddID0gJ3RyYW5zbGF0ZVgoJyArIC10aGlzLmNhbWVyYS54ICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyAtdGhpcy5jYW1lcmEueSArICdweCknO1xyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9pbml0QXRvbUNvbnRhaW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5fYXRvbUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgdGhpcy5fY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2F0b21Db250YWluZXIpO1xyXG4gICAgdGhpcy5fYXRvbUNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICB0aGlzLl9hdG9tQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVaKC0xKSc7XHJcbiAgICB0aGlzLl9hdG9tQ29udGFpbmVyLnN0eWxlWyctd2Via2l0LXRyYW5zZm9ybSddID0gJ3RyYW5zbGF0ZVooLTEpJztcclxuICAgIHRoaXMuX3Bvc2l0aW9uQXRvbUNvbnRhaW5lcigpO1xyXG59O1xyXG5cclxuXHJcblN0YWdlLnByb3RvdHlwZS5fc2V0dXBEcmFnQ2FtZXJhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWMgPSBuZXcgSGFtbWVyLk1hbmFnZXIodGhpcy5fYmFjayk7XHJcblxyXG4gICAgbWMuYWRkKG5ldyBIYW1tZXIuUGFuKHsgdGhyZXNob2xkOiAwLCBwb2ludGVyczogMCB9KSk7XHJcbiAgICB2YXIgcHJldmlvdXMgPSB7fTtcclxuICAgIG1jLm9uKFwicGFuc3RhcnRcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHByZXZpb3VzID0gZS5jZW50ZXI7XHJcbiAgICB9KTtcclxuICAgIG1jLm9uKFwicGFubW92ZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIG5ld1BvcyA9IHtcclxuICAgICAgICAgICAgeCA6IGUuY2VudGVyLnggKyBlLmRlbHRhWCxcclxuICAgICAgICAgICAgeSA6IGUuY2VudGVyLnkgKyBlLmRlbHRhWVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGR4ID0gcHJldmlvdXMueCAtIG5ld1Bvcy54O1xyXG4gICAgICAgIHZhciBkeSA9IHByZXZpb3VzLnkgLSBuZXdQb3MueTtcclxuICAgICAgICB0aGlzLmNhbWVyYS5tb3ZlKGR4LCBkeSk7XHJcbiAgICAgICAgdGhpcy5fcG9zaXRpb25CYWNrKCk7XHJcbiAgICAgICAgdGhpcy5fcG9zaXRpb25BdG9tQ29udGFpbmVyKCk7XHJcbiAgICAgICAgdGhpcy5fcmVxdWVzdENoZWNrVmlzaWFiaWxpdHkoKTtcclxuICAgICAgICBwcmV2aW91cyA9IG5ld1BvcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX3JlcXVlc3RDaGVja1Zpc2lhYmlsaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5fY2hlY2tWaXNpYmlsaXR5V2FpdGluZykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuX2NoZWNrVmlzaWJpbGl0eVdhaXRpbmcgPSB0cnVlO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmF0b21zLmZvckVhY2goZnVuY3Rpb24oYXRvbSkge1xyXG4gICAgICAgICAgICB2YXIgdmlzaWJsZSA9IHRoaXMuX2lzQXRvbVZpc2libGUoYXRvbSk7XHJcbiAgICAgICAgICAgIGlmICh2aXNpYmxlICYmICFhdG9tLm5vZGUucGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYXRvbUNvbnRhaW5lci5hcHBlbmRDaGlsZChhdG9tLm5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF2aXNpYmxlICYmIGF0b20ubm9kZS5wYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBhdG9tLm5vZGUucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChhdG9tLm5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLl9jaGVja1Zpc2liaWxpdHlXYWl0aW5nID0gZmFsc2U7XHJcbiAgICB9LmJpbmQodGhpcyksIDEwMCk7XHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX3NldHVwS2V5Ym9hcmQgPSBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5vbmtleWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzcpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueCAtPSAzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzOCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS55IC09IDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDM5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnggKz0gMztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gNDApIHtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueSArPSAzO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWdlOyIsIm1vZHVsZS5leHBvcnRzLnRocm93ID0gZnVuY3Rpb24obWVzc2FnZSkge1xyXG4gICAgdGhyb3cgJ01pbmRKUyBFcnJvcjogJyArIG1lc3NhZ2U7XHJcbn0iXX0=
