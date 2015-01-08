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