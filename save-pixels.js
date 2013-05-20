"use strict"

var ndarray = require("ndarray")
var PNG = require("pngjs").PNG
var through = require("through")

function handlePNG(array) {
  var png = new PNG({
    width: array.shape[1],
    height: array.shape[0]
  })
  var i, j, ptr = 0, c
  if(array.shape.length === 3) {
    if(array.shape[2] === 3) {
      for(i=0; i<array.shape[0]; ++i) {
        for(j=0; j<array.shape[1]; ++j) {
          png.data[ptr++] = array.get(i,j,0)
          png.data[ptr++] = array.get(i,j,1)
          png.data[ptr++] = array.get(i,j,2)
          png.data[ptr++] = 255
        }
      }
    } else if(array.shape[2] === 4) {
      for(i=0; i<array.shape[0]; ++i) {
        for(j=0; j<array.shape[1]; ++j) {
          png.data[ptr++] = array.get(i,j,0)
          png.data[ptr++] = array.get(i,j,1)
          png.data[ptr++] = array.get(i,j,2)
          png.data[ptr++] = array.get(i,j,3)
        }
      }
    } else if(array.shape[3] === 1) {
      for(i=0; i<array.shape[0]; ++i) {
        for(j=0; j<array.shape[1]; ++j) {
          var c = array.get(i,j,0)
          png.data[ptr++] = c
          png.data[ptr++] = c
          png.data[ptr++] = c
          png.data[ptr++] = 255
        }
      }
    } else {
      var result = through()
      result.emit("error", new Error("Incomptabile array shape"))
      return result
    }
  } else if(array.shape.length === 2) {
    for(j=0; j<array.shape[1]; ++j) {
      for(i=0; i<array.shape[0]; ++i) {
        var c = array.get(i,j,0)
        png.data[ptr++] = c
        png.data[ptr++] = c
        png.data[ptr++] = c
        png.data[ptr++] = 255
      }
    }
  } else {
    var result = through()
    result.emit("error", new Error("Incomptabile array shape"))
    return result
  }
  return png.pack()
}

module.exports = function savePixels(array, type) {
  switch(type.toUpperCase()) {
    case "PNG":
    case ".PNG":
      return handlePNG(array)
    
    default:
      var result = through()
      result.emit("error", new Error("Unsupported file type: " + type))
      return result
  }
}
