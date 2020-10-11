import tinycolor from "tinycolor2";

function compressColor(rgb) {
  const hex = tinycolor(rgb).toHexString();

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

export default compressColor;
