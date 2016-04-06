import Gallery from './lib/Gallery';

window.Gallery = Gallery;

//
// ..got a touchmove event:
//      this._lastOffset = e.offsetX;
//      timer.on( 'draw', () => {
//          // draw gallery using this._lastOffset global
//      })
//
// ..animating the snap on panend:
//      timer.on( 'draw', () => {
//          // draw to gallery using calculated position
//      })
//
// send draw function as `once` ==> called once then destroyed
//
//
// OR
//
// requestAnimationFrame is always running, add checks to see if params have changed to draw to <canvas>
// use getters/setters on needed properties (offsetX) to know when the value has changed
//
//
//
// timer.on( 'draw', () => {
//      const newPosition = this._newPositionX();
//      if( newPosition !== false ) {
//          this._draw( newPosition );
//       }
// })
