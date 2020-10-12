import React, { useEffect, useState } from "react";
import Styled from "styled-components";

import _ from "lodash";
import download from "./lib/download.js";
import compressColor from "./lib/compress-color.js";
import readImageAsBase64 from "./lib/read-image-as-base64.js";

import Char1 from "./sprites/char1.png";

import base64ImageUtils from "base64-image-utils";
const { base64ImageToRGBArray } = base64ImageUtils;

import { Button, HeaderH1, HeaderH2, HeaderH3, Text, Space, Box, A, Container, Dropzone, Inline } from "./jbx.jsx";

const Textarea = Styled.textarea({
  "font-family": "monaco, monospace",
  border: "none",
  width: "100%",
  height: "256px",
  "font-size": "13px",
  "line-height": "1.309",
  padding: "16px 18px",
  background: "#ecf0f1",
  color: "#34495e",
  ":focus": {
    outline: "none",
  },
});

const defaultSprites = {
  Yoshi: {
    name: "Yoshi",
    sprites: ["yoshi1.png", "yoshi2.png"],
  },
  Charizard: {
    name: "Charizard",
    sprites: ["char1.png", "char2.png"],
  },
  Mario: {
    name: "Mario",
    sprites: ["mario1.png", "mario2.png"],
  },
  Pikachu: {
    name: "Pikachu",
    sprites: ["pikachu.png", "raichu.png"],
  },
  Supermario: {
    name: "Super Mario",
    sprites: ["supermario1.png", "supermario2.png"],
  },
};

function resizeImage(base64Str, maxMass = 64 * 50) {
  return new Promise((resolve) => {
    let img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let canvas = document.createElement("canvas");

      const originalWidth = img.width;
      const originalHeight = img.height;

      let width = img.width;
      let height = img.height;

      while (width * height > maxMass) {
        width = width / Math.sqrt(2, 2);
        height = height / Math.sqrt(2, 2);
      }

      width = Math.round(width);
      height = Math.round(height);

      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve([canvas.toDataURL(), { originalWidth, originalHeight }]);
    };
  });
}

function rgbToString(rgb) {
  return rgb.a > 0 ? `rgb(${rgb.r},${rgb.g},${rgb.b})` : "rgb(255,255,255)";
}

function rgbArrayToShadow(rgbArray, scale, imageWidth, imageHeight) {
  var halfWidth = Math.floor(imageWidth / 2);
  var halfHeight = Math.floor(imageHeight / 2);

  return _.chain(rgbArray)
    .filter((pixel) => {
      return !(pixel.rgb.a < 128 || (pixel.rgb.r === 255 && pixel.rgb.g === 255 && pixel.rgb.b === 255));
    })
    .map((pixel) => {
      const color = compressColor(rgbToString(pixel.rgb));
      return `${color} ${pixel.x * scale + "px"} ${pixel.y * scale + "px"} 0 ${scale / 2 - 0.5}px`;
    })
    .compact()
    .value()
    .join(",");
}

const Tabs = Styled.div({
  borderBottom: "4px solid #000",
});

const Tab = Styled.div({
  userSelect: "none",
  padding: 8,
  cursor: "pointer",
  backgroundColor: (props) => (props.active ? "#000" : "#fff"),
  color: (props) => (props.active ? "#fff" : "#000"),
});

function saveFrame(path, { scale }, stateSet) {
  readImageAsBase64(path, (base64) => {
    base64ImageToRGBArray(base64, (err, rgbArray) => {
      const shadow = rgbArrayToShadow(rgbArray, scale, 64, 64);

      const maxY = rgbArray.reduce((res, rgb) => {
        return Math.max(res, rgb.y);
      }, -Infinity);
      const minY = rgbArray.reduce((res, rgb) => {
        return Math.min(res, rgb.y);
      }, Infinity);

      const maxX = rgbArray.reduce((res, rgb) => {
        return Math.max(res, rgb.x);
      }, -Infinity);
      const minX = rgbArray.reduce((res, rgb) => {
        return Math.min(res, rgb.x);
      }, Infinity);

      stateSet({
        src: base64,
        shadow,
        height: Math.abs(maxY - minY),
        width: Math.abs(maxX - minX),
      });
    });
  });
}

function saveFrame64(base64, { scale }, stateSet) {
  base64ImageToRGBArray(base64, (err, rgbArray) => {
    const shadow = rgbArrayToShadow(rgbArray, scale, 64, 64);

    const maxY = rgbArray.reduce((res, rgb) => {
      return Math.max(res, rgb.y);
    }, -Infinity);
    const minY = rgbArray.reduce((res, rgb) => {
      return Math.min(res, rgb.y);
    }, Infinity);

    const maxX = rgbArray.reduce((res, rgb) => {
      return Math.max(res, rgb.x);
    }, -Infinity);
    const minX = rgbArray.reduce((res, rgb) => {
      return Math.min(res, rgb.x);
    }, Infinity);

    stateSet({
      src: base64,
      shadow,
      height: Math.abs(maxY - minY),
      width: Math.abs(maxX - minX),
    });
  });
}

function App() {
  const [currentSprite, currentSpriteSet] = useState("Yoshi");

  const [scale, scaleSet] = useState(3);

  const [spriteA, spriteASet] = useState({
    shadow: null,
    height: 0,
    width: 0,
  });
  const [spriteB, spriteBSet] = useState({
    shadow: null,
    height: 0,
    width: 0,
  });

  useEffect(() => {
    if (!currentSprite) return;

    saveFrame(`sprites/${defaultSprites[currentSprite].sprites[0]}`, { scale }, spriteASet);
    saveFrame(`sprites/${defaultSprites[currentSprite].sprites[1]}`, { scale }, spriteBSet);
  }, [currentSprite]);

  const css = `
@keyframes morphin {
  0%, 45% {
    box-shadow: ${spriteA.shadow};
  }
  55%, 100% {
    box-shadow: ${spriteB.shadow};
  }
}

.pixel {
  height: 1px;
  width: 1px;
  margin: 0 ${Math.max(spriteA.width, spriteB.width) * scale}px ${Math.max(spriteA.height, spriteB.height) * scale}px 0;
  animation: morphin 5s infinite alternate;
}`.trim();

  function onFileSelected(event, setFunction) {
    currentSpriteSet(null);
    event.stopPropagation();
    event.preventDefault();

    const dt = event.dataTransfer;
    const files = dt ? dt.files : event.target.files;
    const file = files[0];

    const fr = new window.FileReader();

    fr.onload = async (data) => {
      const base64src = data.currentTarget.result;

      const [base64, info] = await resizeImage(base64src);

      saveFrame64(base64, { scale }, setFunction);
    };
    fr.readAsDataURL(file);
  }

  function eventIgnore(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  return (
    <Container>
      <Box padding={2}>
        <Space h={1} />
        <Box padding={0.25} style={{ display: "inline-block", backgroundColor: "var(--accent-color)" }}>
          <HeaderH1>morphin</HeaderH1>
        </Box>
        <Space h={1} />
        <Text>Create image morphing animations with css!</Text>
        <Space h={2} />

        <Tabs>
          <Inline>
            {Object.keys(defaultSprites).map((spriteKey) => (
              <Tab
                active={currentSprite === spriteKey}
                key={spriteKey}
                onClick={() => {
                  currentSpriteSet(spriteKey);
                }}>
                <Text>{spriteKey}</Text>
              </Tab>
            ))}
          </Inline>
        </Tabs>

        <Space h={1} w={1} />
        <Inline>
          <Dropzone
            onDrop={(evt) => onFileSelected(evt, spriteASet)}
            onDragOver={eventIgnore}
            onDragEnter={eventIgnore}>
            <Space h={0.5} />
            <div
              style={{
                height: 32,
                width: 32,
                backgroundImage: `url(${spriteA.src})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
              }}
            />
            <Space h={1} />
            <Text>Drop sprite here</Text>
            <input
              type="file"
              onChange={(evt) => onFileSelected(evt, spriteASet)}
              multiple
              accept="image/*"
              aria-label="Drop an image here, or click to select"
            />
          </Dropzone>

          <Space h={1} w={1} />

          <Dropzone
            onDrop={(evt) => onFileSelected(evt, spriteBSet)}
            onDragOver={eventIgnore}
            onDragEnter={eventIgnore}>
            <Space h={0.5} />
            <div
              style={{
                height: 32,
                width: 32,
                backgroundImage: `url(${spriteB.src})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
              }}
            />
            <Space h={1} />
            <Text>Drop sprite here</Text>
            <input
              type="file"
              onChange={(evt) => onFileSelected(evt, spriteBSet)}
              multiple
              accept="image/*"
              aria-label="Drop an image here, or click to select"
            />
          </Dropzone>
        </Inline>
        <Space h={2} />

        <HeaderH2>Result:</HeaderH2>
        <Space h={1} />
        <style>{css}</style>
        <div key={css} className="pixel" />

        <Space h={2} />

        <Textarea onChange={(e) => {}} className="code" value={css} />

        <Space h={1} />
        {navigator && navigator.clipboard && navigator.clipboard.writeText && (
          <Button
            onClick={(e) => {
              navigator.clipboard.writeText(css);
            }}>
            Copy Code
          </Button>
        )}

        <Space h={2} />
        <Text>
          For a simpler image to box-shadow conversion see, see <A href="https://javier.xyz/img2css/">img2css</A>.
        </Text>
        <Space h={2} />
        <Text>
          Made by <A href="https://twitter.com/javierbyte">javierbyte</A>.
        </Text>
        <Space h={3} />
      </Box>
    </Container>
  );
}

export default App;
