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
