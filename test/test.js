"use strict"

var zeros = require("ndarray-scratch").zeros
var ndarray = require("ndarray")
var savePixels = require("../save-pixels.js")
var getPixels = require("get-pixels")
var fs = require("fs")
var tap = require("tape")

function writePixels(t, array, format, cb) {
  var out = fs.createWriteStream("temp." + format)
  var pxstream = savePixels(array, format)
  pxstream.pipe(out)
  .on("error", cb)
  .on("close", cb)
}

function compareImages(t, array, format, cb) {
  writePixels(t, array, format, function(err) {
    if (err) {
      t.assert(false, err)
      cb()
      return
    }

    getPixels("temp." + format, function(err, actualPixels) {
      if(err) {
        t.assert(false, err)
        cb()
        return
      }

      getPixels("expected." + format, function(err, expectedPixels) {
        if(err) {
          t.assert(false, err)
          cb()
          return
        }

        t.deepEqual(actualPixels, expectedPixels)
        if (!process.env.TEST_DEBUG) {
          fs.unlinkSync("temp." + format)
        }
        cb()
      })
    })
  })
}

function testArray(t, array, format, cb) {
  writePixels(t, array, format, function(err) {
    if (err) {
      t.assert(false, err)
      cb()
      return
    }

    process.nextTick(function() {
      getPixels("temp." + format, function(err, data) {
        if(err) {
          t.assert(false, err)
          cb()
          return
        }
        
        var arrayWidth = array.shape.length <= 3 ? array.shape[0] : array.shape[1]
        var arrayHeight = array.shape.length <= 3 ? array.shape[1] : array.shape[2]
        var dataWidth = data.shape.length <= 3 ? data.shape[0] : data.shape[1]
        var dataHeight = data.shape.length <= 3 ? data.shape[1] : data.shape[2]
        t.equals(arrayWidth, dataWidth)
        t.equals(arrayHeight, dataHeight)
        
        if(array.shape.length === 2) {
          for(var i=0; i<array.shape[0]; ++i) {
            for(var j=0; j<array.shape[1]; ++j) {
              if(data.shape.length === 3) {
                t.equals(array.get(i,j), data.get(i,j,0))
              } else {
                t.equals(array.get(i,j), data.get(i,j))
              }
            }
          }
        } else if(array.shape.length === 3) {
          for(var i=0; i<array.shape[0]; ++i) {
            for(var j=0; j<array.shape[1]; ++j) {
              for(var k=0; k<array.shape[2]; ++k) {
                if(data.shape.length === 3) {
                  t.equals(array.get(i,j,k), data.get(i,j,k))
                } else {
                  t.equals(array.get(i,j,k), data.get(0,i,j,k))
                }
              }
            }
          }
        } else {
          for(var i=0; i<array.shape[0]; ++i) {
            for(var j=0; j<array.shape[1]; ++j) {
              for(var k=0; k<array.shape[2]; ++k) {
                for(var l=0; l<array.shape[3]; ++l) {
                  t.equals(array.get(i,j,k,l), data.get(i,j,k,l))
                }
              }
            }
          }
        }
        if (!process.env.TEST_DEBUG) {
          fs.unlinkSync("temp." + format)
        }
        cb()
      })
    })
  })
}


tap("save-pixels saving a monoscale png", function(t) {
  var x = zeros([64, 64])
  
  for(var i=0; i<64; ++i) {
    for(var j=0; j<64; ++j) {
      x.set(i, j, i+2*j)
    }
  }
  testArray(t, x, "png", function() {
    t.end()
  })
})

tap("save-pixels saving a RGB png", function(t) {
  var x = zeros([64, 64, 3])
  
  for(var i=0; i<64; ++i) {
    for(var j=0; j<64; ++j) {
      x.set(i, j, 0, i)
      x.set(i, j, 1, j)
      x.set(i, j, 2, i+2*j)
    }
  }
  testArray(t, x, "png", function() {
    t.end()
  })
})

tap("save-pixels saving a RGB jpeg", function(t) {
  var x = zeros([64, 64, 3])
  
  for(var i=0; i<64; ++i) {
    for(var j=0; j<64; ++j) {
      x.set(i, j, 0, i)
      x.set(i, j, 0, j)
      x.set(i, j, 0, i+2*j)
    }
  }
  compareImages(t, x, "jpeg", function() {
    t.end()
  })
})

tap("save-pixels saving an unanimated gif", function(t) {
  var x = zeros([64, 64, 4])
  
  for(var i=0; i<32; ++i) {
    for(var j=0; j<32; ++j) {
      x.set(i, j, 0, 0)
      x.set(i, j, 1, 0)
      x.set(i, j, 2, 0)
      x.set(i, j, 3, 255)
      x.set(i+32, j, 0, 255)
      x.set(i+32, j, 1, 255)
      x.set(i+32, j, 2, 255)
      x.set(i+32, j, 3, 255)
      x.set(i, j+32, 0, 255)
      x.set(i, j+32, 1, 255)
      x.set(i, j+32, 2, 255)
      x.set(i, j+32, 3, 255)
      x.set(i+32, j+32, 0, 0)
      x.set(i+32, j+32, 1, 0)
      x.set(i+32, j+32, 2, 0)
      x.set(i+32, j+32, 3, 255)
    }
  }
  testArray(t, x, "gif", function() {
    t.end()
  })
})

tap("save-pixels saving an animated gif", function(t) {
  var x = zeros([2, 64, 64, 4])
  
  for(var i=0; i<32; ++i) {
    for(var j=0; j<32; ++j) {
      x.set(0, i, j, 0, 0)
      x.set(0, i, j, 1, 0)
      x.set(0, i, j, 2, 0)
      x.set(0, i, j, 3, 255)
      x.set(0, i+32, j, 0, 255)
      x.set(0, i+32, j, 1, 255)
      x.set(0, i+32, j, 2, 255)
      x.set(0, i+32, j, 3, 255)
      x.set(0, i, j+32, 0, 255)
      x.set(0, i, j+32, 1, 255)
      x.set(0, i, j+32, 2, 255)
      x.set(0, i, j+32, 3, 255)
      x.set(0, i+32, j+32, 0, 0)
      x.set(0, i+32, j+32, 1, 0)
      x.set(0, i+32, j+32, 2, 0)
      x.set(0, i+32, j+32, 3, 255)
      
      x.set(1, i, j, 0, 255)
      x.set(1, i, j, 1, 255)
      x.set(1, i, j, 2, 255)
      x.set(1, i, j, 3, 255)
      x.set(1, i+32, j, 0, 0)
      x.set(1, i+32, j, 1, 0)
      x.set(1, i+32, j, 2, 0)
      x.set(1, i+32, j, 3, 255)
      x.set(1, i, j+32, 0, 0)
      x.set(1, i, j+32, 1, 0)
      x.set(1, i, j+32, 2, 0)
      x.set(1, i, j+32, 3, 255)
      x.set(1, i+32, j+32, 0, 255)
      x.set(1, i+32, j+32, 1, 255)
      x.set(1, i+32, j+32, 2, 255)
      x.set(1, i+32, j+32, 3, 255)
    }
  }
  testArray(t, x, "gif", function() {
    t.end()
  })
})
