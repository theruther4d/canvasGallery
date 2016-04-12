import Hammer from 'hammerjs';
import Item from './Item';

/*
 * Add tension to end slides.
 * Variable transition duration based on how far we are from the destination.
 * Resize handler
 * * destroy() method or update() for Item
 */

class Gallery {
    constructor( el ) {
        this._width = 400;
        this._height = 400;
        this._margin = 40;
        this.currentSlide = 0;
        this._lastPos = 0;
        this.pos = 0;
        this._arrowMultiplier = 1;
        this._ready = false;
        this._transitioning = false;
        this._transitionStart = false;
        this._createCanvasLayers( el );
        this._drag = 0;
        this._direction = false;

        this._getSlides( el, ( slides ) => {
           this._slides = slides;
           this.currentPosition = this._slides[this.currentSlide].leftOffset;
           this._numSlides = slides.length;
           this._fullWidth = ( this._width + this._margin ) * ( this._numSlides - 1 );
           this._bindKeyEvents();
           this._bindTouchEvents();
           this._ready = true;
           this._draw();
           this._slides[this.currentSlide]._onDraw( this.pos );
       });
    }

    _getSlides( gallery, cb ) {
        let promises = [];
        const slides = Array.from( gallery.querySelectorAll( '.gallery__item' ) );

        slides.forEach( ( slide, idx ) => {
            const src = slide.src;
            const img = document.createElement( 'img' );
            let width, height;

            const promise = new Promise( ( resolve, reject ) => {
                img.onload = () => {
                    resolve( new Item( this._currentCtx, img, idx, this._width, this._height, this._margin ) );
                };

                img.onerror = () => {
                    reject( 'image could not load' );
                }
            });

            promises.push( promise );
            img.src = src;
        });

        return Promise.all( promises ).then( cb );
    }

    _createCanvasLayers( gallery ) {
        const canvasFragment = document.createDocumentFragment();
        const canvases = ['current'];

        canvases.forEach( ( canvas ) => {
            const node = document.createElement( 'canvas' );
            node.width = this._width;
            node.height = this._height;
            node.classList.add( canvas );
            this[`_${canvas}`] = node;
            this[`_${canvas}Ctx`] = node.getContext( '2d' );
            canvasFragment.appendChild( node );
        });

        // Put it out:
        gallery.appendChild( canvasFragment );
    }

    _bindKeyEvents() {
        document.addEventListener( 'keydown', ( e ) => {
            if( e.keyCode === 37 ) {
                if( this.pos > 0 ) {
                    e.preventDefault();
                    this.pos -= this._arrowMultiplier;
                }
            } else if( e.keyCode === 39 ) {
                if( this.pos < this._fullWidth ) {
                    e.preventDefault();
                    this.pos += this._arrowMultiplier;
                }
            } else {
                return;
            }
        });
    }

    _bindTouchEvents() {
        this._hammer = new Hammer( this._current );
        this._hammer.on( 'pan', ( e ) => {
            this._direction = e.direction === 4 || e.direction === 2 ? e.direction : this._direction;
            this._drag = Math.round( e.deltaX );

            let tentativePos = this.currentPosition + ( this._drag * -1 );
            if( tentativePos <= 0 || tentativePos >= this._fullWidth ) {
                tentativePos = this.currentPosition + ( this._drag * -0.5 );
            }

            this.pos = tentativePos;

            if( e.isFinal && Math.abs( this._drag ) >= this._width / 3 && !this._isTerminal() ) {
                const which = this._drag < 0 ? this.currentSlide + 1 : this.currentSlide - 1;
                this._goToSlide( which );
            } else if( e.isFinal ) {
                this._transition( this.pos, this.currentPosition );
            }
        });
    }

    _isTerminal() {
        console.log( `direction: ${this._direction}` );
        return ( this.currentSlide === 0 && this._direction === 4 ) || ( this.currentSlide === this._numSlides - 1 && this._direction === 2 );
    }

    _transition( from, to, duration = 250 ) {
        this._transitioning = true;
        this._transitionDuration = duration;
        this._transitionFrom = from;
        this._transitionTo = to;
    }

    _setCurrentPosition() {
        const dest = this._slides[this.currentSlide].leftOffset;
        this.currentPosition = dest;
        this._transition( this.pos, dest );
    }

    _goToSlide( slideNo ) {
        if( slideNo < 0 || slideNo > this._numSlides - 1 ) {
            return;
        }

        this.currentSlide = slideNo;
        this._setCurrentPosition();
    }

    _getSlidesInView( pos ) {
        let inView = [];

        this._slides.forEach( ( slide, idx ) => {
            if( pos >= slide.leftBound && pos <= slide.rightBound ) {
                inView.push( idx );
            }
        });

        return inView;
    }

    _clear() {
        return this._currentCtx.clearRect( 0, 0, this._width, this._height );
    }

    _draw( timestamp ) {
        if( ( typeof timestamp === 'undefined' || ( this.pos === this._lastPos && !this._transitioning ) || !this._ready ) ) {
            this._raf = requestAnimationFrame( this._draw.bind( this ) );
            return;
        }


        if( this._transitioning ) {
            if( this._transitionStart === false ) {
                this._transitionStart = timestamp;
            }


            const delta = Math.min( ( timestamp - this._transitionStart ) / this._transitionDuration, 1 );
            this.pos = ( ( this._transitionTo - this._transitionFrom ) * delta * delta ) + this._transitionFrom;

            if( delta === 1 ) {
                this._transitioning = false;
                this._transitionStart = false;
            }
        }

        this._clear();
        this._getSlidesInView( this.pos ).forEach( ( idx ) => {
            this._slides[idx].trigger( 'draw', this.pos );
        });

        this._lastPos = this.pos;
        this._raf = requestAnimationFrame( this._draw.bind( this ) );
    }
};

export default Gallery;
