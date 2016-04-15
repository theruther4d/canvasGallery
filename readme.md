# :milky_way: Canvas Gallery
A gallery module inspired by iOS photos app's subtle parallax effect. See a demo on [codepen](http://codepen.io/the_ruther4d/full/JXLyrG/).

```javascript
myGallery = new Gallery({
    el: document.getElementById( 'gallery' ),
    maxHight: 600px,
});
```

## Options
* `el { DOM node }` - The element to extract slides from.
* `maxWidth { number }` - The maximum width of the gallery.
* `maxHeight { number }` - The maxiumum height of the gallery.
* `fluid { boolean = true }` - Whether or not to scale the gallery to the window width.
