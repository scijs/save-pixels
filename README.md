save-pixels
===========
Saves an ndarray to an image.

Example
=======
```javascript
var ndarray = require("ndarray")
var savePixels = require("save-pixels")

//Create an image
var x = ndarray.zeros([32, 32], "uint8")
x.set(16, 16, 255)

//Save to a file
savePixels(x, "png").pipe(process.stdout)
```

This writes the following image to stdout:



Install
=======

    npm install save-pixels
    
### `require("save-pixels")(array, type)`
Saves an ndarray as an image with the given format

* `array` is an `ndarray` of pixels
* `type` is the type of the image to save.  Currently supported formats:

  + `"png"` - Portable Network Graphics format


**Returns** A stream that you can pipe to serialize the result.

# Credits
(c) 2013 Mikola Lysenko. MIT License