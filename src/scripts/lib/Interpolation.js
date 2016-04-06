import Emitter from './Emitter';

class Interpolation extends Emitter {
    constructor( start, end, duration, timestamp ) {
        super();
        this._start = start;
        this._end = end;
        this._startTime = timestamp;
        this._duration = duration;
        this._willComplete = false;
    }

    play( timestamp ) {
        if( this._willComplete ) {
            this.trigger( 'complete' );
        }

        if( timestamp >= this._duration + this._startTime ) {
            this._willComplete = true;
            return this._end;
        }

        // Returns a number between 0 and 1 representing the progress:
        const delta = ( timestamp - this._startTime ) / this._duration;

        // Returns a number between start and end based on delta of progress.
        // Uses easeInOutQuart easing function:
        const amt = this._start + ( ( this._end - this._start ) * delta * delta );

        return amt;
    }

    destroy() {
        this._start = null;
        this._end = null;
        this._startTime = null;
        this._duration = null;
        this._play = null;
        this._willComplete = null;
    }
};

export default Interpolation;
