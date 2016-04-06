import Emitter from './Emitter';

class Timer extends Emitter {
    constructor() {
        super();
        this._ticking = false;
        this._lastTime = null;
        this._animationFrame = null;
    }

    _draw( timeStamp ) {
        if( !this._ticking ) {
            return;
        }
        this._lastTime = timeStamp;
        this.trigger( 'draw', timeStamp );
        this._animationFrame = window.requestAnimationFrame( this._draw.bind( this ) );
    }

    time() {
        return this._lastTime;
    }

    start() {
        if( this._ticking ) {
            return;
        }

        this._ticking = true;
        this._animationFrame = window.requestAnimationFrame( this._draw.bind( this ) );
    }

    _clear() {
        this._events = {};
    }

    stop() {
        window.cancelAnimationFrame( this._animationFrame );
        this._lastTime = null;
        this._animationFrame = null;
        this._ticking = false;
        this._clear();

        return false;
    }
};

export default Timer;
