var React = require('react');
var tinycolor = require('tinycolor2');

var _ = require('lodash')
var Dropzone = require('react-dropzone')

var compressColor = require('./lib/compress-color.js');

var {base64ImageToRGBArray} = require('base64-image-utils')

function rgbToString(rgb) {
  return rgb.a > 0 ? `rgb(${rgb.r},${rgb.g},${rgb.b})` : 'rgb(255,255,255)'
}

function rgbArrayToShadow(rgbArray, scale) {
  return _.chain(rgbArray).sortBy('rgb', (rgb) => {
    return tinycolor(rgbToString(rgb)).toHsv().h
  }).map(pixel => {
    var color = compressColor(rgbToString(pixel.rgb))

    if (pixel.rgb.a === 0 || pixel.rgb.r === 255 && pixel.rgb.g === 255 && pixel.rgb.b === 255) {
      return null
    }

    return `${color} ${pixel.x ? pixel.x * scale + 'px' : 0} ${pixel.y ? pixel.y * scale + 'px' : 0}`
  }).compact().value().join(',')
}

export const App = React.createClass({

  getInitialState () {
    return {
      images: [{
        loadingImage: false
      }, {
        loadingImage: false
      }],
      activeImage: 0,
      scale: 5
    }
  },

  componentDidMount() {
    window.setInterval(() => {
      this.setState({
        activeImage: this.state.activeImage === 0 ? 1 : 0
      })
    }, 1000)
  },

  onDrop (imageIndex, files) {
    var file = files[0]
    this.readFile(imageIndex, file)
  },

  readFile(imageIndex, file) {
    var fr = new window.FileReader()

    this.state.images[imageIndex].loadingImage = true;
    this.forceUpdate()

    fr.onload = (data) => {
      const base64 = data.currentTarget.result

      if (base64.length > 100000) {
        let confirmation = confirm('Your image is really big, do you really want to try to convert it?')

        if(!confirmation) {
          this.state.images[imageIndex].loadingImage = false
          this.forceUpdate()
          return
        }
      }

      base64ImageToRGBArray(base64, (err, rgbArray) => {
        if (err) return console.error(err)

        this.state.images[imageIndex] = {
          base64: base64,
          shadow: rgbArrayToShadow(rgbArray, this.state.scale),
          height: _.reduce(rgbArray, (res, pixel) => {return Math.max(res, pixel.y)}, 0),
          loadingImage: false
        }
        this.forceUpdate()
      })
    }
    fr.readAsDataURL(file)
  },

  render () {
    var {images, activeImage, scale} = this.state
    var ready = images[0].shadow && images[1].shadow;

    return (
      <div className='padding-horizontal-2x'>
        <div className='dropZone-container'>
          <Dropzone onDrop={this.onDrop.bind(null, 0)} className='dropZone'>
            {images[0].base64 && <img src={images[0].base64} />}
            {images[0].loadingImage ? 'Processing...' : 'Drop the first image here.'}
          </Dropzone>

          <Dropzone onDrop={this.onDrop.bind(null, 1)} className='dropZone'>
            {images[1].base64 && <img src={images[1].base64} />}
            {images[1].loadingImage ? 'Processing...' : 'Drop the second image here.'}
          </Dropzone>
        </div>

        {ready ? 'Result!' : 'Add two images to start animating!'}

        {ready && (
          <div className='pixel' style={{
            height: scale,
            width: scale,
            boxShadow: images[activeImage].shadow,
            marginBottom: Math.max(images[0].height, images[1].height) * scale
          }} />
        )}

      </div>
    )
  }
})
