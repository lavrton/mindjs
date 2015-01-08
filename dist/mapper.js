var Mapper;
(function (Mapper) {
    var Eventer = (function () {
        function Eventer() {
        }
        Eventer.prototype.on = function (eventName, callback, context) {
        };
        Eventer.prototype.off = function (eventName, callback, context) {
        };
        Eventer.prototype.trigger = function (eventName) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
        };
        Eventer.prototype.bind = function (eventName, callback, context) {
        };
        Eventer.prototype.unbind = function (eventName, callback, context) {
        };

        Eventer.prototype.once = function (events, callback, context) {
        };
        Eventer.prototype.listenTo = function (object, events, callback) {
        };
        Eventer.prototype.listenToOnce = function (object, events, callback) {
        };
        Eventer.prototype.stopListening = function (object, events, callback) {
        };
        return Eventer;
    })();
    Mapper.Eventer = Eventer;
})(Mapper || (Mapper = {}));
_.extend(Mapper.Eventer.prototype, Backbone.Events);

/// <reference path='../typings/underscore/underscore.d.ts'/>
/// <reference path='../typings/backbone/backbone.d.ts'/>
/// <reference path='../typings/hammer/hammerjs.d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Mapper;
(function (Mapper) {
    var Atom = (function (_super) {
        __extends(Atom, _super);
        function Atom(params) {
            _super.call(this);
            this.width = 50;
            this.height = 25;
            _.extend(this, params);
            this._buildNode();
        }
        Atom.prototype._buildNode = function () {
            this.node = document.createElement('div');
            this.node.innerHTML = 'atom';
            this.node.style['background-color'] = '#3fa9f5';
            this.node.style['padding'] = '10px';
            this.node.style['border-radius'] = '100px';
            this.node._atom = this;
            this._positioning();
        };

        Atom.prototype._positioning = function () {
            this.node.style.position = 'absolute';
            this.node.style.transform = 'translateX(' + this.x + 'px) translateY(' + this.y + 'px) translateZ(1px)';
            this.node.style['-webkit-transform'] = 'translateX(' + this.x + 'px) translateY(' + this.y + 'px) translateZ(1px)';
        };
        Object.defineProperty(Atom.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Atom.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: true,
            configurable: true
        });
        return Atom;
    })(Mapper.Eventer);
    Mapper.Atom = Atom;
})(Mapper || (Mapper = {}));

/// <reference path='./eventer.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mapper;
(function (Mapper) {
    var Camera = (function (_super) {
        __extends(Camera, _super);
        function Camera() {
            _super.call(this);
            this._minScale = 0.01;
            this._maxScale = 2;
            this._x = 0;
            this._y = 0;
            this._scale = 1;
        }
        Camera.prototype._triggerChange = function (property) {
            this.trigger('change:' + property);
            this.trigger('change');
        };

        Object.defineProperty(Camera.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
                this._triggerChange('x');
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Camera.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
                this._triggerChange('y');
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Camera.prototype, "scale", {
            get: function () {
                return this._scale;
            },
            set: function (value) {
                this._scale = this._getValidScale(value);
                this._triggerChange('scale');
            },
            enumerable: true,
            configurable: true
        });

        Camera.prototype.move = function (dx, dy) {
            this.x += dx;
            this.y += dy;
        };

        Camera.prototype.zoomIt = function (dScale) {
            dScale = (dScale || 0) / 10;
            var newScale = this.scale * (1 + dScale);
            this.scale = newScale;
        };

        // check if new scale value is valid
        // if no scale value passed - getting current one
        Camera.prototype._getValidScale = function (scale) {
            if (typeof scale === "undefined") { scale = this.scale; }
            if (scale < this._minScale) {
                return this._minScale;
            } else if (scale > this._maxScale) {
                return this._maxScale;
            }
            return scale;
        };

        Camera.prototype.setScaleLimit = function (params) {
            this._minScale = params.min;
            this._maxScale = params.max;
            this.scale = this._getValidScale();
        };

        Camera.prototype.getScaleLimit = function () {
            return {
                min: this._minScale,
                max: this._maxScale
            };
        };
        return Camera;
    })(Mapper.Eventer);
    Mapper.Camera = Camera;
})(Mapper || (Mapper = {}));

var Mapper;
(function (Mapper) {
    var Connector = (function () {
        function Connector() {
        }
        return Connector;
    })();
    Mapper.Connector = Connector;
})(Mapper || (Mapper = {}));

/// <reference path='../typings/underscore/underscore.d.ts'/>
/// <reference path='../typings/backbone/backbone.d.ts'/>
/// <reference path='../typings/hammer/hammerjs.d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path='./camera.ts'/>
/// <reference path='./atom.ts'/>
/// <reference path='./connector.ts'/>

var Mapper;
(function (Mapper) {
    var Workspace = (function (_super) {
        __extends(Workspace, _super);
        function Workspace(params) {
            _super.call(this);
            this.camera = new Mapper.Camera();
            this.atoms = [];
            //public connectors: Connector[] = [];
            this.width = 0;
            this.height = 0;
            //private _drawWaiting = false;
            this._checkVisibilityWaiting = false;
            this._container = document.getElementById(params.container);

            this._container.style.width = params.width + 'px';
            this._container.style.height = params.height + 'px';

            this.width = params.width;
            this.height = params.height;

            this._initBackground();
            this._initAtomContainer();
            this._setupDragCamera();
            this._setupAtomDrag();
            this._setupCameraMoving();
            this._setupKeyboard();
        }
        Workspace.prototype._setupAtomDrag = function () {
            var _this = this;
            var mc = new Hammer.Manager(this._container);

            mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

            var dragElement;
            mc.on("panstart", function (e) {
                dragElement = e.target;
            });
            mc.on("panmove", function (e) {
                var atom = dragElement._atom;
                if (!atom) {
                    return;
                }
                atom.x = e.changedPointers[0].clientX + _this.camera.x;
                atom.y = e.changedPointers[0].clientY + _this.camera.y;
                atom._positioning();
            });
        };
        Workspace.prototype.addAtom = function (o) {
            this.atoms.push(o);
            if (this._isAtomVisible(o)) {
                this._atomContainer.appendChild(o.node);
            }
        };

        Workspace.prototype._isAtomVisible = function (atom) {
            var cameraX = this.camera.x;
            var cameraY = this.camera.y;
            var screenWidth = this.width;
            var screenHeight = this.height;
            if (atom.x > cameraX - screenWidth && atom.x < cameraX + screenWidth * 2 && atom.y > cameraY - screenHeight && atom.y < cameraY + screenHeight * 2) {
                return true;
            } else {
                return false;
            }
        };

        Object.defineProperty(Workspace.prototype, "background", {
            set: function (background) {
                if (background.indexOf('/') !== -1) {
                    this._back.style['background-image'] = 'url("' + background + '")';
                    this._back.style['background-color'] = '';
                } else {
                    this._back.style['background-image'] = '';
                    this._back.style['background-color'] = background;
                }
            },
            enumerable: true,
            configurable: true
        });

        //hide() {
        //    this._container.style.display = 'none';
        //}
        //
        //show() {
        //    this._container.style.display = '';
        //}
        Workspace.prototype.setSize = function (param) {
            //this._stage.setWidth(param.width);
            //this._stage.setHeight(param.height);
            //this._back.width(param.width);
            //this._back.height(param.height);
            //this.camera.trigger('change');
            //this.camera.trigger('change:scale');
            //this._backLayer.draw();
        };

        Workspace.prototype._positionBack = function () {
            this._back.style['background-position'] = -this.camera.x + 'px ' + -this.camera.y + 'px';
        };

        Workspace.prototype._initBackground = function () {
            this._back = document.createElement('div');
            this._container.appendChild(this._back);
            this._back.style.position = 'absolute';
            this._back.style.transform = 'translateZ(-1)';
            this._back.style['-webkit-transform'] = 'translateZ(-1)';
            this._back.style.width = '100%';
            this._back.style.height = '100%';
            this._positionBack();
        };

        Workspace.prototype._positionAtomContainer = function () {
            this._atomContainer.style.transform = 'translateX(' + -this.camera.x + 'px) translateY(' + -this.camera.y + 'px)';
            this._atomContainer.style['-webkit-transform'] = 'translateX(' + -this.camera.x + 'px) translateY(' + -this.camera.y + 'px)';
        };

        Workspace.prototype._initAtomContainer = function () {
            this._atomContainer = document.createElement('div');
            this._container.appendChild(this._atomContainer);
            this._atomContainer.style.position = 'absolute';
            this._atomContainer.style.transform = 'translateZ(-1)';
            this._atomContainer.style['-webkit-transform'] = 'translateZ(-1)';
            this._positionAtomContainer();
        };

        Workspace.prototype._setupDragCamera = function () {
            var _this = this;
            var mc = new Hammer.Manager(this._back);

            mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

            var previous = {};
            mc.on("panstart", function (e) {
                previous = e.center;
            });
            mc.on("panmove", function (e) {
                var newPos = {
                    x: e.center.x + e.deltaX,
                    y: e.center.y + e.deltaY
                };
                var dx = previous.x - newPos.x;
                var dy = previous.y - newPos.y;
                _this.camera.move(dx, dy);
                _this._positionBack();
                _this._positionAtomContainer();
                _this._requestCheckVisiability();
                previous = newPos;
            });
        };

        Workspace.prototype._requestCheckVisiability = function () {
            var _this = this;
            if (this._checkVisibilityWaiting) {
                return;
            }
            this._checkVisibilityWaiting = true;
            setTimeout(function () {
                _this.atoms.forEach(function (atom) {
                    var visible = _this._isAtomVisible(atom);
                    if (visible && !atom.node.parentElement) {
                        _this._atomContainer.appendChild(atom.node);
                    } else if (!visible && atom.node.parentElement) {
                        atom.node.parentElement.removeChild(atom.node);
                    }
                });
                _this._checkVisibilityWaiting = false;
            }, 100);
        };

        Workspace.prototype._setupCameraMoving = function () {
        };

        Workspace.prototype._setupKeyboard = function () {
            var _this = this;
            window.onkeydown = function (e) {
                if (e.keyCode === 37) {
                    _this.camera.x -= 3;
                }
                if (e.keyCode === 38) {
                    _this.camera.y -= 3;
                }
                if (e.keyCode === 39) {
                    _this.camera.x += 3;
                }
                if (e.keyCode === 40) {
                    _this.camera.y += 3;
                }
            };
        };
        return Workspace;
    })(Mapper.Eventer);
    Mapper.Workspace = Workspace;
})(Mapper || (Mapper = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9tYXBwZXItSFRNTC9ldmVudGVyLnRzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21hcHBlci1IVE1ML2F0b20udHMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvbWFwcGVyLUhUTUwvY2FtZXJhLnRzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL21hcHBlci1IVE1ML2Nvbm5lY3Rvci50cyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9tYXBwZXItSFRNTC93b3Jrc3BhY2UudHMiXSwibmFtZXMiOlsiTWFwcGVyIiwiTWFwcGVyLkV2ZW50ZXIiLCJNYXBwZXIuRXZlbnRlci5jb25zdHJ1Y3RvciIsIk1hcHBlci5FdmVudGVyLm9uIiwiTWFwcGVyLkV2ZW50ZXIub2ZmIiwiTWFwcGVyLkV2ZW50ZXIudHJpZ2dlciIsIk1hcHBlci5FdmVudGVyLmJpbmQiLCJNYXBwZXIuRXZlbnRlci51bmJpbmQiLCJNYXBwZXIuRXZlbnRlci5vbmNlIiwiTWFwcGVyLkV2ZW50ZXIubGlzdGVuVG8iLCJNYXBwZXIuRXZlbnRlci5saXN0ZW5Ub09uY2UiLCJNYXBwZXIuRXZlbnRlci5zdG9wTGlzdGVuaW5nIiwiTWFwcGVyLkF0b20iLCJNYXBwZXIuQXRvbS5jb25zdHJ1Y3RvciIsIk1hcHBlci5BdG9tLl9idWlsZE5vZGUiLCJNYXBwZXIuQXRvbS5fcG9zaXRpb25pbmciLCJNYXBwZXIuQ2FtZXJhIiwiTWFwcGVyLkNhbWVyYS5jb25zdHJ1Y3RvciIsIk1hcHBlci5DYW1lcmEuX3RyaWdnZXJDaGFuZ2UiLCJNYXBwZXIuQ2FtZXJhLm1vdmUiLCJNYXBwZXIuQ2FtZXJhLnpvb21JdCIsIk1hcHBlci5DYW1lcmEuX2dldFZhbGlkU2NhbGUiLCJNYXBwZXIuQ2FtZXJhLnNldFNjYWxlTGltaXQiLCJNYXBwZXIuQ2FtZXJhLmdldFNjYWxlTGltaXQiLCJNYXBwZXIuQ29ubmVjdG9yIiwiTWFwcGVyLkNvbm5lY3Rvci5jb25zdHJ1Y3RvciIsIk1hcHBlci5Xb3Jrc3BhY2UiLCJNYXBwZXIuV29ya3NwYWNlLmNvbnN0cnVjdG9yIiwiTWFwcGVyLldvcmtzcGFjZS5fc2V0dXBBdG9tRHJhZyIsIk1hcHBlci5Xb3Jrc3BhY2UuYWRkQXRvbSIsIk1hcHBlci5Xb3Jrc3BhY2UuX2lzQXRvbVZpc2libGUiLCJNYXBwZXIuV29ya3NwYWNlLnNldFNpemUiLCJNYXBwZXIuV29ya3NwYWNlLl9wb3NpdGlvbkJhY2siLCJNYXBwZXIuV29ya3NwYWNlLl9pbml0QmFja2dyb3VuZCIsIk1hcHBlci5Xb3Jrc3BhY2UuX3Bvc2l0aW9uQXRvbUNvbnRhaW5lciIsIk1hcHBlci5Xb3Jrc3BhY2UuX2luaXRBdG9tQ29udGFpbmVyIiwiTWFwcGVyLldvcmtzcGFjZS5fc2V0dXBEcmFnQ2FtZXJhIiwiTWFwcGVyLldvcmtzcGFjZS5fcmVxdWVzdENoZWNrVmlzaWFiaWxpdHkiLCJNYXBwZXIuV29ya3NwYWNlLl9zZXR1cENhbWVyYU1vdmluZyIsIk1hcHBlci5Xb3Jrc3BhY2UuX3NldHVwS2V5Ym9hcmQiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sTUFBTTtBQWNaLENBZEQsVUFBTyxNQUFNO0lBQ1RBO1FBQ0lDO1FBQWVDLENBQUNBO1FBQ2hCRCx1QkFBQUEsVUFBR0EsU0FBaUJBLEVBQUVBLFFBQW1CQSxFQUFFQSxPQUFhQTtRQUFRRSxDQUFDQTtRQUNqRUYsd0JBQUFBLFVBQUlBLFNBQWtCQSxFQUFFQSxRQUFtQkEsRUFBRUEsT0FBYUE7UUFBUUcsQ0FBQ0E7UUFDbkVILDRCQUFBQSxVQUFRQSxTQUFpQkE7WUFBRUksSUFBR0EsSUFBSUE7QUFBT0EsaUJBQWRBLFdBQWNBLENBQWRBLDJCQUFjQSxFQUFkQSxJQUFjQTtnQkFBZEEsNkJBQWNBOztRQUFRQSxDQUFDQTtRQUNsREoseUJBQUFBLFVBQUtBLFNBQWlCQSxFQUFFQSxRQUFrQkEsRUFBRUEsT0FBYUE7UUFB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RUFBRUEsQ0FBRUE7b0JBQ2xCQSxLQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtpQkFDckJBO2dCQUNEQSxJQUFJQSxDQUFDQSxDQUFDQSxPQUFPQSxLQUFLQSxFQUFFQSxDQUFFQTtvQkFDbEJBLEtBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBO2lCQUNyQkE7Z0JBQ0RBLElBQUlBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLEVBQUVBLENBQUVBO29CQUNsQkEsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7aUJBQ3JCQTtZQUNMQSxDQUFDQTtRQUNMQSxDQUFDQTtRQUNMYixpQkFBQ0E7SUFBREEsQ0FBQ0EsRUEvTDhCMUIsTUFBTUEsQ0FBQ0EsT0FBT0EsRUErTDVDQTtJQS9MREEsNkJBK0xDQTtBQUNMQSxDQUFDQSwyQkFBQSIsImZpbGUiOiJtYXBwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgTWFwcGVyIHtcbiAgICBleHBvcnQgY2xhc3MgRXZlbnRlciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICAgICAgb24oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrPzogRnVuY3Rpb24sIGNvbnRleHQ/OiBhbnkpOiBhbnkge31cbiAgICAgICAgb2ZmKGV2ZW50TmFtZT86IHN0cmluZywgY2FsbGJhY2s/OiBGdW5jdGlvbiwgY29udGV4dD86IGFueSk6IGFueSB7fVxuICAgICAgICB0cmlnZ2VyKGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IGFueSB7fVxuICAgICAgICBiaW5kKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGNvbnRleHQ/OiBhbnkpOiBhbnkge31cbiAgICAgICAgdW5iaW5kKGV2ZW50TmFtZT86IHN0cmluZywgY2FsbGJhY2s/OiBGdW5jdGlvbiwgY29udGV4dD86IGFueSk6IGFueSB7fVxuICAgIFxuICAgICAgICBvbmNlKGV2ZW50czogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGNvbnRleHQ/OiBhbnkpOiBhbnkge31cbiAgICAgICAgbGlzdGVuVG8ob2JqZWN0OiBhbnksIGV2ZW50czogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiBhbnkge31cbiAgICAgICAgbGlzdGVuVG9PbmNlKG9iamVjdDogYW55LCBldmVudHM6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogYW55IHt9XG4gICAgICAgIHN0b3BMaXN0ZW5pbmcob2JqZWN0PzogYW55LCBldmVudHM/OiBzdHJpbmcsIGNhbGxiYWNrPzogRnVuY3Rpb24pOiBhbnkge31cbiAgICB9XG59XG5fLmV4dGVuZChNYXBwZXIuRXZlbnRlci5wcm90b3R5cGUsIEJhY2tib25lLkV2ZW50cyk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vdHlwaW5ncy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuZC50cycvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vdHlwaW5ncy9iYWNrYm9uZS9iYWNrYm9uZS5kLnRzJy8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPScuLi90eXBpbmdzL2hhbW1lci9oYW1tZXJqcy5kLnRzJy8+XG5cbmludGVyZmFjZSBBdG9tQ29uZmlnIHtcbiAgICBuYW1lPzogc3RyaW5nO1xuICAgIHZhbHVlPzogYW55O1xuICAgIHg/OiBudW1iZXI7XG4gICAgeT86IG51bWJlcjtcbiAgICB3aWR0aD86IG51bWJlcjtcbiAgICBoZWlnaHQ/OiBudW1iZXI7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZm9udFNpemU/OiBudW1iZXI7XG4gICAgc2hhcGU/OiBzdHJpbmc7XG4gICAgY2xpcHM/OiBhbnlbXTsgLyogbGlzdCBvZiBJbWFnZXMgKi9cbn1cblxubW9kdWxlIE1hcHBlciB7XG4gICAgZXhwb3J0IGNsYXNzIEF0b20gZXh0ZW5kcyBNYXBwZXIuRXZlbnRlciB7XG4gICAgICAgIF9uYW1lOiBzdHJpbmc7XG4gICAgICAgIF92YWx1ZTogYW55O1xuICAgICAgICBfeDogbnVtYmVyO1xuICAgICAgICBfeTogbnVtYmVyO1xuICAgICAgICB3aWR0aCA9IDUwO1xuICAgICAgICBoZWlnaHQgPSAyNTtcbiAgICAgICAgX2NvbG9yOiBzdHJpbmc7XG4gICAgICAgIF9mb250U2l6ZTogbnVtYmVyO1xuICAgICAgICBfc2hhcGU6IHN0cmluZztcbiAgICAgICAgX2NsaXBzOiBhbnlbXTsgLyogbGlzdCBvZiBJbWFnZXMgKi9cbiAgICAgICAgXG4gICAgICAgIG5vZGUgOiBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgc2VsZWN0ZWQgOiBib29sZWFuO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA6IEF0b21Db25maWcpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICBfLmV4dGVuZCh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAgICAgdGhpcy5fYnVpbGROb2RlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9idWlsZE5vZGUoKSA6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0aGlzLm5vZGUuaW5uZXJIVE1MID0gJ2F0b20nO1xuICAgICAgICAgICAgdGhpcy5ub2RlLnN0eWxlWydiYWNrZ3JvdW5kLWNvbG9yJ10gPSAnIzNmYTlmNSc7XG4gICAgICAgICAgICB0aGlzLm5vZGUuc3R5bGVbJ3BhZGRpbmcnXSA9ICcxMHB4JztcbiAgICAgICAgICAgIHRoaXMubm9kZS5zdHlsZVsnYm9yZGVyLXJhZGl1cyddID0gJzEwMHB4JztcbiAgICAgICAgICAgIHRoaXMubm9kZS5fYXRvbSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvbmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcG9zaXRpb25pbmcoKSA6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgIHRoaXMubm9kZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgdGhpcy54ICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyB0aGlzLnkgKyAncHgpIHRyYW5zbGF0ZVooMXB4KSc7XG4gICAgICAgICAgICB0aGlzLm5vZGUuc3R5bGVbJy13ZWJraXQtdHJhbnNmb3JtJ10gPSAndHJhbnNsYXRlWCgnICsgdGhpcy54ICsgJ3B4KSB0cmFuc2xhdGVZKCcgKyB0aGlzLnkgKyAncHgpIHRyYW5zbGF0ZVooMXB4KSc7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHgodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3ggPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgeCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl94O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBzZXQgeSh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5feSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdldCB5KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3k7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuL2V2ZW50ZXIudHMnIC8+XG5cbm1vZHVsZSBNYXBwZXIge1xuICAgIGV4cG9ydCBjbGFzcyBDYW1lcmEgZXh0ZW5kcyBFdmVudGVyIHtcbiAgICAgICAgcHJpdmF0ZSBfbWluU2NhbGUgPSAwLjAxO1xuICAgICAgICBwcml2YXRlIF9tYXhTY2FsZSA9IDI7XG4gICAgICAgIHByaXZhdGUgX3ggPSAwO1xuICAgICAgICBwcml2YXRlIF95ID0gMDtcbiAgICAgICAgcHJpdmF0ZSBfc2NhbGUgPSAxO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIF90cmlnZ2VyQ2hhbmdlKHByb3BlcnR5IDogc3RyaW5nKSA6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2U6JyArIHByb3BlcnR5KTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHNldCB4KHZhbHVlIDogbnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl94ID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlKCd4Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHgoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5feDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgc2V0IHkodmFsdWUgOiBudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3kgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDaGFuZ2UoJ3knKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgeSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl95O1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0IHNjYWxlKHZhbHVlIDogbnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9zY2FsZSA9IHRoaXMuX2dldFZhbGlkU2NhbGUodmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckNoYW5nZSgnc2NhbGUnKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgc2NhbGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbW92ZShkeCA6IG51bWJlciwgZHkgOiBudW1iZXIpIDogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLnggKz0gZHg7XG4gICAgICAgICAgICB0aGlzLnkgKz0gZHk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgem9vbUl0IChkU2NhbGUgOiBudW1iZXIpIDogdm9pZCB7XG4gICAgICAgICAgICBkU2NhbGUgPSAoZFNjYWxlIHx8IDApIC8gMTA7XG4gICAgICAgICAgICB2YXIgbmV3U2NhbGUgPSB0aGlzLnNjYWxlICogKDEgKyBkU2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5zY2FsZSA9IG5ld1NjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgbmV3IHNjYWxlIHZhbHVlIGlzIHZhbGlkXG4gICAgICAgIC8vIGlmIG5vIHNjYWxlIHZhbHVlIHBhc3NlZCAtIGdldHRpbmcgY3VycmVudCBvbmVcbiAgICAgICAgcHJpdmF0ZSBfZ2V0VmFsaWRTY2FsZShzY2FsZSA6IG51bWJlciA9IHRoaXMuc2NhbGUpIDogbnVtYmVyIHtcbiAgICAgICAgICAgIGlmIChzY2FsZSA8IHRoaXMuX21pblNjYWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21pblNjYWxlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzY2FsZSA+IHRoaXMuX21heFNjYWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21heFNjYWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldFNjYWxlTGltaXQocGFyYW1zIDoge21pbiA6IG51bWJlcjsgbWF4IDogbnVtYmVyfSkgOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMuX21pblNjYWxlID0gcGFyYW1zLm1pbjtcbiAgICAgICAgICAgIHRoaXMuX21heFNjYWxlID0gcGFyYW1zLm1heDtcbiAgICAgICAgICAgIHRoaXMuc2NhbGUgPSB0aGlzLl9nZXRWYWxpZFNjYWxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZ2V0U2NhbGVMaW1pdCgpIDoge21pbiA6IG51bWJlcjsgbWF4IDogbnVtYmVyfSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbiA6IHRoaXMuX21pblNjYWxlLFxuICAgICAgICAgICAgICAgIG1heCA6IHRoaXMuX21heFNjYWxlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIE1hcHBlciB7XG4gICAgZXhwb3J0IGNsYXNzIENvbm5lY3RvciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vdHlwaW5ncy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuZC50cycvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vdHlwaW5ncy9iYWNrYm9uZS9iYWNrYm9uZS5kLnRzJy8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPScuLi90eXBpbmdzL2hhbW1lci9oYW1tZXJqcy5kLnRzJy8+XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4vY2FtZXJhLnRzJy8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPScuL2F0b20udHMnLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4vY29ubmVjdG9yLnRzJy8+XG5cbmludGVyZmFjZSBXb3Jrc3BhY2VQYXJhbXMge1xuICAgIGNvbnRhaW5lcjogc3RyaW5nO1xuICAgIHdpZHRoIDogbnVtYmVyO1xuICAgIGhlaWdodCA6IG51bWJlcjtcbn1cblxubW9kdWxlIE1hcHBlciB7XG4gICAgZXhwb3J0IGNsYXNzIFdvcmtzcGFjZSBleHRlbmRzIE1hcHBlci5FdmVudGVyIHtcbiAgICAgICAgcHVibGljIGNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcbiAgICAgICAgcHVibGljIGF0b21zOiBBdG9tW10gPSBbXTtcbiAgICAgICAgLy9wdWJsaWMgY29ubmVjdG9yczogQ29ubmVjdG9yW10gPSBbXTtcblxuICAgICAgICBwdWJsaWMgd2lkdGggPSAwO1xuICAgICAgICBwdWJsaWMgaGVpZ2h0ID0gMDtcblxuICAgICAgICBwcml2YXRlIF9jb250YWluZXIgOiBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgcHJpdmF0ZSBfYmFjayA6IEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBwcml2YXRlIF9hdG9tQ29udGFpbmVyIDogSFRNTERpdkVsZW1lbnQ7XG5cbiAgICAgICAgLy9wcml2YXRlIF9kcmF3V2FpdGluZyA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF9jaGVja1Zpc2liaWxpdHlXYWl0aW5nID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJhbXM6IFdvcmtzcGFjZVBhcmFtcykge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmFtcy5jb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXIuc3R5bGUud2lkdGggPSBwYXJhbXMud2lkdGggKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IHBhcmFtcy5oZWlnaHQgKyAncHgnO1xuXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gcGFyYW1zLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBwYXJhbXMuaGVpZ2h0O1xuXG4gICAgICAgICAgICB0aGlzLl9pbml0QmFja2dyb3VuZCgpO1xuICAgICAgICAgICAgdGhpcy5faW5pdEF0b21Db250YWluZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX3NldHVwRHJhZ0NhbWVyYSgpO1xuICAgICAgICAgICAgdGhpcy5fc2V0dXBBdG9tRHJhZygpO1xuICAgICAgICAgICAgdGhpcy5fc2V0dXBDYW1lcmFNb3ZpbmcoKTtcbiAgICAgICAgICAgIHRoaXMuX3NldHVwS2V5Ym9hcmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NldHVwQXRvbURyYWcoKSA6IHZvaWQge1xuICAgICAgICAgICAgdmFyIG1jID0gbmV3IEhhbW1lci5NYW5hZ2VyKHRoaXMuX2NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIG1jLmFkZChuZXcgSGFtbWVyLlBhbih7IHRocmVzaG9sZDogMCwgcG9pbnRlcnM6IDAgfSkpO1xuXG4gICAgICAgICAgICB2YXIgZHJhZ0VsZW1lbnQgOiBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgICAgIG1jLm9uKFwicGFuc3RhcnRcIiwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBkcmFnRWxlbWVudCA9IGUudGFyZ2V0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtYy5vbihcInBhbm1vdmVcIiwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgYXRvbSA9IGRyYWdFbGVtZW50Ll9hdG9tO1xuICAgICAgICAgICAgICAgIGlmICghYXRvbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF0b20ueCA9IGUuY2hhbmdlZFBvaW50ZXJzWzBdLmNsaWVudFggKyB0aGlzLmNhbWVyYS54O1xuICAgICAgICAgICAgICAgIGF0b20ueSA9IGUuY2hhbmdlZFBvaW50ZXJzWzBdLmNsaWVudFkgICsgdGhpcy5jYW1lcmEueTtcbiAgICAgICAgICAgICAgICBhdG9tLl9wb3NpdGlvbmluZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkQXRvbShvOiBBdG9tKTogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLmF0b21zLnB1c2gobyk7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNBdG9tVmlzaWJsZShvKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2F0b21Db250YWluZXIuYXBwZW5kQ2hpbGQoby5ub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzQXRvbVZpc2libGUoYXRvbSA6IEF0b20pIHtcbiAgICAgICAgICAgIHZhciBjYW1lcmFYID0gdGhpcy5jYW1lcmEueDtcbiAgICAgICAgICAgIHZhciBjYW1lcmFZID0gdGhpcy5jYW1lcmEueTtcbiAgICAgICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgICAgICB2YXIgc2NyZWVuSGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgICAgICAgICBpZiAoYXRvbS54ID4gY2FtZXJhWCAtIHNjcmVlbldpZHRoICAmJiBhdG9tLnggPCBjYW1lcmFYICsgc2NyZWVuV2lkdGggKiAyICYmXG4gICAgICAgICAgICAgICAgYXRvbS55ID4gY2FtZXJhWSAtIHNjcmVlbkhlaWdodCAmJiBhdG9tLnkgPCBjYW1lcmFZICsgc2NyZWVuSGVpZ2h0ICogMikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXQgYmFja2dyb3VuZChiYWNrZ3JvdW5kIDogc3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAoYmFja2dyb3VuZC5pbmRleE9mKCcvJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmFjay5zdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddID0gJ3VybChcIicgKyBiYWNrZ3JvdW5kICsgJ1wiKSc7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmFjay5zdHlsZVsnYmFja2dyb3VuZC1jb2xvciddID0gJyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JhY2suc3R5bGVbJ2JhY2tncm91bmQtaW1hZ2UnXSA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuX2JhY2suc3R5bGVbJ2JhY2tncm91bmQtY29sb3InXSA9IGJhY2tncm91bmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2hpZGUoKSB7XG4gICAgICAgIC8vICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAvL31cbiAgICAgICAgLy9cbiAgICAgICAgLy9zaG93KCkge1xuICAgICAgICAvLyAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAvL31cblxuICAgICAgICBwdWJsaWMgc2V0U2l6ZShwYXJhbSA6IHt3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlcn0pIDogdm9pZCB7XG4gICAgICAgICAgICAvL3RoaXMuX3N0YWdlLnNldFdpZHRoKHBhcmFtLndpZHRoKTtcbiAgICAgICAgICAgIC8vdGhpcy5fc3RhZ2Uuc2V0SGVpZ2h0KHBhcmFtLmhlaWdodCk7XG4gICAgICAgICAgICAvL3RoaXMuX2JhY2sud2lkdGgocGFyYW0ud2lkdGgpO1xuICAgICAgICAgICAgLy90aGlzLl9iYWNrLmhlaWdodChwYXJhbS5oZWlnaHQpO1xuICAgICAgICAgICAgLy90aGlzLmNhbWVyYS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgIC8vdGhpcy5jYW1lcmEudHJpZ2dlcignY2hhbmdlOnNjYWxlJyk7XG4gICAgICAgICAgICAvL3RoaXMuX2JhY2tMYXllci5kcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wb3NpdGlvbkJhY2soKSA6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy5fYmFjay5zdHlsZVsnYmFja2dyb3VuZC1wb3NpdGlvbiddID0gLXRoaXMuY2FtZXJhLnggKyAncHggJyArIC10aGlzLmNhbWVyYS55ICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2luaXRCYWNrZ3JvdW5kKCkgOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMuX2JhY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9iYWNrKTtcbiAgICAgICAgICAgIHRoaXMuX2JhY2suc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgdGhpcy5fYmFjay5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWigtMSknO1xuICAgICAgICAgICAgdGhpcy5fYmFjay5zdHlsZVsnLXdlYmtpdC10cmFuc2Zvcm0nXSA9ICd0cmFuc2xhdGVaKC0xKSc7XG4gICAgICAgICAgICB0aGlzLl9iYWNrLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICAgICAgdGhpcy5fYmFjay5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvbkJhY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3Bvc2l0aW9uQXRvbUNvbnRhaW5lcigpIDogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLl9hdG9tQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyAtdGhpcy5jYW1lcmEueCArICdweCkgdHJhbnNsYXRlWSgnICsgLXRoaXMuY2FtZXJhLnkgKyAncHgpJztcbiAgICAgICAgICAgIHRoaXMuX2F0b21Db250YWluZXIuc3R5bGVbJy13ZWJraXQtdHJhbnNmb3JtJ10gPSAndHJhbnNsYXRlWCgnICsgLXRoaXMuY2FtZXJhLnggKyAncHgpIHRyYW5zbGF0ZVkoJyArIC10aGlzLmNhbWVyYS55ICsgJ3B4KSc7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbml0QXRvbUNvbnRhaW5lcigpIDogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLl9hdG9tQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fYXRvbUNvbnRhaW5lcik7XG4gICAgICAgICAgICB0aGlzLl9hdG9tQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgIHRoaXMuX2F0b21Db250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVooLTEpJztcbiAgICAgICAgICAgIHRoaXMuX2F0b21Db250YWluZXIuc3R5bGVbJy13ZWJraXQtdHJhbnNmb3JtJ10gPSAndHJhbnNsYXRlWigtMSknO1xuICAgICAgICAgICAgdGhpcy5fcG9zaXRpb25BdG9tQ29udGFpbmVyKCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHByaXZhdGUgX3NldHVwRHJhZ0NhbWVyYSgpIDogdm9pZCB7XG4gICAgICAgICAgICB2YXIgbWMgPSBuZXcgSGFtbWVyLk1hbmFnZXIodGhpcy5fYmFjayk7XG5cbiAgICAgICAgICAgIG1jLmFkZChuZXcgSGFtbWVyLlBhbih7IHRocmVzaG9sZDogMCwgcG9pbnRlcnM6IDAgfSkpO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlvdXMgPSB7fTtcbiAgICAgICAgICAgIG1jLm9uKFwicGFuc3RhcnRcIiwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBwcmV2aW91cyA9IGUuY2VudGVyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtYy5vbihcInBhbm1vdmVcIiwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UG9zID0ge1xuICAgICAgICAgICAgICAgICAgICB4IDogZS5jZW50ZXIueCArIGUuZGVsdGFYLFxuICAgICAgICAgICAgICAgICAgICB5IDogZS5jZW50ZXIueSArIGUuZGVsdGFZXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgZHggPSBwcmV2aW91cy54IC0gbmV3UG9zLng7XG4gICAgICAgICAgICAgICAgdmFyIGR5ID0gcHJldmlvdXMueSAtIG5ld1Bvcy55O1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtZXJhLm1vdmUoZHgsIGR5KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NpdGlvbkJhY2soKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NpdGlvbkF0b21Db250YWluZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXF1ZXN0Q2hlY2tWaXNpYWJpbGl0eSgpO1xuICAgICAgICAgICAgICAgIHByZXZpb3VzID0gbmV3UG9zO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9yZXF1ZXN0Q2hlY2tWaXNpYWJpbGl0eSgpIDogdm9pZCB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2hlY2tWaXNpYmlsaXR5V2FpdGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2NoZWNrVmlzaWJpbGl0eVdhaXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdG9tcy5mb3JFYWNoKChhdG9tKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2aXNpYmxlID0gdGhpcy5faXNBdG9tVmlzaWJsZShhdG9tKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZpc2libGUgJiYgIWF0b20ubm9kZS5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdG9tQ29udGFpbmVyLmFwcGVuZENoaWxkKGF0b20ubm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXZpc2libGUgJiYgYXRvbS5ub2RlLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0b20ubm9kZS5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGF0b20ubm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jaGVja1Zpc2liaWxpdHlXYWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0dXBDYW1lcmFNb3ZpbmcoKSB7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXR1cEtleWJvYXJkKCkgOiB2b2lkIHtcbiAgICAgICAgICAgIHdpbmRvdy5vbmtleWRvd24gPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDM3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FtZXJhLnggLT0gMztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW1lcmEueSAtPSAzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzOSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYS54ICs9IDM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDQwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FtZXJhLnkgKz0gMztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9