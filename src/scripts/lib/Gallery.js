import Emitter from './Emitter';
import Hammer from 'hammerjs';
import Item from './Item';
import raf from './raf';

raf();

/** Gallery Class */
class Gallery extends Emitter {

    /**
     * Constructor.
     * @param { DOM node } el - the DOM node to gallerify
     * @param { number } maxWidth - the max width of the Gallery.
     * @param { number } maxHeight - the max height of the Gallery.
     * @param { boolean } fluid - whether to resize the Gallery with the window width.
     * @param { boolean } keyboard - whether to add keyboard support.
     * @param { boolean } touch - whether to add touch support.
     * @param { boolean } keyBoardTransitionDuration - the length of the transition when the left / right arrows are pressed.
     */
    constructor( { el, maxWidth, maxHeight = 800, fluid = true, keyboard = true, touch = true, keyBoardTransitionDuration = 500 } ) {
        super();
        this._el = el;
        this._width = maxWidth || this._el.getBoundingClientRect().width;
        this._maxHeight = maxHeight;
        this._fluid = fluid;
        this._keyboard = keyboard;
        this._touch = touch;
        this._margin = 40;
        this.currentSlide = 0;
        this._lastPos = 0;
        this.pos = 0;
        this._ready = false;
        this._transitioning = false;
        this._transitionStart = false;
        this._drag = 0;
        this._direction = false;
        this._ticking = false;
        this._keyBoardTransitionDuration = keyBoardTransitionDuration;

        this._getSlides( this._el, ( slides ) => {
            this._slideImages = slides;
            const slideDimensions = this._getSlideDimensions( slides );
            this._height = slideDimensions.tallest;
            this._createCanvasLayers( el );
            this._slides = [];

            slides.forEach( ( slide, idx ) => {
                this._slides.push( new Item( this._ctx, slide, idx, this._width, this._height, this._margin, slideDimensions[idx].width, slideDimensions[idx].height ) );
            });

           this.currentPosition = this._slides[this.currentSlide].leftOffset;
           this._numSlides = slides.length;
           this._fullWidth = ( this._width + this._margin ) * ( this._numSlides - 1 );
           this._bindEvents();
           this._ready = true;
           this._draw();
           this._slides[this.currentSlide]._onDraw( this.pos );
           this.trigger( 'ready', {
               numSlides: this._numSlides,
               currentSlide: this.currentSlide
           });
       });
    }

    /**
     * Fetches images from the DOM and creates Items.
     * @param { DOM node } gallery
     * @param { function } cb - the callback to be executed when the promises resolve. Receives an array of items as the only parameter.
     */
    _getSlides( gallery, cb ) {
        let promises = [];
        const slides = Array.from( gallery.querySelectorAll( '.gallery__item' ) );

        slides.forEach( ( slide, idx ) => {
            const src = slide.src;
            const img = document.createElement( 'img' );
            let width, height;

            const promise = new Promise( ( resolve, reject ) => {
                img.onload = () => {
                    // resolve( new Item( this._ctx, img, idx, this._width, this._height, this._margin ) );
                    resolve( img );
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


    /**
     * Takes an array of slides and returnes the scaled values for each, as well as the height of the tallest scaled slide.
     * @param { array } slides
     * @return { object } dimensions
     */
    _getSlideDimensions( slides ) {
        let tallest = 0;
        let info = {};

        slides.forEach( ( slide, idx ) => {
            const dimensions = this._scaleImageDimensions( slide.width, slide.height, this._width, this._maxHeight );
            tallest = dimensions.height > tallest ? dimensions.height : tallest;
            info[idx] = dimensions;
        });

        info.tallest = tallest;
        return info;
    }


    /**
     * Takes an images dimensions, and returns the scaled values to fit into the gallery.
     * @param { number} width
     * @param { number} height
     * @param { number} galleryMaxWidth
     * @param { number} galleryMaxHeight
     */
    _scaleImageDimensions( width, height, galleryMaxWidth, galleryMaxHeight ) {
        const itemRatio = width / height;
        const galleryRatio = galleryMaxWidth / galleryMaxHeight;
        const willScaleXAxis = itemRatio >= galleryRatio;
        const newWidth = Math.round( willScaleXAxis ? galleryMaxWidth : ( width * galleryMaxHeight ) / height );
        const newHeight = Math.round( willScaleXAxis ? ( height * galleryMaxWidth ) / width : galleryMaxHeight );

        return {
            width: newWidth,
            height: newHeight
        };
    }


    /**
     * Creates the <canvas> element.
     * @param { DOM node } gallery
     */
    _createCanvasLayers( gallery ) {
        this._canvas = document.createElement( 'canvas' );
        this._canvas.width = this._width;
        this._canvas.height = this._height;
        this._ctx = this._canvas.getContext( '2d' );

        // Put it out:
        gallery.appendChild( this._canvas );
    }


    /**
     * Attaches key listeners.
     */
    _bindKeyEvents() {
        document.addEventListener( 'keydown', ( e ) => {
            if( this._transitioning || e.altKey || e.ctrlKey || e.shiftKey ) {
                return;
            }

            if( e.keyCode === 37 ) {
                e.preventDefault();
                this.goTo( this.currentSlide - 1, this._keyBoardTransitionDuration );
            } else if( e.keyCode === 39 ) {
                e.preventDefault();
                this.goTo( this.currentSlide + 1, this._keyBoardTransitionDuration );
            }
        });
    }


    /**
     * Attaches touch listeners.
     */
    _bindTouchEvents() {
        this._hammer = new Hammer( this._canvas );
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
                this.goTo( which );
            } else if( e.isFinal ) {
                this._transition( this.pos, this.currentPosition );
            }
        });
    }


    /**
     * Attaches resize handler.
     */
     _bindResizeEvent() {
        const resizeHandler = ( timestamp ) => {
            this._width = this._el.getBoundingClientRect().width;
            const slideDimensions = this._getSlideDimensions( this._slideImages );
            this._canvas.width = this._width;
            this._canvas.height = slideDimensions.tallest;
            this._slides.forEach( ( slide, idx ) => {
                slide.refresh( slideDimensions[idx].width, slideDimensions[idx].height, this._width, this._maxHeight );
            });
            this.off( 'draw', resizeHandler );
            this._clear();
            this._lastPos = false;
            this.pos = this._slides[this.currentSlide].leftOffset;

            this._ticking = false;
        };

        window.addEventListener( 'resize', () => {
            if( this._ticking ) {
                return;
            }

            this._ticking = true;

            this.on( 'draw', resizeHandler );
        });
     }


    /**
     * Binds applicable events.
     */
     _bindEvents() {
         if( this._touch ) {
             this._bindTouchEvents();
         }

         if( this._keyboard ) {
             this._bindKeyEvents();
         }

         if( this._fluid ) {
             this._bindResizeEvent();
         }
     }


    /**
     * Detects if the current slide can move in the current direction.
     * @return { boolean }
     */
    _isTerminal() {
        return ( this.currentSlide === 0 && this._direction === 4 ) || ( this.currentSlide === this._numSlides - 1 && this._direction === 2 );
    }


    /**
     * Creates a transition from one position to another.
     * @param { number } from
     * @param { number } to
     * @param { number = 250 } duration
     */
    _transition( from, to, duration = 250 ) {
        this._transitioning = true;
        this._transitionDuration = duration;
        this._transitionFrom = from;
        this._transitionTo = to;
    }


    /**
     * Advances to the next/previous slide.
     */
    _setCurrentPosition( duration = 250 ) {
        const dest = this._slides[this.currentSlide].leftOffset;
        this.currentPosition = dest;
        this._transition( this.pos, dest, duration );
    }


    /**
     * Goes to the specified slide.
     * @param { number } slideNo
     */
    goTo( slideNo, duration = 250 ) {
        if( slideNo < 0 || slideNo > this._numSlides - 1 ) {
            return;
        }

        this.currentSlide = slideNo;
        this._setCurrentPosition( duration );
        this.trigger( 'update', {
            numSlides: this._numSlides,
            currentSlide: this.currentSlide
        });
    }


    /**
     * Attempts to go to the next slide.
     */
    next() {
        this.goTo( this.currentSlide + 1 );
    }


    /**
     * Attempts to go to the previous slide.
     */
    previous() {
        this.goTo( this.currentSlide - 1 );
    }


    /**
     * Returns the currently visible slides.
     * @param { number } pos - the current position
     * @return { array } slides
     */
    _getSlidesInView( pos ) {
        let inView = [];

        this._slides.forEach( ( slide, idx ) => {
            if( pos >= slide.leftBound && pos <= slide.rightBound ) {
                inView.push( idx );
            }
        });

        return inView;
    }

    /**
     * Clears the <canvas> for next paint.
     */
    _clear() {
        return this._ctx.clearRect( 0, 0, this._width, this._height );
    }


    /**
     * Callback executed at each animationFrame.
     * @param { number } timestamp
     */
    _draw( timestamp ) {
        this.trigger( 'draw', timestamp );

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

    destroy() {
        this._el.removeChild( this._canvas );
        this._canvas = null;
        this._el = null;
        this._ctx = null;
        this._direction = null;
        this._drag = null;
        this._events = null;
        this._fluid = null;
        this._fullWidth = null;
        if( this._hammer ) {
            this._hammer.destroy();
        }
        this._hammer = null;
        this._height = null;
        this._keyBoardTransitionDuration = null;
        this._keyboard = null;
        this._lastPos = null;
        this._margin = null;
        this._maxHeight = null;
        this._numSlides = null;
        if( this._raf ) {
            cancelAnimationFrame( this._raf );
        }
        this._ready = null;
        this._slideImages = null;
        this._slides.forEach( ( slide ) => {
            slide._destroy();
        });
        this._slides = null;
        this._ticking = null;
        this._touch = null;
        this._transitionStart = null;
        this._transitioning = null;
        this._width = null;
        this.currentPosition = null;
        this.currentSlide = null;
        this.pos = null;
    }
};

export default Gallery;
