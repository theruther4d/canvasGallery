import Hammer from 'hammerjs';

class Gallery {
    constructor( el ) {
        this._el = el;
        this._margin = 40;
        this._amt = 30;
        this._maxWidth = 960;
        this._maxHeight = 0;
        this._ww = window.outerWidth || window.innerWidth;   // @TODO: add window resize listener
        this.currentSlide = 0;
        this._lastOffset = 0;
        this._ticking = false;
        console.log( `ww: ${this._ww}` );
        console.log( `window.innerWidth: ${window.innerWidth}` );

        this._getSlides( el, ( slides ) => {
            console.log( 'got slides' );
            this._slides = slides;
            this._canvas = this._createCanvas( Math.min( this._ww, this._maxWidth ), this._maxHeight );
            this._context = this._canvas.getContext( '2d' );
            this._addTouchListener( this._canvas );
            this._el.appendChild( this._canvas );
        });
    }

    _transition( start, end, duration, callback ) {
        console.log( `from: ${start} to ${end}` );

        // forwards
        if( start <= end ) {
            // const delay = Math.abs( end - start ) / duration;
            // let timer;
            // console.log( '= = = = = = = = = = = =' );
            // console.log( `delay: ${delay}` );
            // console.log( '= = = = = = = = = = = =' );
            //
            // // Maybe use setInterval instead
            // // of timeout + loop ???
            // while( start < end ) {
            //     let interpolated = start;
            //     let timer = setTimeout( () => {
            //         callback( interpolated )
            //     }, delay );
            //
            //     start++;
            // }
        }

        // backwards
        else {
            const delay = duration / Math.abs( start - end );
            const boundOnPan = this._onPan.bind( this );
            const timer = setInterval( () => {
                if( start <= end ) {
                    console.log( 'clearing!!!' );
                    clearInterval( timer );
                }
                boundOnPan( start );

                start--;
            }, delay );
        }
    }

    _addTouchListener( canvas ) {
        this._hammer = new Hammer( canvas );
        this._hammer.on( 'pan', ( e ) => {
            if( e.additionalEvent === 'panleft') {
                this._onPan( e.deltaX );
            }
        });

        this._hammer.on( 'panend', ( e ) => {
            if( Math.abs( e.deltaX ) > this._canvasWidth / 2 ) {
                this._transition( e.deltaX, ( this._canvasWidth + this._margin ) * -1, 250, this._onPan.bind( this ) );
                // this.currentSlide++;
            } else {
                // transition all the way to the right
            }
        });
    }

    _onPan( offset ) {
        // console.log( `onPan: ${offset}` );
        this._lastOffset = offset;
        this._requestTick();
    }

    _requestTick() {
        if( !this.ticking ) {
            // console.log( '- - - requesting animation frame - - -' );
            requestAnimationFrame( this._panUpdate.bind( this ) );
        }

        this._ticking = true;
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
                    console.log( 'image loaded' );
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
                    console.log( 'rejected!' );
                    reject( 'image could not load' );
                }
            });

            promises.push( promise );
            img.src = src;
        });

        return Promise.all( promises ).then( cb );
    }

    _panUpdate( ) {
        this._ticking = false;
        // console.log( `update: ${this._lastOffset}` );

        const multiplier = this._amt / ( this._canvasWidth /*/ 2*/ );
        const current = this._slides[this.currentSlide];
        const next = this._slides[this.currentSlide + 1];

        this._context.clearRect( 0, 0, this._canvasWidth, this._canvasHeight );
        const imgOffset = Math.min( Math.abs( this._lastOffset * multiplier ), this._amt );

        // this._context.drawImage( current.img, imgOffset, 0, current.img.width - this._amt, current.img.height, this._lastOffset, 0, this._canvasWidth, this._canvasHeight );
        this._context.drawImage( current.img, this._amt - imgOffset, 0, current.img.width - this._amt, current.img.height, this._lastOffset, 0, this._canvasWidth, this._canvasHeight );

        // this._context.drawImage( next.img, 0, 0, next.img.width, next.img.height, this._canvasWidth + ( this._lastOffset + this._margin ), 0, this._canvasWidth, this._canvasHeight );
        this._context.drawImage( next.img, imgOffset, 0, next.img.width - this._amt, next.img.height, this._canvasWidth + ( this._lastOffset + this._margin ), 0, this._canvasWidth, this._canvasHeight );
    }

    _createCanvas( width, height ) {
        const canvas = document.createElement( 'canvas' );
        const context = canvas.getContext( '2d' );
        const slide = this._slides[this.currentSlide];
        const dimensions = this._scaleImageDimensions( slide.width, slide.height, width );

        canvas.width = width;
        canvas.height = height;
        context.drawImage( slide.img, this._amt, 0, slide.img.width - this._amt, slide.img.height, 0, 0, dimensions.width, dimensions.height );
        // context.drawImage( slide.img, 0, 0, slide.img.width - this._amt, slide.img.height, 0, 0, dimensions.width, dimensions.height );
        canvas.classList.add( 'gallery__canvas' );
        this._canvasWidth = width;
        this._canvasHeight = height;
        return canvas;
    }
};

export default Gallery;
