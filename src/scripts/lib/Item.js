import Emitter from './Emitter';

class Item extends Emitter {
    constructor( ...props ) {
        super();
        this._getProps( ...props );
        this._boundOnDraw = this._onDraw.bind( this );
        this.on( 'draw', this._boundOnDraw );
    }

    _onDraw( pos ) {
        const sx = 0;
        const sy = 0;
        const sWidth = this.width;
        const sHeight = this.height;
        const dx = this.leftOffset - pos;
        const dy = 0;
        const dWidth = this.parentWidth;
        const dHeight = this.parentHeight;

        this._parallax( dx );
        this.output.drawImage( this.canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight );
    }

    _parallax( dx ) {
        const multiplier = Math.round( dx * -0.25 );
        this.ctx.clearRect( 0, 0, this.width, this.height );
        this.ctx.drawImage( this.img, multiplier, 0, this.width, this.height );
    }

    _getProps( output, img, idx = 0, parentWidth = 400, parentHeight = 400, margin = 40 ) {
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
