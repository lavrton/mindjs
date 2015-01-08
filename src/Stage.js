var utils = require('./utils');

class Stage {

    constructor(params) {
        if (!params) {
            utils.throw('params for Stage constructor required.')
        }
        if (!params.container) {
            utils.throw('container parameter is required.')
        }
        this._container = document.getElementById(params.container);

        this._container.style.width = params.width + 'px';
        this._container.style.height = params.height + 'px';

        this.width = params.width;
        this.height = params.height;

//        this._initBackground();
//        this._initAtomContainer();
//        this._setupDragCamera();
//        this._setupAtomDrag();
//        this._setupCameraMoving();
//        this._setupKeyboard();
    }

    _setupAtomDrag() {
        var mc = new Hammer.Manager(this._container);

        mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

        mc.on("panstart", (e) => {
            dragElement = e.target;
        });
        mc.on("panmove", (e) => {
            var atom = dragElement._atom;
            if (!atom) {
                return;
            }
            atom.x = e.changedPointers[0].clientX + this.camera.x;
            atom.y = e.changedPointers[0].clientY  + this.camera.y;
            atom._positioning();
        });
    }
    addAtom(o) {
        this.atoms.push(o);
        if (this._isAtomVisible(o)) {
            this._atomContainer.appendChild(o.node);
        }
    }

    _isAtomVisible() {
        var cameraX = this.camera.x;
        var cameraY = this.camera.y;
        var screenWidth = this.width;
        var screenHeight = this.height;
        if (atom.x > cameraX - screenWidth  && atom.x < cameraX + screenWidth * 2 &&
            atom.y > cameraY - screenHeight && atom.y < cameraY + screenHeight * 2) {
            return true;
        } else {
            return false;
        }
    }

    set background(background) {
        if (background.indexOf('/') !== -1) {
            this._back.style['background-image'] = 'url("' + background + '")';
            this._back.style['background-color'] = '';
        } else {
            this._back.style['background-image'] = '';
            this._back.style['background-color'] = background;
        }
    }

    //hide() {
    //    this._container.style.display = 'none';
    //}
    //
    //show() {
    //    this._container.style.display = '';
    //}

    setSize(param) {
        //this._stage.setWidth(param.width);
        //this._stage.setHeight(param.height);
        //this._back.width(param.width);
        //this._back.height(param.height);
        //this.camera.trigger('change');
        //this.camera.trigger('change:scale');
        //this._backLayer.draw();
    }

    _positionBack() {
        this._back.style['background-position'] = -this.camera.x + 'px ' + -this.camera.y + 'px';
    }

    _initBackground() {
        this._back = document.createElement('div');
        this._container.appendChild(this._back);
        this._back.style.position = 'absolute';
        this._back.style.transform = 'translateZ(-1)';
        this._back.style['-webkit-transform'] = 'translateZ(-1)';
        this._back.style.width = '100%';
        this._back.style.height = '100%';
        this._positionBack();
    }

    _positionAtomContainer() {
        this._atomContainer.style.transform = 'translateX(' + -this.camera.x + 'px) translateY(' + -this.camera.y + 'px)';
        this._atomContainer.style['-webkit-transform'] = 'translateX(' + -this.camera.x + 'px) translateY(' + -this.camera.y + 'px)';
    }

    _initAtomContainer() {
        this._atomContainer = document.createElement('div');
        this._container.appendChild(this._atomContainer);
        this._atomContainer.style.position = 'absolute';
        this._atomContainer.style.transform = 'translateZ(-1)';
        this._atomContainer.style['-webkit-transform'] = 'translateZ(-1)';
        this._positionAtomContainer();
    }


    _setupDragCamera() {
        var mc = new Hammer.Manager(this._back);

        mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

        var previous = {};
        mc.on("panstart", (e) => {
            previous = e.center;
        });
        mc.on("panmove", (e) => {
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
        });
    }

    _requestCheckVisiability() {
        if (this._checkVisibilityWaiting) {
            return;
        }
        this._checkVisibilityWaiting = true;
        setTimeout(() => {
            this.atoms.forEach((atom) => {
                var visible = this._isAtomVisible(atom);
                if (visible && !atom.node.parentElement) {
                    this._atomContainer.appendChild(atom.node);
                } else if (!visible && atom.node.parentElement) {
                    atom.node.parentElement.removeChild(atom.node);
                }
            });
            this._checkVisibilityWaiting = false;
        }, 100);
    }

    _setupCameraMoving() {
    }

    _setupKeyboard() {
        window.onkeydown = (e) => {
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
        }
    }
}

module.exports = Stage;