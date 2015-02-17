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