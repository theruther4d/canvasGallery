import Emitter from './Emitter';

class Interpolation extends Emitter {
    constructor( start, end, duration, timestamp ) {
        super();
        this._start = start;
        this._end = end;
        this._startTime = timestamp;
        this._perTick =  ( end - start ) / duration;
        this._duration = duration;
    }

    play( timestamp ) {
        if( timestamp >= this._duration + this._startTime ) {
            this.trigger( 'complete' );
            return false;
        }

        const delta = timestamp - this._startTime;
        const which = this._start < this._end ? 'min' : 'max';
        return Math[which]( this._start + ( delta * this._perTick ), this._end );
    }

    destroy() {
        this._start = null;
        this._end = null;
        this._startTime = null;
        this._perTick = null;
        this._duration = null;
        this._play = null;
    }
};

export default Interpolation;
