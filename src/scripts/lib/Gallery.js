import Hammer from 'hammerjs';
import Timer from './Timer';
import Interpolation from './Interpolation';

class Gallery {
    constructor( el ) {
        this._el = el;
        this._margin = 40;
        this._amt = 40;
        this._maxWidth = 960;
        this._maxHeight = 0;
        this._ww = window.outerWidth || window.innerWidth;
        this.currentSlide = 0;
        this._lastOffset = 0;
        this._timer = new Timer();
        this._numSlides = 0;

        this._getSlides( el, ( slides ) => {
            this._slides = slides;
            this._numSlides = slides.length;
            this._canvas = this._createCanvas( Math.min( this._ww, this._maxWidth ), this._maxHeight );
            this._context = this._canvas.getContext( '2d' );
            this._addTouchListener( this._canvas );
            this._el.appendChild( this._canvas );
        });
    }

    _addTouchListener( canvas ) {
        this._hammer = new Hammer( canvas );
        this._hammer.on( 'pan', ( e ) => {
                this._lastOffset = e.deltaX;
                this._timer.start();
                this._timer.on( 'draw', this._panUpdate.bind( this ) );
        });

        this._hammer.on( 'panend', this._setDirection.bind( this ) );
    }

    _isPrevTerminal() {
        return this.currentSlide === 0;
    }

    _isNextTerminal() {
        return this.currentSlide === this._numSlides - 1;
    }

    _setDirection( e ) {
        if( e.offsetDirection === 2 ) {
            this._nextSlide( e );
        } else if ( e.offsetDirection === 4 ) {
            this._previousSlide( e );
        }
    }

    _nextSlide( e ) {
        if( Math.abs( e.deltaX ) > this._canvasWidth / 6  && !this._isNextTerminal() ) {
            const duration = 250;
            const transition = new Interpolation( e.deltaX, ( this._canvasWidth + this._margin ) * -1, duration, this._timer.time() );

            this._timer.on( 'draw', ( timestamp ) => {
                this._lastOffset = transition.play( timestamp );
            });

            transition.on( 'complete', () => {
                this._timer.stop();
                this.currentSlide++;
            });
        } else {
            const duration = 250;
            const transition = new Interpolation( e.deltaX, 0, duration, this._timer.time() );

            this._timer.on( 'draw', ( timestamp ) => {
                this._lastOffset = transition.play( timestamp );
            });

            transition.on( 'complete', () => {
                this._timer.stop();
            });
        }
    }


    _previousSlide( e ) {
        if( Math.abs( e.deltaX ) > this._canvasWidth / 6  && !this._isPrevTerminal() ) {
            const duration = 250;
            const transition = new Interpolation( e.deltaX, this._canvasWidth + this._margin, duration, this._timer.time() );

            this._timer.on( 'draw', ( timestamp ) => {
                this._lastOffset = transition.play( timestamp );
            });

            transition.on( 'complete', () => {
                this._timer.stop();
                this.currentSlide--;
            });
        } else {
            const duration = 250;
            const transition = new Interpolation( e.deltaX, 0, duration, this._timer.time() );

            this._timer.on( 'draw', ( timestamp ) => {
                this._lastOffset = transition.play( timestamp );
            });

            transition.on( 'complete', () => {
                this._timer.stop();
            });
        }
    }

    _scaleImageDimensions( imgWidth, imgHeight, width ) {
        const multiplier = Math.min( width, this._maxWidth );
        return {
            width: multiplier,
            height: imgWidth >= imgHeight ? ( ( imgHeight / imgWidth ) * multiplier ) : ( ( imgWidth / imgHeight ) * multiplier )
        };
    }

    _getSlides( gallery, cb ) {
        let promises = [];
        const slides = Array.from( gallery.querySelectorAll( '.gallery__item' ) );

        slides.forEach( ( slide ) => {
            const src = slide.src;
            const img = document.createElement( 'img' );
            let width, height;

            const promise = new Promise( ( resolve, reject ) => {
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;
                    const dimensions = this._scaleImageDimensions( width, height, this._ww );

                    this._maxHeight = dimensions.height > this._maxHeight ? dimensions.height : this._maxHeight;

                    resolve({
                        img: img,
                        width: dimensions.width,
                        height: dimensions.height
                    });
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

    _panUpdate() {
        // console.log( this._lastOffset );
        const multiplier = this._amt / ( this._canvasWidth );
        const previous = this._slides[this.currentSlide - 1];
        const current = this._slides[this.currentSlide];
        const next = this._slides[this.currentSlide + 1];

        this._context.clearRect( 0, 0, this._canvasWidth, this._canvasHeight );
        const imgOffset = Math.min( Math.abs( this._lastOffset * multiplier ), this._amt );


        // Draw Previous:
        if( previous ) {
            const x = ( previous.img.width - this._lastOffset + ( this._amt * 2 ) + ( this._margin * 2 ) ) * -1;

            this._context.drawImage( previous.img, imgOffset, 0, previous.img.width - this._amt, previous.img.height, x, 0, this._canvasWidth, this._canvasHeight );
        }

        // Draw Current:
        this._context.drawImage( current.img, this._amt - imgOffset, 0, current.img.width - this._amt, current.img.height, this._lastOffset, 0, this._canvasWidth, this._canvasHeight );

        // Draw Next:
        if( next ) {
            this._context.drawImage( next.img, imgOffset, 0, next.img.width - this._amt, next.img.height, this._canvasWidth + ( this._lastOffset + this._margin ), 0, this._canvasWidth, this._canvasHeight );
        }
    }

    _createCanvas( width, height ) {
        const canvas = document.createElement( 'canvas' );
        const context = canvas.getContext( '2d' );
        const slide = this._slides[this.currentSlide];
        const dimensions = this._scaleImageDimensions( slide.width, slide.height, width );
        canvas.width = width;
        canvas.height = height;
        context.drawImage( slide.img, this._amt, 0, slide.img.width - this._amt, slide.img.height, 0, 0, dimensions.width, dimensions.height );
        canvas.classList.add( 'gallery__canvas' );
        this._canvasWidth = width;
        this._canvasHeight = height;
        return canvas;
    }
};

export default Gallery;
