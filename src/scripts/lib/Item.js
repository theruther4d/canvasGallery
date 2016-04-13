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
        const multiplier = Math.round( ( dx - this.xOffset ) * -0.25 );
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
     */
    _getProps( output, img, idx = 0, parentWidth = 400, parentHeight = 400, margin = 40, slideWidth, slideHeight ) {
        this.slideWidth = slideWidth;
        this.slideHeight = slideHeight;
        this.xOffset = ( parentWidth - slideWidth ) / 2;
        this.yOffset = ( parentHeight - slideHeight ) / 2;
        this.output = output;
        this.img = img;
        this.idx = idx;
        this.parentWidth = parentWidth;
        this.parentHeight = parentHeight;
        this.width = this.img.width;
        this.height = this.img.height;
        this.canvas = document.createElement( 'canvas' );
        this.ctx = this.canvas.getContext( '2d' );
        this.leftBound = ( ( this.idx - 1 ) * this.parentWidth ) + ( this.idx * margin );
        this.rightBound = ( ( this.idx + 1 ) * this.parentWidth ) + ( this.idx * margin );
        this.leftOffset = ( this.idx * this.parentWidth ) + ( this.idx * margin );
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.drawImage( this.img, 0, 0, this.width, this.height );
    }
};

export default Item;
