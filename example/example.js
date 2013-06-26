var ndarray = require("ndarray")
var savePixels = require("../save-pixels.js")

//Create an image
var x = ndarray(new Uint8Array(32*32), [32, 32])
x.set(16, 16, 255)

//Save to a file
savePixels(x.pick(-1, -1, 0), "png").pipe(process.stdout)