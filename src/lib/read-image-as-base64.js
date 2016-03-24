function readImageAsBase64(url, callback){
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function(){
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    canvas.height = this.height;
    canvas.width = this.width;
    ctx.drawImage(this,0,0);
    var dataURL = canvas.toDataURL();
    callback(dataURL);
    canvas = null;
  };
  img.src = url;
}

module.exports = readImageAsBase64;
