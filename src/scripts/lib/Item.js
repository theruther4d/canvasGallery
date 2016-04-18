import Emitter from './Emitter';

/** Item class */
class Item extends Emitter {

    /**
     * Constructor. See _getProps for parameters.
     */
    constructor( ...props ) {
        super();
        this._getProps( ...props );
        this._boundOnDraw = this._onDraw.bind( this );
        this.on( 'draw', this._boundOnDraw );
    }


    /**
     * Callback executed when 'draw' event is triggered.
     * @param { number } pos
     */
    _onDraw( pos ) {
        const sx = 0;
        const sy = 0;
        const sWidth = this.width;
        const sHeight = this.height;
        const dx = this.leftOffset - pos + this.xOffset;
        const dy = 0 + this.yOffset;
        const dWidth = this.slideWidth;
        const dHeight = this.slideHeight;

        this._parallax( dx );
        this.output.drawImage( this.canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight );
    }


    /**
     * Handles parallax effect.
     * @param { number } dx - the difference between the current position and the Item center.
     */
    _parallax( dx ) {
        const multiplier = Math.round( ( dx - this.xOffset ) * -1 * this.parallaxAmount );
        this.ctx.clearRect( 0, 0, this.width, this.height );
        this.ctx.drawImage( this.img, multiplier, 0, this.width, this.height );
    }


    /**
     * Extracts parameters needed for setup.
     * @param { DOM node } output - the <canvas> to draw to _onDraw.
     * @param { DOM node } img - the <img> element that this slide is based on.
     * @param { number } idx - the index of this slide in relation to its' siblings.
     * @param { number } parentWidth - the width of the parent Gallery
     * @param { number } parentHeight - the height of the parent Gallery.
     * @param { number } margin - the amount of margin between each slide.
     * @param { number } slideWidth - the scaled width of the slide.
     * @param { number } slideHeight - the scaled height of the slide.
     * @param { number } parallaxAmount - a number between 0 and 1 representing the amount of left/right parallax to be applied to the slide as it's moved across the canvas.
     */
    _getProps( output, img, idx = 0, parentWidth = 400, parentHeight = 400, margin = 40, slideWidth, slideHeight, parallaxAmount ) {
        this.idx = idx;
        this.margin = margin;
        this.parallaxAmount = parallaxAmount;
        this.refresh( slideWidth, slideHeight, parentWidth, parentHeight );

        this.output = output;
        this.img = img;
        this.width = this.img.width;
        this.height = this.img.height;
        this.canvas = document.createElement( 'canvas' );
        this.ctx = this.canvas.getContext( '2d' );
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.drawImage( this.img, 0, 0, this.width, this.height );
    }


    /**
     * Calculates positioning and offsets.
     * @param { number } slideWidth - the scaled width of the slide.
     * @param { number } slideHeight - the scaled height of the slide.
     * @param { number } parentWidth - the width of the parent Gallery
     * @param { number } parentHeight - the height of the parent Gallery.
     */
    refresh( slideWidth, slideHeight, parentWidth, parentHeight ) {
        this.slideWidth = slideWidth;
        this.slideHeight = slideHeight;
        this.parentWidth = parentWidth;
        this.parentHeight = parentHeight;
        this.xOffset = ( parentWidth - slideWidth ) / 2;
        this.yOffset = ( parentHeight - slideHeight ) / 2;
        this.leftBound = ( ( this.idx - 1 ) * this.parentWidth ) + ( this.idx * this.margin );
        this.rightBound = ( ( this.idx + 1 ) * this.parentWidth ) + ( this.idx * this.margin );
        this.leftOffset = ( this.idx * this.parentWidth ) + ( this.idx * this.margin );
    }

    _destroy() {
        this._boundOnDraw = null;
        this._events = null;
        this.canvas = null;
        this.ctx = null;
        this.height = null;
        this.idx = null;
        this.img = null;
        this.leftBound = null;
        this.leftOffset = null;
        this.margin = null;
        this.output = null;
        this.parentHeight = null;
        this.parentWidth = null;
        this.rightBound = null;
        this.leftBound = null;
        this.leftOffset = null;
        this.slideHeight = null;
        this.slideWidth = null;
        this.width = null;
        this.parallaxAmount = null;
    }
};

export default Item;
