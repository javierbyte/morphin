function readImageAsBase64(url, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    let canvas = document.createElement('CANVAS');
    const ctx = canvas.getContext('2d');
    canvas.height = this.height;
    canvas.width = this.width;
    ctx.drawImage(this, 0, 0);
    const dataURL = canvas.toDataURL();
    callback(dataURL);
    canvas = null;
  };
  img.src = url;
}

export default readImageAsBase64;
