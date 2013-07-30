"use strict"

var PNG = require("pngjs").PNG
var through = require("through")

function handleData(array, data) {
  var i, j, ptr = 0, c
  if(array.shape.length === 3) {
    if(array.shape[2] === 3) {
      for(i=0; i<array.shape[0]; ++i) {
        for(j=0; j<array.shape[1]; ++j) {
          data[ptr++] = array.get(i,j,0)>>>0
          data[ptr++] = array.get(i,j,1)>>>0
          data[ptr++] = array.get(i,j,2)>>>0
          data[ptr++] = 255
        }
      }
    } else if(array.shape[2] === 4) {
      for(i=0; i<array.shape[0]; ++i) {
        for(j=0; j<array.shape[1]; ++j) {
          data[ptr++] = array.get(i,j,0)>>>0
          data[ptr++] = array.get(i,j,1)>>>0
          data[ptr++] = array.get(i,j,2)>>>0
          data[ptr++] = array.get(i,j,3)>>>0
        }
      }
    } else if(array.shape[3] === 1) {
      for(i=0; i<array.shape[0]; ++i) {
        for(j=0; j<array.shape[1]; ++j) {
          var c = array.get(i,j,0)>>>0
          data[ptr++] = c
          data[ptr++] = c
          data[ptr++] = c
          data[ptr++] = 255
        }
      }
    } else {
      return new Error("Incompatible array shape")
    }
  } else if(array.shape.length === 2) {
    for(i=0; i<array.shape[0]; ++i) {
      for(j=0; j<array.shape[1]; ++j) {
        var c = array.get(i,j,0)>>>0
        data[ptr++] = c
        data[ptr++] = c
        data[ptr++] = c
        data[ptr++] = 255
      }
    }
  } else {
    return new Error("Incompatible array shape")
  }
  return data
}

function haderror(err) {
  var result = through()
  result.emit("error", err)
  return result
}

module.exports = function savePixels(array, type) {
  switch(type.toUpperCase()) {
    case "PNG":
    case ".PNG":
      var png = new PNG({
        width: array.shape[1],
        height: array.shape[0]
      })
      var data = handleData(array, png.data)
      if (typeof data === "Error") return haderror(data)
      png.data = data
      return png.pack()

    case "CANVAS":
      var canvas = document.createElement("canvas")
      var context = canvas.getContext("2d")
      canvas.width = array.shape[1]
      canvas.height = array.shape[0]
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      var data = imageData.data
      data = handleData(array, data)
      if (typeof data === "Error") return haderror(data)
      context.putImageData(imageData, 0, 0)
      return canvas
    
    default:
      return haderror(new Error("Unsupported file type: " + type))
  }
}
