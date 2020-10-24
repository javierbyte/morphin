// import tinycolor from "tinycolor2";

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function compressColorRGB(rgbObj) {
  const rgb = `rgb(${rgbObj.r},${rgbObj.g},${rgbObj.b},${Math.ceil((rgbObj.a / 255) * 10) / 10})`;

  if (rgbObj.a < 240) return rgb;

  // const hex = tinycolor(rgb).toHexString();

  const hex = rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);

  switch (
    hex // based on CSS3 supported color names http://www.w3.org/TR/css3-color/
  ) {
    case "#c0c0c0":
      return "silver";
    case "#808080":
      return "gray";
    case "#800000":
      return "maroon";
    case "#ff0000":
      return "red";
    case "#800080":
      return "purple";
    case "#008000":
      return "green";
    case "#808000":
      return "olive";
    case "#000080":
      return "navy";
    case "#008080":
      return "teal";
  }
  return hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6] ? "#" + hex[1] + hex[3] + hex[5] : hex;
}

export default compressColorRGB;
