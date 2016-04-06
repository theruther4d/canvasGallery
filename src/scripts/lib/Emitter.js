class Emitter {
    constructor() {
        this._events = {};
    }

    _hasEvent( eventName ) {
        return this._events.hasOwnProperty( eventName );
    }

    on( eventName, callback ) {
        this._events[eventName] = this._events[eventName] || [];

        this._events[eventName].push( callback );

        // const returnValue = events[eventName](callback);

        // foreach callback in update, stash the return value of the callback, use to expose to draw
    }

    off( eventName, callback ) {
        if( !this._hasEvent( eventName ) ) {
            return;
        }

        const index = this._events[eventName].indexOf( callback );

        if( index > -1 ) {
            this._events[eventName].splice( index, 1 );
        }
    }

    trigger( eventName, data ) {
        if( this._events.hasOwnProperty( eventName ) ) {
            this._events[eventName].forEach( ( callback ) => {
                if( data ) {
                    callback( data );
                } else {
                    callback();
                }
            });
        }
    }

    destroy() {
        this._events = null;
    }
};

export default Emitter;
