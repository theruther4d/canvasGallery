import Emitter from './Emitter';

class Timer extends Emitter {
    constructor() {
        this._ticking = false;
        this._boundOnDraw = this._draw.bind( this );
    }

    _requestTick() {
        if( !this._ticking ) {
            requestAnimationFrame( this._boundOnDraw );
        }

        this._ticking = true;
    }

    _update() {
        this._requestTick();
        this.trigger( 'update' );
    }

    _draw() {
        this.trigger( 'draw' );
    }
};
