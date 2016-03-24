var React = require('react')

var _ = require('lodash')
var Dropzone = require('react-dropzone')

var download = require('./lib/download.js')
var compressColor = require('./lib/compress-color.js')
var readImageAsBase64 = require('./lib/read-image-as-base64.js');

var defaultSprites = {
  charizard: {
    name: 'Charizard',
    sprites: ['char1.png', 'char2.png']
  },
  mario: {
    name: 'Mario',
    sprites: ['mario1.png', 'mario2.png']
  },
  pikachu: {
    name: 'Pikachu',
    sprites: ['pikachu.png', 'raichu.png']
  },
  yoshi: {
    name: 'Yoshi',
    sprites: ['yoshi1.png', 'yoshi2.png']
  },
  supermario: {
    name: 'Super Mario',
    sprites: ['supermario1.png', 'supermario2.png']
  }
}

var {base64ImageToRGBArray} = require('base64-image-utils')

function rgbToString(rgb) {
  return rgb.a > 0 ? `rgb(${rgb.r},${rgb.g},${rgb.b})` : 'rgb(255,255,255)'
}

function rgbArrayToShadow(rgbArray, scale, imageWidth, imageHeight) {
  var halfWidth = Math.floor(imageWidth / 2)
  var halfHeight = Math.floor(imageHeight / 2)

  return _.chain(rgbArray).filter(pixel => {
    return !(pixel.rgb.a < 128 || pixel.rgb.r === 255 && pixel.rgb.g === 255 && pixel.rgb.b === 255)
  }).map(pixel => {
    var color = compressColor(rgbToString(pixel.rgb))
    return `${color} ${(pixel.x - halfWidth) * scale + 'px'} ${(pixel.y - halfHeight) * scale + 'px'}`
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
      activeImageIndex: 0,
      scale: 6
    }
  },

  componentDidMount() {
    window.setInterval(() => {
      this.setState({
        activeImageIndex: this.state.activeImageIndex === 0 ? 1 : 0
      })
    }, 1000)

    this.readDefaultSprite('supermario')
  },

  readDefaultSprite(name) {
    _.forEach(defaultSprites[name].sprites, (sprite, spriteIndex) => {
      readImageAsBase64('sprites/' + sprite, (base64) => {
        this.loadBase64Sprite(spriteIndex, base64)
      })
    })
  },

  onDrop (imageIndex, files) {
    this.readFile(imageIndex, files[0])
  },

  readFile(imageIndex, file) {
    var fr = new window.FileReader()

    this.state.images[imageIndex].loadingImage = true;
    this.forceUpdate()

    fr.onload = (data) => {
      const base64 = data.currentTarget.result

      if (base64.length > 10000) {
        let confirmation = confirm('Your image is really big! Do you really want to TRY to animate it?')

        if(!confirmation) {
          this.state.images[imageIndex].loadingImage = false
          this.forceUpdate()
          return
        }
      }

      this.loadBase64Sprite(imageIndex, base64);
    }
    fr.readAsDataURL(file)
  },

  loadBase64Sprite(imageIndex, base64) {
    base64ImageToRGBArray(base64, (err, rgbArray) => {
      let imageHeight = _.reduce(rgbArray, (res, pixel) => {return Math.max(res, pixel.y)}, 0)
      let imageWidth = _.reduce(rgbArray, (res, pixel) => {return Math.max(res, pixel.x)}, 0)

      var activeImageCenter = _.find(rgbArray, {
        x: Math.floor(imageWidth / 2),
        y: Math.floor(imageHeight / 2)
      })
      var centerColor = activeImageCenter ? rgbToString(activeImageCenter.rgb) : '#fff'

      this.state.images[imageIndex] = {
        base64: base64,
        shadow: rgbArrayToShadow(rgbArray, this.state.scale, imageWidth, imageHeight),
        centerColor: centerColor,
        rgbArray: rgbArray,
        height: imageHeight,
        width: imageWidth,
        loadingImage: false
      }
      this.forceUpdate()
    })
  },

  onDownloadCode() {
    var {images, activeImageIndex, scale} = this.state

    var css = `
<style>
.animatedSprite {
  height: ${scale}px;
  width: ${scale}px;
  margin-bottom: ${Math.max(images[0].height, images[1].height) * scale / 2}px;
  margin-top: ${Math.max(images[0].height, images[1].height) * scale / 2}px;
  margin-right: ${Math.max(images[0].width, images[1].width) * scale / 2}px;
  margin-left: ${Math.max(images[0].width, images[1].width) * scale / 2}px;
  transition: box-shadow 0.3s, background-color 0.3s;
  box-shadow: ${images[0].shadow};
  background-color: ${images[0].centerColor}
}
.animatedSprite-alt {
  box-shadow: ${images[1].shadow};
  background-color: ${images[1].centerColor}
}
</style>

<div class="animatedSprite"></div>

<script>
  var sprite = document.querySelector(".animatedSprite");
  window.setInterval(function() {
    sprite.classList.toggle("animatedSprite-alt")
  }, 1000)
</script>
    `
    download(css, "css.txt", "text/css")
  },

  render () {
    var {images, activeImageIndex, scale} = this.state
    var ready = images[0].shadow && images[1].shadow

    var activeImage = images[activeImageIndex]

    return (
      <div className='padding-horizontal-2x'>
        <div className='dropZone-container'>
          <Dropzone onDrop={this.onDrop.bind(null, 0)} className='dropZone'>
            {images[0].base64 && <img src={images[0].base64} />}
            {images[0].loadingImage ? 'Processing...' : 'Click or drop a sprite here.'}
          </Dropzone>

          <Dropzone onDrop={this.onDrop.bind(null, 1)} className='dropZone'>
            {images[1].base64 && <img src={images[1].base64} />}
            {images[1].loadingImage ? 'Processing...' : 'Click or drop a sprite here.'}
          </Dropzone>
        </div>

        Or you can try with
        {_.map(defaultSprites, (sprite, spriteIndex) => {
            return (
              <a className='button' onClick={this.readDefaultSprite.bind(null, spriteIndex)} key={spriteIndex}>
                {sprite.name}
              </a>
            )
          })
        }

        <br /><br />
        <div>
          {ready ? 'Result!' : 'Add two images to start animating!'}
        </div>
        <br />

        {ready && (
          <div className='pixel' style={{
            height: scale,
            width: scale,
            boxShadow: activeImage.shadow,
            backgroundColor: activeImage.centerColor,
            marginBottom: Math.max(images[0].height, images[1].height) * scale / 2,
            marginTop: Math.max(images[0].height, images[1].height) * scale / 2,
            marginRight: Math.max(images[0].width, images[1].width) * scale / 2,
            marginLeft: Math.max(images[0].width, images[1].width) * scale / 2
          }} />
        )}

        {ready && (
          <div className='big-button-wrapper'>
            <a className="big-button" onClick={this.onDownloadCode}>Download your animation code!</a>
          </div>
        )}

      </div>
    )
  }
})
