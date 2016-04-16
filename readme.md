# :milky_way: Canvas Gallery
A gallery module inspired by iOS photos app's subtle parallax effect. See a demo on [codepen](http://codepen.io/the_ruther4d/full/JXLyrG/).

!['Canvas Gallery Demo'](https://github.com/theruther4d/canvasGallery/blob/master/cg.gif?raw=true)

```javascript
myGallery = new Gallery({
    el: document.getElementById( 'gallery' ),
    maxHight: 600,
});
```

## Options
* `el { DOM node }` - The element to extract slides from.
* `maxWidth { number }` - The maximum width of the gallery.
* `maxHeight { number }` - The maxiumum height of the gallery.
* `fluid { boolean = true }` - Whether or not to scale the gallery to the window width.

## API
* `on( eventName, callback) { function }` - Attaches a callback to an event. The callback is passed an `event` object containing the following properties:
    * `numSlides { number }` - The number of slides in the gallery.
    * `currentSlide { number }` - The zero-based index of the currently selected slide.
    * Events:
        * `ready` - When the gallery has been instantiated and all public properties are available. Useful for doing things like setting up pagination. Ex:
        ```javascript
        myGallery.on( 'ready', function( e ) {
            // Do stuff with the event here
        })
        ```
        * `update` - When the current slide has changed. Useful for doing things like updating pagination. Ex:
        ```javascript
        myGallery.on( 'update', function( e ) {
            // Do stuff with the event here
        });
        ```
* `goTo( slideNumber [, duration = 250] ) { function }` - Advances the gallery to the specified slide, **if** possible.
    * `slideNumber { number }` - The zero-based index of the slide to move to.
    * `duration { number = 250 }` - Optional transition duration when moving to the specified slide.pre
* `currentSlide { property }` - The zero-based index of the current slide.
