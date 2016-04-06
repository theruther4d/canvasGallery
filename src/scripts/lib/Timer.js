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

    stop() {
        window.cancelAnimationFrame( this._animationFrame );
        this._lastTime = null;
        this._animationFrame = null;
        this._ticking = false;

        return false;
    }
};

export default Timer;


// this._clock.on( 'update', ( e.deltaX ) => {
//  this._lastOffset = e.deltaX;
// })
//
// this._clock.on( 'draw', ( e.deltaX ) => {
//  // do stuff with e.deltaX
// })
//
