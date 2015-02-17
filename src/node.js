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
