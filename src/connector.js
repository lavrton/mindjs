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
