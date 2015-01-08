/// <reference path='../typings/underscore/underscore.d.ts'/>
/// <reference path='../typings/backbone/backbone.d.ts'/>
/// <reference path='../typings/hammer/hammerjs.d.ts'/>

interface AtomConfig {
    name?: string;
    value?: any;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    fontSize?: number;
    shape?: string;
    clips?: any[]; /* list of Images */
}

module Mapper {
    export class Atom extends Mapper.Eventer {
        _name: string;
        _value: any;
        _x: number;
        _y: number;
        width = 50;
        height = 25;
        _color: string;
        _fontSize: number;
        _shape: string;
        _clips: any[]; /* list of Images */
        
        node : HTMLDivElement;
        selected : boolean;

        constructor(params : AtomConfig) {
            super();
            _.extend(this, params);
            this._buildNode();
        }

        private _buildNode() : void {
            this.node = document.createElement('div');
            this.node.innerHTML = 'atom';
            this.node.style['background-color'] = '#3fa9f5';
            this.node.style['padding'] = '10px';
            this.node.style['border-radius'] = '100px';
            this.node._atom = this;
            this._positioning();
        }

        private _positioning() : void {
            this.node.style.position = 'absolute';
            this.node.style.transform = 'translateX(' + this.x + 'px) translateY(' + this.y + 'px) translateZ(1px)';
            this.node.style['-webkit-transform'] = 'translateX(' + this.x + 'px) translateY(' + this.y + 'px) translateZ(1px)';
        }
        set x(value) {
            this._x = value;
        }
        get x() {
            return this._x;
        }
        
        set y(value) {
            this._y = value;
        }
        get y() {
            return this._y;
        }
    }
}
