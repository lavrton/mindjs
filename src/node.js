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
