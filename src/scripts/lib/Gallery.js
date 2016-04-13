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
     */
    constructor( el ) {
        super();
        this._width = el.getBoundingClientRect().width;
        this._maxHeight = 700;
        // this._height = 400;
        this._margin = 40;
        this.currentSlide = 0;
        this._lastPos = 0;
        this.pos = 0;
        this._ready = false;
        this._transitioning = false;
        this._transitionStart = false;
        this._drag = 0;
        this._direction = false;

        this._getSlides( el, ( slides ) => {
            this._height = this._getTallestSlide( slides );
            this._createCanvasLayers( el );
            this._slides = [];
            let offsetBefore = 0;

            slides.forEach( ( slide, idx ) => {
                this._slides.push( new Item( this._ctx, slide, idx, this._width, this._height, this._margin, offsetBefore ) );
                offsetBefore += Math.min( slide.width, this._width ) + this._margin;
            });

           this.currentPosition = this._slides[this.currentSlide].leftOffset;
           this._numSlides = slides.length;
           this._fullWidth = ( this._width + this._margin ) * ( this._numSlides - 1 );
           this._bindKeyEvents();
           this._bindTouchEvents();
           this._ready = true;
           this._draw();
           this._slides[this.currentSlide]._onDraw( this.pos );
           this.trigger( 'ready' );
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
     *
     *
     */
    _getTallestSlide( slides ) {
        let tallest = 0;

        slides.forEach( ( slide ) => {
            const dimensions = this._scaleImageDimensions( slide.width, slide.height, this._width, this._maxHeight );
            tallest = dimensions.height > tallest ? dimensions.height : tallest;
        });

        return tallest;
    }


    /**
     * HOW TO SEND THE SCALED DATA TO THE ITEM WITHOUT FIGURING IT TWICE?
     * LOOP THROUGH TO CREATE THE SLIDES, FIGURE OUT THE MAX HEIGHT, SET IT ON THE CANVAS ONLY ONCE:
     * CREATE CANVAS WITHOUT DIMENSIONS
     * LOOP THROUGH SLIDES AND FIGURE OUT MAX HEIGHT, PASSING <CANVAS> AND SCALED SIZE TO THE ITEM
     * ADD DIMENSIONS TO THE CANVAS
     */
    _scaleImageDimensions( width, height, galleryMaxWidth, galleryMaxHeight ) {
        const itemRatio = width / height;
        const galleryRatio = galleryMaxWidth / galleryMaxHeight;
        const willScaleXAxis = itemRatio >= galleryRatio;
        const newWidth = willScaleXAxis ? galleryMaxWidth : ( width * galleryMaxHeight ) / height;
        const newHeight = willScaleXAxis ? ( height * galleryMaxWidth ) / width : galleryMaxHeight;


        // console.log( `original width: ${width}` );
        // console.log( `original height: ${height}` );
        // console.log( `itemRatio: ${itemRatio}` );
        // console.log( `galleryRatio: ${galleryRatio}` );
        // console.log( `scaling ${willScaleXAxis ? 'width' : 'height'}` );
        // console.log( '- - - - - - - - -' );
        // console.log( `new width: ${newWidth}` );
        // console.log( `new height: ${newHeight}` );
        // console.log( '= = = = = = = = = = = =' );
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
                this._goToSlide( this.currentSlide - 1, 500 );
            } else if( e.keyCode === 39 ) {
                e.preventDefault();
                this._goToSlide( this.currentSlide + 1, 500 );
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
                this._goToSlide( which );
            } else if( e.isFinal ) {
                this._transition( this.pos, this.currentPosition );
            }
        });
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
    _goToSlide( slideNo, duration = 250 ) {
        if( slideNo < 0 || slideNo > this._numSlides - 1 ) {
            return;
        }

        this.currentSlide = slideNo;
        this._setCurrentPosition( duration );
        this.trigger( 'update' );
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
