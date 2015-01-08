/// <reference path='./eventer.ts' />

module Mapper {
    export class Camera extends Eventer {
        private _minScale = 0.01;
        private _maxScale = 2;
        private _x = 0;
        private _y = 0;
        private _scale = 1;

        constructor() {
            super();
        }
        private _triggerChange(property : string) : void {
            this.trigger('change:' + property);
            this.trigger('change');
        }
        
        set x(value : number) {
            this._x = value;
            this._triggerChange('x');
        }
        get x() {
            return this._x;
        }
        
        set y(value : number) {
            this._y = value;
            this._triggerChange('y');
        }
        get y() {
            return this._y;
        }

        set scale(value : number) {
            this._scale = this._getValidScale(value);
            this._triggerChange('scale');
        }
        get scale() {
            return this._scale;
        }

        public move(dx : number, dy : number) : void {
            this.x += dx;
            this.y += dy;
        }

        public zoomIt (dScale : number) : void {
            dScale = (dScale || 0) / 10;
            var newScale = this.scale * (1 + dScale);
            this.scale = newScale;
        }

        // check if new scale value is valid
        // if no scale value passed - getting current one
        private _getValidScale(scale : number = this.scale) : number {
            if (scale < this._minScale) {
                return this._minScale;
            } else if (scale > this._maxScale) {
                return this._maxScale;
            }
            return scale;
        }

        public setScaleLimit(params : {min : number; max : number}) : void {
            this._minScale = params.min;
            this._maxScale = params.max;
            this.scale = this._getValidScale();
        }

        public getScaleLimit() : {min : number; max : number} {
            return {
                min : this._minScale,
                max : this._maxScale
            };
        }
    }
}
