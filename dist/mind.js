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
var Event = require('./event');

function Connector(params) {
    this.atoms = params.atoms;
    this._buildConnector();
    this._listenAtoms();
}

var p = Connector.prototype;
Event.mixin(p);

p._buildConnector = function(){
    this.el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.el.appendChild(this.line);

    this.el._connector = this;
    this._updateAttrs();
    this._positioning();
};

p._listenAtoms = function() {
    this.atoms.forEach(function(atom) {
        this.listenTo(atom, 'change:position', this._onAtomPosChange);
    }.bind(this));
};

p._onAtomPosChange = function() {
    this._updatePositionAttrs();
    this._positioning();
};

p._positioning = function() {
    this.el.style.position = 'absolute';
    this.el.style.transform = 'translateX(' + parseInt(this.x) + 'px) translateY(' + parseInt(this.y) + 'px) translateZ(1px)';
    this.el.style['-webkit-transform'] = 'translateX(' + parseInt(this.x) + 'px) translateY(' + parseInt(this.y) + 'px) translateZ(1px)';
};

p._updateAttrs = function() {
    this.line.setAttribute('stroke', 'black');
    this.line.setAttribute('stroke-width', 3);
    this._updatePositionAttrs();
};

p._updatePositionAttrs = function() {
    var minX = Math.min(this.atoms[0].x, this.atoms[1].x);
    var maxX = Math.max(this.atoms[0].x, this.atoms[1].x);

    var minY = Math.min(this.atoms[0].y, this.atoms[1].y);
    var maxY = Math.max(this.atoms[0].y, this.atoms[1].y);

    this.x = minX;
    this.y = minY;

    var width = maxX - minX;
    var height = maxY - minY;

    this.el.setAttribute('width', width);
    this.el.setAttribute('height', height);

    this.line.setAttribute('x1', this.atoms[0].x - minX);
    this.line.setAttribute('y1', this.atoms[0].y - minY);

    this.line.setAttribute('x2', this.atoms[1].x - minX);
    this.line.setAttribute('y2', this.atoms[1].y - minY);
}



module.exports = Connector;

},{"./event":3}],3:[function(require,module,exports){
/**
 * Standalone extraction of Backbone.Events, no external dependency required.
 * Degrades nicely when Backone/underscore are already available in the current
 * global context.
 *
 * Note that docs suggest to use underscore's `_.extend()` method to add Events
 * support to some given object. A `mixin()` method has been added to the Events
 * prototype to avoid using underscore for that sole purpose:
 *
 *     var myEventEmitter = BackboneEvents.mixin({});
 *
 * Or for a function constructor:
 *
 *     function MyConstructor(){}
 *     MyConstructor.prototype.foo = function(){}
 *     BackboneEvents.mixin(MyConstructor.prototype);
 *
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * (c) 2013 Nicolas Perriault
 */
/* global exports:true, define, module */
(function() {
  var root = this,
      nativeForEach = Array.prototype.forEach,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      slice = Array.prototype.slice,
      idCounter = 0;

  // Returns a partial implementation matching the minimal API subset required
  // by Backbone.Events
  function miniscore() {
    return {
      keys: Object.keys || function (obj) {
        if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
          throw new TypeError("keys() called on a non-object");
        }
        var key, keys = [];
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            keys[keys.length] = key;
          }
        }
        return keys;
      },

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      has: function(obj, key) {
        return hasOwnProperty.call(obj, key);
      },

      each: function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            iterator.call(context, obj[i], i, obj);
          }
        } else {
          for (var key in obj) {
            if (this.has(obj, key)) {
              iterator.call(context, obj[key], key, obj);
            }
          }
        }
      },

      once: function(func) {
        var ran = false, memo;
        return function() {
          if (ran) return memo;
          ran = true;
          memo = func.apply(this, arguments);
          func = null;
          return memo;
        };
      }
    };
  }

  var _ = miniscore(), Events;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Mixin utility
  Events.mixin = function(proto) {
    var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
                   'listenToOnce', 'bind', 'unbind'];
    _.each(exports, function(name) {
      proto[name] = this[name];
    }, this);
    return proto;
  };

  // Export Events as BackboneEvents depending on current context
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Events;
    }
    exports.BackboneEvents = Events;
  }else if (typeof define === "function") {
    define(function() {
      return Events;
    });
  } else {
    root.BackboneEvents = Events;
  }
})(this);

},{}],4:[function(require,module,exports){
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
},{"./connector":2,"./node":5,"./stage":6}],5:[function(require,module,exports){
"use strict";
var Event = require('./event');

function Node(params) {
    this.x = params.x || 0;
    this.y = params.y || 0;
    this.template = params.template || 'node';
    this._buildNode();
};

var p = Node.prototype;
Event.mixin(p);

p.setPosition = function(pos) {
    this.x = pos.x;
    this.y = pos.y;
    this._positioning();
    this.trigger('change:position', this);
};

p._buildNode = function(){
    this.el = document.createElement('div');
    this.el.innerHTML = this.template;

    this.el.className = 'node';
    this.el._node = this;
    this._updateAttrs();
    this._positioning();
};

p._positioning = function() {
    this.el.style.position = 'absolute';
    this.el.style.transform = 'translateX(' + parseInt(this.x - this._width / 2) + 'px) translateY(' + parseInt(this.y - this._height / 2) + 'px) translateZ(1px)';
    this.el.style['-webkit-transform'] = 'translateX(' + parseInt(this.x - this._width / 2) + 'px) translateY(' + parseInt(this.y - this._height / 2) + 'px) translateZ(1px)';
};

p._updateAttrs = function() {
    this._width = this.el.offsetWidth;
    this._height = this.el.offsetHeight;
}

module.exports = Node;

},{"./event":3}],6:[function(require,module,exports){
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
    this.nodes = [];
    this.connectors = [];
    this.camera = new Camera();
    this.height = params.height || 300;
    this.width = params.width || 300;
    this._setupElements(params.container);
    this._updateSize();
    this._setupDragCamera();
    this._setupNodeDrag();
    this._setupKeyboard();
}

var p = Stage.prototype;

p.addNode = function(o) {
    this.nodes.push(o);
    if (this._isNodeVisible(o)) {
        this._nodeContainer.appendChild(o.el);
        o._updateAttrs();
        o._positioning();
    }
};

p.addConnector = function(o) {
    this.connectors.push(o);
    if (true) {
        this._connectorContainer.appendChild(o.el);
    }
};

p.setSize = function(params) {
    this.width = params.width;
    this.height = params.height;
    this._updateSize();   
};

p.checkVisibility = function() {
    this._requestCheckVisiability();
}

p._updateSize = function() {
    this._container.style.width = this.width + 'px';
    this._container.style.height = this.height + 'px';
    this._back.style.width = this.width + 'px';
    this._back.style.height = this.height + 'px';
}

Stage.prototype._setupElements = function(container) {
    this._container = document.getElementById(container);
    if (!this._container) {
        utils.throw('can not find container with id ' + container);
    }
    this._container.style.overflow = "hidden";

    // first background
    this._initBackground();
    // then connectors
    this._initConnectorsContainer();
    // and nodes on top
    this._initNodeContainer();
};
Stage.prototype._setupNodeDrag = function() {
    var mc = new Hammer.Manager(this._container);

    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

    var dragElement, offset;
    mc.on("panstart", function(e) {
        if (e.target._node) {
            var localPos = this._g2l(e.target._node);
            offset = {
                x : localPos.x - e.changedPointers[0].clientX,
                y : localPos.y - e.changedPointers[0].clientY
            };
        }
        dragElement = e.target;
    }.bind(this));
    mc.on("panmove", function (e) {
        var node = dragElement._node;
        if (!node) {
            return;
        }
        var pointer = e.changedPointers[0];
        var localPos = {
            x :  pointer.clientX + offset.x,
            y : pointer.clientY + offset.y
        };
        var globalPos = this._l2g(localPos);
        node.setPosition(globalPos);
    }.bind(this));
};

Stage.prototype._l2g = function(lP) {
    return {
        x: (lP.x + this.camera.x * this.camera.scale - this.width / 2) / this.camera.scale,
        y: (lP.y + this.camera.y * this.camera.scale - this.height / 2) / this.camera.scale
    };
};

Stage.prototype._g2l = function(gP) {
    return {
        x: gP.x * this.camera.scale - this.camera.x * this.camera.scale + this.width / 2,
        y: gP.y * this.camera.scale - this.camera.y * this.camera.scale + this.height / 2
    };
};

Stage.prototype._isNodeVisible = function(node) {
    var cameraX = this.camera.x;
    var cameraY = this.camera.y;
    return !!(
        node.x > cameraX - this.width &&
        node.x < cameraX + this.width &&
        node.y > cameraY - this.height &&
        node.y < cameraY + this.height
    );

};

Stage.prototype._positionBack = function() {
    this._back.style['background-position'] = -this.camera.x + 'px ' + -this.camera.y + 'px';
};

Stage.prototype._initBackground = function() {
    this._back = document.createElement('div');
    this._container.appendChild(this._back);
    this._back.style.position = 'fixed';
    this._back.style.transform = 'translateZ(-1)';
    this._back.style['-webkit-transform'] = 'translateZ(-1)';
    this._positionBack();
};

Stage.prototype._positionNodeContainer = function() {
    this._nodeContainer.style.transform = 'translateX(' + parseInt(-this.camera.x + this.width / 2 )+ 'px) translateY(' + parseInt(-this.camera.y + this.height / 2) + 'px)';
    this._nodeContainer.style['-webkit-transform'] = 'translateX(' + parseInt(-this.camera.x + this.width / 2) + 'px) translateY(' + parseInt(-this.camera.y + this.height / 2) + 'px)';
};

Stage.prototype._positionConnectorContainer = function() {
    this._connectorContainer.style.transform = 'translateX(' + parseInt(-this.camera.x + this.width / 2 )+ 'px) translateY(' + parseInt(-this.camera.y + this.height / 2) + 'px)';
    this._connectorContainer.style['-webkit-transform'] = 'translateX(' + parseInt(-this.camera.x + this.width / 2) + 'px) translateY(' + parseInt(-this.camera.y + this.height / 2) + 'px)';
};

Stage.prototype._initNodeContainer = function() {
    this._nodeContainer = document.createElement('div');
    this._container.appendChild(this._nodeContainer);
    this._nodeContainer.style.transform = 'translateZ(-1)';
    this._nodeContainer.style['-webkit-transform'] = 'translateZ(-1)';
    this._positionNodeContainer();
};

Stage.prototype._initConnectorsContainer = function() {
    this._connectorContainer = document.createElement('div');
    this._container.appendChild(this._connectorContainer);
    this._connectorContainer.style.transform = 'translateZ(-1)';
    this._connectorContainer.style['-webkit-transform'] = 'translateZ(-1)';
    this._positionConnectorContainer();
};

Stage.prototype._setupDragCamera = function() {
    this._setupDragStageOnEl(this._back);
    this._setupDragStageOnEl(this._connectorContainer);
};
Stage.prototype._setupDragStageOnEl = function(el) {
    var mc = new Hammer.Manager(el);

    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    var previous = {};
    mc.on("panstart", function(e) {
        previous = {
            x : e.pointers[0].clientX,
            y : e.pointers[0].clientY
        };
    });
    mc.on("panmove", function(e) {
        var newPos = {
            x : e.pointers[0].clientX,
            y : e.pointers[0].clientY
        };
        var dx = previous.x - newPos.x;
        var dy = previous.y - newPos.y;
        this.camera.move(dx, dy);
        this._positionBack();
        this._positionNodeContainer();
        this._positionConnectorContainer();
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
        this.nodes.forEach(function(node) {
            var visible = this._isNodeVisible(node);
            if (visible && !node.el.parentElement) {
                this._nodeContainer.appendChild(node.el);
            } else if (!visible && node.el.parentElement) {
                node.el.parentElement.removeChild(node.el);
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
    }.bind(this);
};

module.exports = Stage;
},{"./camera":1,"./utils":7}],7:[function(require,module,exports){
module.exports.throw = function(message) {
    throw 'MindJS Error: ' + message;
}
},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXG1pbmRqc1xcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21pbmRqcy9zcmMvY2FtZXJhLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21pbmRqcy9zcmMvY29ubmVjdG9yLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21pbmRqcy9zcmMvZXZlbnQuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvbWluZGpzL3NyYy9mYWtlX2VhM2RjMzhmLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21pbmRqcy9zcmMvbm9kZS5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9taW5kanMvc3JjL3N0YWdlLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21pbmRqcy9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNPQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIENhbWVyYSgpIHtcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG4gICAgdGhpcy5zY2FsZSA9IDE7XG59XG5cbkNhbWVyYS5wcm90b3R5cGUuc2V0UG9zdGlvbiAgPSBmdW5jdGlvbihwb3MpIHtcbiAgICB0aGlzLnggPSBwb3MueDtcbiAgICB0aGlzLnkgPSBwb3MueTtcbn07XG5cbkNhbWVyYS5wcm90b3R5cGUubW92ZSAgPSBmdW5jdGlvbihkeCwgZHkpIHtcbiAgICB0aGlzLnggKz0gZHg7XG4gICAgdGhpcy55ICs9IGR5O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmE7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBFdmVudCA9IHJlcXVpcmUoJy4vZXZlbnQnKTtcclxuXHJcbmZ1bmN0aW9uIENvbm5lY3RvcihwYXJhbXMpIHtcclxuICAgIHRoaXMuYXRvbXMgPSBwYXJhbXMuYXRvbXM7XHJcbiAgICB0aGlzLl9idWlsZENvbm5lY3RvcigpO1xyXG4gICAgdGhpcy5fbGlzdGVuQXRvbXMoKTtcclxufVxyXG5cclxudmFyIHAgPSBDb25uZWN0b3IucHJvdG90eXBlO1xyXG5FdmVudC5taXhpbihwKTtcclxuXHJcbnAuX2J1aWxkQ29ubmVjdG9yID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3N2ZycpO1xyXG4gICAgdGhpcy5saW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdsaW5lJyk7XHJcbiAgICB0aGlzLmVsLmFwcGVuZENoaWxkKHRoaXMubGluZSk7XHJcblxyXG4gICAgdGhpcy5lbC5fY29ubmVjdG9yID0gdGhpcztcclxuICAgIHRoaXMuX3VwZGF0ZUF0dHJzKCk7XHJcbiAgICB0aGlzLl9wb3NpdGlvbmluZygpO1xyXG59O1xyXG5cclxucC5fbGlzdGVuQXRvbXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYXRvbXMuZm9yRWFjaChmdW5jdGlvbihhdG9tKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5UbyhhdG9tLCAnY2hhbmdlOnBvc2l0aW9uJywgdGhpcy5fb25BdG9tUG9zQ2hhbmdlKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5wLl9vbkF0b21Qb3NDaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uQXR0cnMoKTtcclxuICAgIHRoaXMuX3Bvc2l0aW9uaW5nKCk7XHJcbn07XHJcblxyXG5wLl9wb3NpdGlvbmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICB0aGlzLmVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwYXJzZUludCh0aGlzLngpICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyBwYXJzZUludCh0aGlzLnkpICsgJ3B4KSB0cmFuc2xhdGVaKDFweCknO1xyXG4gICAgdGhpcy5lbC5zdHlsZVsnLXdlYmtpdC10cmFuc2Zvcm0nXSA9ICd0cmFuc2xhdGVYKCcgKyBwYXJzZUludCh0aGlzLngpICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyBwYXJzZUludCh0aGlzLnkpICsgJ3B4KSB0cmFuc2xhdGVaKDFweCknO1xyXG59O1xyXG5cclxucC5fdXBkYXRlQXR0cnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubGluZS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsICdibGFjaycpO1xyXG4gICAgdGhpcy5saW5lLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywgMyk7XHJcbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbkF0dHJzKCk7XHJcbn07XHJcblxyXG5wLl91cGRhdGVQb3NpdGlvbkF0dHJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWluWCA9IE1hdGgubWluKHRoaXMuYXRvbXNbMF0ueCwgdGhpcy5hdG9tc1sxXS54KTtcclxuICAgIHZhciBtYXhYID0gTWF0aC5tYXgodGhpcy5hdG9tc1swXS54LCB0aGlzLmF0b21zWzFdLngpO1xyXG5cclxuICAgIHZhciBtaW5ZID0gTWF0aC5taW4odGhpcy5hdG9tc1swXS55LCB0aGlzLmF0b21zWzFdLnkpO1xyXG4gICAgdmFyIG1heFkgPSBNYXRoLm1heCh0aGlzLmF0b21zWzBdLnksIHRoaXMuYXRvbXNbMV0ueSk7XHJcblxyXG4gICAgdGhpcy54ID0gbWluWDtcclxuICAgIHRoaXMueSA9IG1pblk7XHJcblxyXG4gICAgdmFyIHdpZHRoID0gbWF4WCAtIG1pblg7XHJcbiAgICB2YXIgaGVpZ2h0ID0gbWF4WSAtIG1pblk7XHJcblxyXG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgd2lkdGgpO1xyXG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGhlaWdodCk7XHJcblxyXG4gICAgdGhpcy5saW5lLnNldEF0dHJpYnV0ZSgneDEnLCB0aGlzLmF0b21zWzBdLnggLSBtaW5YKTtcclxuICAgIHRoaXMubGluZS5zZXRBdHRyaWJ1dGUoJ3kxJywgdGhpcy5hdG9tc1swXS55IC0gbWluWSk7XHJcblxyXG4gICAgdGhpcy5saW5lLnNldEF0dHJpYnV0ZSgneDInLCB0aGlzLmF0b21zWzFdLnggLSBtaW5YKTtcclxuICAgIHRoaXMubGluZS5zZXRBdHRyaWJ1dGUoJ3kyJywgdGhpcy5hdG9tc1sxXS55IC0gbWluWSk7XHJcbn1cclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3I7XHJcbiIsIi8qKlxuICogU3RhbmRhbG9uZSBleHRyYWN0aW9uIG9mIEJhY2tib25lLkV2ZW50cywgbm8gZXh0ZXJuYWwgZGVwZW5kZW5jeSByZXF1aXJlZC5cbiAqIERlZ3JhZGVzIG5pY2VseSB3aGVuIEJhY2tvbmUvdW5kZXJzY29yZSBhcmUgYWxyZWFkeSBhdmFpbGFibGUgaW4gdGhlIGN1cnJlbnRcbiAqIGdsb2JhbCBjb250ZXh0LlxuICpcbiAqIE5vdGUgdGhhdCBkb2NzIHN1Z2dlc3QgdG8gdXNlIHVuZGVyc2NvcmUncyBgXy5leHRlbmQoKWAgbWV0aG9kIHRvIGFkZCBFdmVudHNcbiAqIHN1cHBvcnQgdG8gc29tZSBnaXZlbiBvYmplY3QuIEEgYG1peGluKClgIG1ldGhvZCBoYXMgYmVlbiBhZGRlZCB0byB0aGUgRXZlbnRzXG4gKiBwcm90b3R5cGUgdG8gYXZvaWQgdXNpbmcgdW5kZXJzY29yZSBmb3IgdGhhdCBzb2xlIHB1cnBvc2U6XG4gKlxuICogICAgIHZhciBteUV2ZW50RW1pdHRlciA9IEJhY2tib25lRXZlbnRzLm1peGluKHt9KTtcbiAqXG4gKiBPciBmb3IgYSBmdW5jdGlvbiBjb25zdHJ1Y3RvcjpcbiAqXG4gKiAgICAgZnVuY3Rpb24gTXlDb25zdHJ1Y3Rvcigpe31cbiAqICAgICBNeUNvbnN0cnVjdG9yLnByb3RvdHlwZS5mb28gPSBmdW5jdGlvbigpe31cbiAqICAgICBCYWNrYm9uZUV2ZW50cy5taXhpbihNeUNvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG4gKlxuICogKGMpIDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgSW5jLlxuICogKGMpIDIwMTMgTmljb2xhcyBQZXJyaWF1bHRcbiAqL1xuLyogZ2xvYmFsIGV4cG9ydHM6dHJ1ZSwgZGVmaW5lLCBtb2R1bGUgKi9cbihmdW5jdGlvbigpIHtcbiAgdmFyIHJvb3QgPSB0aGlzLFxuICAgICAgbmF0aXZlRm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLFxuICAgICAgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgICAgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsXG4gICAgICBpZENvdW50ZXIgPSAwO1xuXG4gIC8vIFJldHVybnMgYSBwYXJ0aWFsIGltcGxlbWVudGF0aW9uIG1hdGNoaW5nIHRoZSBtaW5pbWFsIEFQSSBzdWJzZXQgcmVxdWlyZWRcbiAgLy8gYnkgQmFja2JvbmUuRXZlbnRzXG4gIGZ1bmN0aW9uIG1pbmlzY29yZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAga2V5czogT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygb2JqICE9PSBcImZ1bmN0aW9uXCIgfHwgb2JqID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImtleXMoKSBjYWxsZWQgb24gYSBub24tb2JqZWN0XCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBrZXksIGtleXMgPSBbXTtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBrZXlzW2tleXMubGVuZ3RoXSA9IGtleTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICB9LFxuXG4gICAgICB1bmlxdWVJZDogZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICAgICAgfSxcblxuICAgICAgaGFzOiBmdW5jdGlvbihvYmosIGtleSkge1xuICAgICAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gICAgICB9LFxuXG4gICAgICBlYWNoOiBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBpZiAobmF0aXZlRm9yRWFjaCAmJiBvYmouZm9yRWFjaCA9PT0gbmF0aXZlRm9yRWFjaCkge1xuICAgICAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhcyhvYmosIGtleSkpIHtcbiAgICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgb25jZTogZnVuY3Rpb24oZnVuYykge1xuICAgICAgICB2YXIgcmFuID0gZmFsc2UsIG1lbW87XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAocmFuKSByZXR1cm4gbWVtbztcbiAgICAgICAgICByYW4gPSB0cnVlO1xuICAgICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgZnVuYyA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHZhciBfID0gbWluaXNjb3JlKCksIEV2ZW50cztcblxuICAvLyBCYWNrYm9uZS5FdmVudHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQSBtb2R1bGUgdGhhdCBjYW4gYmUgbWl4ZWQgaW4gdG8gKmFueSBvYmplY3QqIGluIG9yZGVyIHRvIHByb3ZpZGUgaXQgd2l0aFxuICAvLyBjdXN0b20gZXZlbnRzLiBZb3UgbWF5IGJpbmQgd2l0aCBgb25gIG9yIHJlbW92ZSB3aXRoIGBvZmZgIGNhbGxiYWNrXG4gIC8vIGZ1bmN0aW9ucyB0byBhbiBldmVudDsgYHRyaWdnZXJgLWluZyBhbiBldmVudCBmaXJlcyBhbGwgY2FsbGJhY2tzIGluXG4gIC8vIHN1Y2Nlc3Npb24uXG4gIC8vXG4gIC8vICAgICB2YXIgb2JqZWN0ID0ge307XG4gIC8vICAgICBfLmV4dGVuZChvYmplY3QsIEJhY2tib25lLkV2ZW50cyk7XG4gIC8vICAgICBvYmplY3Qub24oJ2V4cGFuZCcsIGZ1bmN0aW9uKCl7IGFsZXJ0KCdleHBhbmRlZCcpOyB9KTtcbiAgLy8gICAgIG9iamVjdC50cmlnZ2VyKCdleHBhbmQnKTtcbiAgLy9cbiAgRXZlbnRzID0ge1xuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBhIGBjYWxsYmFja2AgZnVuY3Rpb24uIFBhc3NpbmcgYFwiYWxsXCJgIHdpbGwgYmluZFxuICAgIC8vIHRoZSBjYWxsYmFjayB0byBhbGwgZXZlbnRzIGZpcmVkLlxuICAgIG9uOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgIHRoaXMuX2V2ZW50cyB8fCAodGhpcy5fZXZlbnRzID0ge30pO1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSB8fCAodGhpcy5fZXZlbnRzW25hbWVdID0gW10pO1xuICAgICAgZXZlbnRzLnB1c2goe2NhbGxiYWNrOiBjYWxsYmFjaywgY29udGV4dDogY29udGV4dCwgY3R4OiBjb250ZXh0IHx8IHRoaXN9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBCaW5kIGFuIGV2ZW50IHRvIG9ubHkgYmUgdHJpZ2dlcmVkIGEgc2luZ2xlIHRpbWUuIEFmdGVyIHRoZSBmaXJzdCB0aW1lXG4gICAgLy8gdGhlIGNhbGxiYWNrIGlzIGludm9rZWQsIGl0IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICBvbmNlOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uY2UnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIG9uY2UgPSBfLm9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYub2ZmKG5hbWUsIG9uY2UpO1xuICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICBvbmNlLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgcmV0dXJuIHRoaXMub24obmFtZSwgb25jZSwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuIElmIGBjb250ZXh0YCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyB3aXRoIHRoYXQgZnVuY3Rpb24uIElmIGBjYWxsYmFja2AgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgICAvLyBjYWxsYmFja3MgZm9yIHRoZSBldmVudC4gSWYgYG5hbWVgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kXG4gICAgLy8gY2FsbGJhY2tzIGZvciBhbGwgZXZlbnRzLlxuICAgIG9mZjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXRhaW4sIGV2LCBldmVudHMsIG5hbWVzLCBpLCBsLCBqLCBrO1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIWV2ZW50c0FwaSh0aGlzLCAnb2ZmJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkpIHJldHVybiB0aGlzO1xuICAgICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIG5hbWVzID0gbmFtZSA/IFtuYW1lXSA6IF8ua2V5cyh0aGlzLl9ldmVudHMpO1xuICAgICAgZm9yIChpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBuYW1lID0gbmFtZXNbaV07XG4gICAgICAgIGlmIChldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV0pIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHNbbmFtZV0gPSByZXRhaW4gPSBbXTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2sgfHwgY29udGV4dCkge1xuICAgICAgICAgICAgZm9yIChqID0gMCwgayA9IGV2ZW50cy5sZW5ndGg7IGogPCBrOyBqKyspIHtcbiAgICAgICAgICAgICAgZXYgPSBldmVudHNbal07XG4gICAgICAgICAgICAgIGlmICgoY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjay5fY2FsbGJhY2spIHx8XG4gICAgICAgICAgICAgICAgICAoY29udGV4dCAmJiBjb250ZXh0ICE9PSBldi5jb250ZXh0KSkge1xuICAgICAgICAgICAgICAgIHJldGFpbi5wdXNoKGV2KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXJldGFpbi5sZW5ndGgpIGRlbGV0ZSB0aGlzLl9ldmVudHNbbmFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFRyaWdnZXIgb25lIG9yIG1hbnkgZXZlbnRzLCBmaXJpbmcgYWxsIGJvdW5kIGNhbGxiYWNrcy4gQ2FsbGJhY2tzIGFyZVxuICAgIC8vIHBhc3NlZCB0aGUgc2FtZSBhcmd1bWVudHMgYXMgYHRyaWdnZXJgIGlzLCBhcGFydCBmcm9tIHRoZSBldmVudCBuYW1lXG4gICAgLy8gKHVubGVzcyB5b3UncmUgbGlzdGVuaW5nIG9uIGBcImFsbFwiYCwgd2hpY2ggd2lsbCBjYXVzZSB5b3VyIGNhbGxiYWNrIHRvXG4gICAgLy8gcmVjZWl2ZSB0aGUgdHJ1ZSBuYW1lIG9mIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQpLlxuICAgIHRyaWdnZXI6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ3RyaWdnZXInLCBuYW1lLCBhcmdzKSkgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdO1xuICAgICAgdmFyIGFsbEV2ZW50cyA9IHRoaXMuX2V2ZW50cy5hbGw7XG4gICAgICBpZiAoZXZlbnRzKSB0cmlnZ2VyRXZlbnRzKGV2ZW50cywgYXJncyk7XG4gICAgICBpZiAoYWxsRXZlbnRzKSB0cmlnZ2VyRXZlbnRzKGFsbEV2ZW50cywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBUZWxsIHRoaXMgb2JqZWN0IHRvIHN0b3AgbGlzdGVuaW5nIHRvIGVpdGhlciBzcGVjaWZpYyBldmVudHMgLi4uIG9yXG4gICAgLy8gdG8gZXZlcnkgb2JqZWN0IGl0J3MgY3VycmVudGx5IGxpc3RlbmluZyB0by5cbiAgICBzdG9wTGlzdGVuaW5nOiBmdW5jdGlvbihvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICAgICAgaWYgKCFsaXN0ZW5lcnMpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGRlbGV0ZUxpc3RlbmVyID0gIW5hbWUgJiYgIWNhbGxiYWNrO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JykgY2FsbGJhY2sgPSB0aGlzO1xuICAgICAgaWYgKG9iaikgKGxpc3RlbmVycyA9IHt9KVtvYmouX2xpc3RlbmVySWRdID0gb2JqO1xuICAgICAgZm9yICh2YXIgaWQgaW4gbGlzdGVuZXJzKSB7XG4gICAgICAgIGxpc3RlbmVyc1tpZF0ub2ZmKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcbiAgICAgICAgaWYgKGRlbGV0ZUxpc3RlbmVyKSBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2lkXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICB9O1xuXG4gIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIHNwbGl0IGV2ZW50IHN0cmluZ3MuXG4gIHZhciBldmVudFNwbGl0dGVyID0gL1xccysvO1xuXG4gIC8vIEltcGxlbWVudCBmYW5jeSBmZWF0dXJlcyBvZiB0aGUgRXZlbnRzIEFQSSBzdWNoIGFzIG11bHRpcGxlIGV2ZW50XG4gIC8vIG5hbWVzIGBcImNoYW5nZSBibHVyXCJgIGFuZCBqUXVlcnktc3R5bGUgZXZlbnQgbWFwcyBge2NoYW5nZTogYWN0aW9ufWBcbiAgLy8gaW4gdGVybXMgb2YgdGhlIGV4aXN0aW5nIEFQSS5cbiAgdmFyIGV2ZW50c0FwaSA9IGZ1bmN0aW9uKG9iaiwgYWN0aW9uLCBuYW1lLCByZXN0KSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIEhhbmRsZSBldmVudCBtYXBzLlxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW2tleSwgbmFtZVtrZXldXS5jb25jYXQocmVzdCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGFjZSBzZXBhcmF0ZWQgZXZlbnQgbmFtZXMuXG4gICAgaWYgKGV2ZW50U3BsaXR0ZXIudGVzdChuYW1lKSkge1xuICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChldmVudFNwbGl0dGVyKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW25hbWVzW2ldXS5jb25jYXQocmVzdCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIEEgZGlmZmljdWx0LXRvLWJlbGlldmUsIGJ1dCBvcHRpbWl6ZWQgaW50ZXJuYWwgZGlzcGF0Y2ggZnVuY3Rpb24gZm9yXG4gIC8vIHRyaWdnZXJpbmcgZXZlbnRzLiBUcmllcyB0byBrZWVwIHRoZSB1c3VhbCBjYXNlcyBzcGVlZHkgKG1vc3QgaW50ZXJuYWxcbiAgLy8gQmFja2JvbmUgZXZlbnRzIGhhdmUgMyBhcmd1bWVudHMpLlxuICB2YXIgdHJpZ2dlckV2ZW50cyA9IGZ1bmN0aW9uKGV2ZW50cywgYXJncykge1xuICAgIHZhciBldiwgaSA9IC0xLCBsID0gZXZlbnRzLmxlbmd0aCwgYTEgPSBhcmdzWzBdLCBhMiA9IGFyZ3NbMV0sIGEzID0gYXJnc1syXTtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4KTsgcmV0dXJuO1xuICAgICAgY2FzZSAxOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEpOyByZXR1cm47XG4gICAgICBjYXNlIDI6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIpOyByZXR1cm47XG4gICAgICBjYXNlIDM6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIsIGEzKTsgcmV0dXJuO1xuICAgICAgZGVmYXVsdDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suYXBwbHkoZXYuY3R4LCBhcmdzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGxpc3Rlbk1ldGhvZHMgPSB7bGlzdGVuVG86ICdvbicsIGxpc3RlblRvT25jZTogJ29uY2UnfTtcblxuICAvLyBJbnZlcnNpb24tb2YtY29udHJvbCB2ZXJzaW9ucyBvZiBgb25gIGFuZCBgb25jZWAuIFRlbGwgKnRoaXMqIG9iamVjdCB0b1xuICAvLyBsaXN0ZW4gdG8gYW4gZXZlbnQgaW4gYW5vdGhlciBvYmplY3QgLi4uIGtlZXBpbmcgdHJhY2sgb2Ygd2hhdCBpdCdzXG4gIC8vIGxpc3RlbmluZyB0by5cbiAgXy5lYWNoKGxpc3Rlbk1ldGhvZHMsIGZ1bmN0aW9uKGltcGxlbWVudGF0aW9uLCBtZXRob2QpIHtcbiAgICBFdmVudHNbbWV0aG9kXSA9IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMgfHwgKHRoaXMuX2xpc3RlbmVycyA9IHt9KTtcbiAgICAgIHZhciBpZCA9IG9iai5fbGlzdGVuZXJJZCB8fCAob2JqLl9saXN0ZW5lcklkID0gXy51bmlxdWVJZCgnbCcpKTtcbiAgICAgIGxpc3RlbmVyc1tpZF0gPSBvYmo7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSBjYWxsYmFjayA9IHRoaXM7XG4gICAgICBvYmpbaW1wbGVtZW50YXRpb25dKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFsaWFzZXMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBFdmVudHMuYmluZCAgID0gRXZlbnRzLm9uO1xuICBFdmVudHMudW5iaW5kID0gRXZlbnRzLm9mZjtcblxuICAvLyBNaXhpbiB1dGlsaXR5XG4gIEV2ZW50cy5taXhpbiA9IGZ1bmN0aW9uKHByb3RvKSB7XG4gICAgdmFyIGV4cG9ydHMgPSBbJ29uJywgJ29uY2UnLCAnb2ZmJywgJ3RyaWdnZXInLCAnc3RvcExpc3RlbmluZycsICdsaXN0ZW5UbycsXG4gICAgICAgICAgICAgICAgICAgJ2xpc3RlblRvT25jZScsICdiaW5kJywgJ3VuYmluZCddO1xuICAgIF8uZWFjaChleHBvcnRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBwcm90b1tuYW1lXSA9IHRoaXNbbmFtZV07XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHByb3RvO1xuICB9O1xuXG4gIC8vIEV4cG9ydCBFdmVudHMgYXMgQmFja2JvbmVFdmVudHMgZGVwZW5kaW5nIG9uIGN1cnJlbnQgY29udGV4dFxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBFdmVudHM7XG4gICAgfVxuICAgIGV4cG9ydHMuQmFja2JvbmVFdmVudHMgPSBFdmVudHM7XG4gIH1lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRXZlbnRzO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuQmFja2JvbmVFdmVudHMgPSBFdmVudHM7XG4gIH1cbn0pKHRoaXMpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbihmdW5jdGlvbihmYWN0b3J5KSB7XHJcbiAgICAvLyBTdGFydCB3aXRoIEFNRC5cclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoWydoYW1tZXInXSwgZnVuY3Rpb24oSGFtbWVyKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5IYW1tZXIgPSBIYW1tZXI7XHJcbiAgICAgICAgICAgIHdpbmRvdy5NaW5kID0gZmFjdG9yeSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gd2luZG93Lk1pbmQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xyXG4gICAgICAgIHdpbmRvdy5NaW5kID0gbW9kdWxlLmV4cG9ydHM7XHJcbiAgICAgICAgLy8gRmluYWxseSwgYXMgYSBicm93c2VyIGdsb2JhbC5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd2luZG93Lk1pbmQgPSBmYWN0b3J5KCk7XHJcbiAgICAgICAgaWYgKCF3aW5kb3cuSGFtbWVyKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiSGFtbWVySlMgaXMgbm90IGRldGVjdGVkLiBtaW5kLmpzIG5vdCB3b3JraW5nIHdpdGhvdXQgaXQhXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KGZ1bmN0aW9uIGZhY3RvcnkoKSB7XHJcbiAgICB2YXIgU3RhZ2UgPSByZXF1aXJlKCcuL3N0YWdlJyk7XHJcbiAgICB2YXIgTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpO1xyXG4gICAgdmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4vY29ubmVjdG9yJyk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBTdGFnZTogU3RhZ2UsXHJcbiAgICAgICAgTm9kZTogTm9kZSxcclxuICAgICAgICBDb25uZWN0b3IgOiBDb25uZWN0b3JcclxuICAgIH07XHJcblxyXG59KSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgRXZlbnQgPSByZXF1aXJlKCcuL2V2ZW50Jyk7XG5cbmZ1bmN0aW9uIE5vZGUocGFyYW1zKSB7XG4gICAgdGhpcy54ID0gcGFyYW1zLnggfHwgMDtcbiAgICB0aGlzLnkgPSBwYXJhbXMueSB8fCAwO1xuICAgIHRoaXMudGVtcGxhdGUgPSBwYXJhbXMudGVtcGxhdGUgfHwgJ25vZGUnO1xuICAgIHRoaXMuX2J1aWxkTm9kZSgpO1xufTtcblxudmFyIHAgPSBOb2RlLnByb3RvdHlwZTtcbkV2ZW50Lm1peGluKHApO1xuXG5wLnNldFBvc2l0aW9uID0gZnVuY3Rpb24ocG9zKSB7XG4gICAgdGhpcy54ID0gcG9zLng7XG4gICAgdGhpcy55ID0gcG9zLnk7XG4gICAgdGhpcy5fcG9zaXRpb25pbmcoKTtcbiAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZTpwb3NpdGlvbicsIHRoaXMpO1xufTtcblxucC5fYnVpbGROb2RlID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5lbC5pbm5lckhUTUwgPSB0aGlzLnRlbXBsYXRlO1xuXG4gICAgdGhpcy5lbC5jbGFzc05hbWUgPSAnbm9kZSc7XG4gICAgdGhpcy5lbC5fbm9kZSA9IHRoaXM7XG4gICAgdGhpcy5fdXBkYXRlQXR0cnMoKTtcbiAgICB0aGlzLl9wb3NpdGlvbmluZygpO1xufTtcblxucC5fcG9zaXRpb25pbmcgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB0aGlzLmVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwYXJzZUludCh0aGlzLnggLSB0aGlzLl93aWR0aCAvIDIpICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyBwYXJzZUludCh0aGlzLnkgLSB0aGlzLl9oZWlnaHQgLyAyKSArICdweCkgdHJhbnNsYXRlWigxcHgpJztcbiAgICB0aGlzLmVsLnN0eWxlWyctd2Via2l0LXRyYW5zZm9ybSddID0gJ3RyYW5zbGF0ZVgoJyArIHBhcnNlSW50KHRoaXMueCAtIHRoaXMuX3dpZHRoIC8gMikgKyAncHgpIHRyYW5zbGF0ZVkoJyArIHBhcnNlSW50KHRoaXMueSAtIHRoaXMuX2hlaWdodCAvIDIpICsgJ3B4KSB0cmFuc2xhdGVaKDFweCknO1xufTtcblxucC5fdXBkYXRlQXR0cnMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl93aWR0aCA9IHRoaXMuZWwub2Zmc2V0V2lkdGg7XG4gICAgdGhpcy5faGVpZ2h0ID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTm9kZTtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBDYW1lcmEgPSByZXF1aXJlKCcuL2NhbWVyYScpO1xyXG5cclxuZnVuY3Rpb24gU3RhZ2UocGFyYW1zKSB7XHJcbiAgICBpZiAoIXBhcmFtcykge1xyXG4gICAgICAgIHV0aWxzLnRocm93KCdwYXJhbXMgZm9yIFN0YWdlIGNvbnN0cnVjdG9yIHJlcXVpcmVkLicpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFwYXJhbXMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgdXRpbHMudGhyb3coJ2NvbnRhaW5lciBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQuJyk7XHJcbiAgICB9XHJcbiAgICB0aGlzLm5vZGVzID0gW107XHJcbiAgICB0aGlzLmNvbm5lY3RvcnMgPSBbXTtcclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSgpO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBwYXJhbXMuaGVpZ2h0IHx8IDMwMDtcclxuICAgIHRoaXMud2lkdGggPSBwYXJhbXMud2lkdGggfHwgMzAwO1xyXG4gICAgdGhpcy5fc2V0dXBFbGVtZW50cyhwYXJhbXMuY29udGFpbmVyKTtcclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3NldHVwRHJhZ0NhbWVyYSgpO1xyXG4gICAgdGhpcy5fc2V0dXBOb2RlRHJhZygpO1xyXG4gICAgdGhpcy5fc2V0dXBLZXlib2FyZCgpO1xyXG59XHJcblxyXG52YXIgcCA9IFN0YWdlLnByb3RvdHlwZTtcclxuXHJcbnAuYWRkTm9kZSA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHRoaXMubm9kZXMucHVzaChvKTtcclxuICAgIGlmICh0aGlzLl9pc05vZGVWaXNpYmxlKG8pKSB7XHJcbiAgICAgICAgdGhpcy5fbm9kZUNvbnRhaW5lci5hcHBlbmRDaGlsZChvLmVsKTtcclxuICAgICAgICBvLl91cGRhdGVBdHRycygpO1xyXG4gICAgICAgIG8uX3Bvc2l0aW9uaW5nKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5wLmFkZENvbm5lY3RvciA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHRoaXMuY29ubmVjdG9ycy5wdXNoKG8pO1xyXG4gICAgaWYgKHRydWUpIHtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JDb250YWluZXIuYXBwZW5kQ2hpbGQoby5lbCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5wLnNldFNpemUgPSBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgIHRoaXMud2lkdGggPSBwYXJhbXMud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHBhcmFtcy5oZWlnaHQ7XHJcbiAgICB0aGlzLl91cGRhdGVTaXplKCk7ICAgXHJcbn07XHJcblxyXG5wLmNoZWNrVmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5fcmVxdWVzdENoZWNrVmlzaWFiaWxpdHkoKTtcclxufVxyXG5cclxucC5fdXBkYXRlU2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aCArICdweCc7XHJcbiAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyAncHgnO1xyXG4gICAgdGhpcy5fYmFjay5zdHlsZS53aWR0aCA9IHRoaXMud2lkdGggKyAncHgnO1xyXG4gICAgdGhpcy5fYmFjay5zdHlsZS5oZWlnaHQgPSB0aGlzLmhlaWdodCArICdweCc7XHJcbn1cclxuXHJcblN0YWdlLnByb3RvdHlwZS5fc2V0dXBFbGVtZW50cyA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xyXG4gICAgdGhpcy5fY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyKTtcclxuICAgIGlmICghdGhpcy5fY29udGFpbmVyKSB7XHJcbiAgICAgICAgdXRpbHMudGhyb3coJ2NhbiBub3QgZmluZCBjb250YWluZXIgd2l0aCBpZCAnICsgY29udGFpbmVyKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XHJcblxyXG4gICAgLy8gZmlyc3QgYmFja2dyb3VuZFxyXG4gICAgdGhpcy5faW5pdEJhY2tncm91bmQoKTtcclxuICAgIC8vIHRoZW4gY29ubmVjdG9yc1xyXG4gICAgdGhpcy5faW5pdENvbm5lY3RvcnNDb250YWluZXIoKTtcclxuICAgIC8vIGFuZCBub2RlcyBvbiB0b3BcclxuICAgIHRoaXMuX2luaXROb2RlQ29udGFpbmVyKCk7XHJcbn07XHJcblN0YWdlLnByb3RvdHlwZS5fc2V0dXBOb2RlRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1jID0gbmV3IEhhbW1lci5NYW5hZ2VyKHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG4gICAgbWMuYWRkKG5ldyBIYW1tZXIuUGFuKHsgdGhyZXNob2xkOiAwLCBwb2ludGVyczogMCB9KSk7XHJcblxyXG4gICAgdmFyIGRyYWdFbGVtZW50LCBvZmZzZXQ7XHJcbiAgICBtYy5vbihcInBhbnN0YXJ0XCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBpZiAoZS50YXJnZXQuX25vZGUpIHtcclxuICAgICAgICAgICAgdmFyIGxvY2FsUG9zID0gdGhpcy5fZzJsKGUudGFyZ2V0Ll9ub2RlKTtcclxuICAgICAgICAgICAgb2Zmc2V0ID0ge1xyXG4gICAgICAgICAgICAgICAgeCA6IGxvY2FsUG9zLnggLSBlLmNoYW5nZWRQb2ludGVyc1swXS5jbGllbnRYLFxyXG4gICAgICAgICAgICAgICAgeSA6IGxvY2FsUG9zLnkgLSBlLmNoYW5nZWRQb2ludGVyc1swXS5jbGllbnRZXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYWdFbGVtZW50ID0gZS50YXJnZXQ7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgbWMub24oXCJwYW5tb3ZlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBkcmFnRWxlbWVudC5fbm9kZTtcclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcG9pbnRlciA9IGUuY2hhbmdlZFBvaW50ZXJzWzBdO1xyXG4gICAgICAgIHZhciBsb2NhbFBvcyA9IHtcclxuICAgICAgICAgICAgeCA6ICBwb2ludGVyLmNsaWVudFggKyBvZmZzZXQueCxcclxuICAgICAgICAgICAgeSA6IHBvaW50ZXIuY2xpZW50WSArIG9mZnNldC55XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZ2xvYmFsUG9zID0gdGhpcy5fbDJnKGxvY2FsUG9zKTtcclxuICAgICAgICBub2RlLnNldFBvc2l0aW9uKGdsb2JhbFBvcyk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9sMmcgPSBmdW5jdGlvbihsUCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiAobFAueCArIHRoaXMuY2FtZXJhLnggKiB0aGlzLmNhbWVyYS5zY2FsZSAtIHRoaXMud2lkdGggLyAyKSAvIHRoaXMuY2FtZXJhLnNjYWxlLFxyXG4gICAgICAgIHk6IChsUC55ICsgdGhpcy5jYW1lcmEueSAqIHRoaXMuY2FtZXJhLnNjYWxlIC0gdGhpcy5oZWlnaHQgLyAyKSAvIHRoaXMuY2FtZXJhLnNjYWxlXHJcbiAgICB9O1xyXG59O1xyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9nMmwgPSBmdW5jdGlvbihnUCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBnUC54ICogdGhpcy5jYW1lcmEuc2NhbGUgLSB0aGlzLmNhbWVyYS54ICogdGhpcy5jYW1lcmEuc2NhbGUgKyB0aGlzLndpZHRoIC8gMixcclxuICAgICAgICB5OiBnUC55ICogdGhpcy5jYW1lcmEuc2NhbGUgLSB0aGlzLmNhbWVyYS55ICogdGhpcy5jYW1lcmEuc2NhbGUgKyB0aGlzLmhlaWdodCAvIDJcclxuICAgIH07XHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX2lzTm9kZVZpc2libGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgY2FtZXJhWCA9IHRoaXMuY2FtZXJhLng7XHJcbiAgICB2YXIgY2FtZXJhWSA9IHRoaXMuY2FtZXJhLnk7XHJcbiAgICByZXR1cm4gISEoXHJcbiAgICAgICAgbm9kZS54ID4gY2FtZXJhWCAtIHRoaXMud2lkdGggJiZcclxuICAgICAgICBub2RlLnggPCBjYW1lcmFYICsgdGhpcy53aWR0aCAmJlxyXG4gICAgICAgIG5vZGUueSA+IGNhbWVyYVkgLSB0aGlzLmhlaWdodCAmJlxyXG4gICAgICAgIG5vZGUueSA8IGNhbWVyYVkgKyB0aGlzLmhlaWdodFxyXG4gICAgKTtcclxuXHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX3Bvc2l0aW9uQmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5fYmFjay5zdHlsZVsnYmFja2dyb3VuZC1wb3NpdGlvbiddID0gLXRoaXMuY2FtZXJhLnggKyAncHggJyArIC10aGlzLmNhbWVyYS55ICsgJ3B4JztcclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5faW5pdEJhY2tncm91bmQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuX2JhY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9iYWNrKTtcclxuICAgIHRoaXMuX2JhY2suc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xyXG4gICAgdGhpcy5fYmFjay5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWigtMSknO1xyXG4gICAgdGhpcy5fYmFjay5zdHlsZVsnLXdlYmtpdC10cmFuc2Zvcm0nXSA9ICd0cmFuc2xhdGVaKC0xKSc7XHJcbiAgICB0aGlzLl9wb3NpdGlvbkJhY2soKTtcclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5fcG9zaXRpb25Ob2RlQ29udGFpbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9ub2RlQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwYXJzZUludCgtdGhpcy5jYW1lcmEueCArIHRoaXMud2lkdGggLyAyICkrICdweCkgdHJhbnNsYXRlWSgnICsgcGFyc2VJbnQoLXRoaXMuY2FtZXJhLnkgKyB0aGlzLmhlaWdodCAvIDIpICsgJ3B4KSc7XHJcbiAgICB0aGlzLl9ub2RlQ29udGFpbmVyLnN0eWxlWyctd2Via2l0LXRyYW5zZm9ybSddID0gJ3RyYW5zbGF0ZVgoJyArIHBhcnNlSW50KC10aGlzLmNhbWVyYS54ICsgdGhpcy53aWR0aCAvIDIpICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyBwYXJzZUludCgtdGhpcy5jYW1lcmEueSArIHRoaXMuaGVpZ2h0IC8gMikgKyAncHgpJztcclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5fcG9zaXRpb25Db25uZWN0b3JDb250YWluZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuX2Nvbm5lY3RvckNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgcGFyc2VJbnQoLXRoaXMuY2FtZXJhLnggKyB0aGlzLndpZHRoIC8gMiApKyAncHgpIHRyYW5zbGF0ZVkoJyArIHBhcnNlSW50KC10aGlzLmNhbWVyYS55ICsgdGhpcy5oZWlnaHQgLyAyKSArICdweCknO1xyXG4gICAgdGhpcy5fY29ubmVjdG9yQ29udGFpbmVyLnN0eWxlWyctd2Via2l0LXRyYW5zZm9ybSddID0gJ3RyYW5zbGF0ZVgoJyArIHBhcnNlSW50KC10aGlzLmNhbWVyYS54ICsgdGhpcy53aWR0aCAvIDIpICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyBwYXJzZUludCgtdGhpcy5jYW1lcmEueSArIHRoaXMuaGVpZ2h0IC8gMikgKyAncHgpJztcclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5faW5pdE5vZGVDb250YWluZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuX25vZGVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9ub2RlQ29udGFpbmVyKTtcclxuICAgIHRoaXMuX25vZGVDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVooLTEpJztcclxuICAgIHRoaXMuX25vZGVDb250YWluZXIuc3R5bGVbJy13ZWJraXQtdHJhbnNmb3JtJ10gPSAndHJhbnNsYXRlWigtMSknO1xyXG4gICAgdGhpcy5fcG9zaXRpb25Ob2RlQ29udGFpbmVyKCk7XHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX2luaXRDb25uZWN0b3JzQ29udGFpbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9jb25uZWN0b3JDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jb25uZWN0b3JDb250YWluZXIpO1xyXG4gICAgdGhpcy5fY29ubmVjdG9yQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVaKC0xKSc7XHJcbiAgICB0aGlzLl9jb25uZWN0b3JDb250YWluZXIuc3R5bGVbJy13ZWJraXQtdHJhbnNmb3JtJ10gPSAndHJhbnNsYXRlWigtMSknO1xyXG4gICAgdGhpcy5fcG9zaXRpb25Db25uZWN0b3JDb250YWluZXIoKTtcclxufTtcclxuXHJcblN0YWdlLnByb3RvdHlwZS5fc2V0dXBEcmFnQ2FtZXJhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9zZXR1cERyYWdTdGFnZU9uRWwodGhpcy5fYmFjayk7XHJcbiAgICB0aGlzLl9zZXR1cERyYWdTdGFnZU9uRWwodGhpcy5fY29ubmVjdG9yQ29udGFpbmVyKTtcclxufTtcclxuU3RhZ2UucHJvdG90eXBlLl9zZXR1cERyYWdTdGFnZU9uRWwgPSBmdW5jdGlvbihlbCkge1xyXG4gICAgdmFyIG1jID0gbmV3IEhhbW1lci5NYW5hZ2VyKGVsKTtcclxuXHJcbiAgICBtYy5hZGQobmV3IEhhbW1lci5QYW4oeyB0aHJlc2hvbGQ6IDAsIHBvaW50ZXJzOiAwIH0pKTtcclxuICAgIHZhciBwcmV2aW91cyA9IHt9O1xyXG4gICAgbWMub24oXCJwYW5zdGFydFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgcHJldmlvdXMgPSB7XHJcbiAgICAgICAgICAgIHggOiBlLnBvaW50ZXJzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIHkgOiBlLnBvaW50ZXJzWzBdLmNsaWVudFlcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiAgICBtYy5vbihcInBhbm1vdmVcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSB7XHJcbiAgICAgICAgICAgIHggOiBlLnBvaW50ZXJzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIHkgOiBlLnBvaW50ZXJzWzBdLmNsaWVudFlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBkeCA9IHByZXZpb3VzLnggLSBuZXdQb3MueDtcclxuICAgICAgICB2YXIgZHkgPSBwcmV2aW91cy55IC0gbmV3UG9zLnk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEubW92ZShkeCwgZHkpO1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uQmFjaygpO1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uTm9kZUNvbnRhaW5lcigpO1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uQ29ubmVjdG9yQ29udGFpbmVyKCk7XHJcbiAgICAgICAgdGhpcy5fcmVxdWVzdENoZWNrVmlzaWFiaWxpdHkoKTtcclxuICAgICAgICBwcmV2aW91cyA9IG5ld1BvcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5cclxuU3RhZ2UucHJvdG90eXBlLl9yZXF1ZXN0Q2hlY2tWaXNpYWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuX2NoZWNrVmlzaWJpbGl0eVdhaXRpbmcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLl9jaGVja1Zpc2liaWxpdHlXYWl0aW5nID0gdHJ1ZTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICAgICAgdmFyIHZpc2libGUgPSB0aGlzLl9pc05vZGVWaXNpYmxlKG5vZGUpO1xyXG4gICAgICAgICAgICBpZiAodmlzaWJsZSAmJiAhbm9kZS5lbC5wYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub2RlQ29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUuZWwpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF2aXNpYmxlICYmIG5vZGUuZWwucGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5lbC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG5vZGUuZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLl9jaGVja1Zpc2liaWxpdHlXYWl0aW5nID0gZmFsc2U7XHJcbiAgICB9LmJpbmQodGhpcyksIDEwMCk7XHJcbn07XHJcblxyXG5TdGFnZS5wcm90b3R5cGUuX3NldHVwS2V5Ym9hcmQgPSBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5vbmtleWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzcpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueCAtPSAzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzOCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS55IC09IDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDM5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnggKz0gMztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gNDApIHtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueSArPSAzO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RhZ2U7IiwibW9kdWxlLmV4cG9ydHMudGhyb3cgPSBmdW5jdGlvbihtZXNzYWdlKSB7XHJcbiAgICB0aHJvdyAnTWluZEpTIEVycm9yOiAnICsgbWVzc2FnZTtcclxufSJdfQ==
