import React, { useEffect, useState } from "react";

import _ from "lodash";
import Styled from "styled-components";
import compressColorRGB from "./lib/compress-color.js";
import readImageAsBase64 from "./lib/read-image-as-base64.js";

import base64ImageUtils from "base64-image-utils";
const { base64ImageToRGBArray } = base64ImageUtils;

import {
  JBX,
  Button,
  Range,
  HeaderH1,
  HeaderH3,
  HeaderH2,
  Text,
  Space,
  Box,
  A,
  Ul,
  Li,
  Container,
  Dropzone,
  Inline,
  Tabs,
  Tab,
  Code,
} from "jbx";

const Sprite = Styled.img(({ width, height }) => {
  return {
    height: (28 / Math.max(height, width)) * height,
    width: (28 / Math.max(height, width)) * width,
    display: "block",
    imageRendering: "pixelated",
  };
});

const LOG_SCALE_FACTOR = 2.2;

const defaultSprites = {
  Yoshi: {
    name: "Yoshi",
    sprites: ["yoshi1.png", "yoshi2.png"],
  },
  "3 Dots": {
    name: "3 Dots",
    sprites: ["3dots1.png", "3dots2.png"],
    scale: 8,
    transition: 80,
    alternate: false,
    sortMethod: "Brightness",
  },
  Square: {
    name: "Square",
    sprites: ["square1.png", "square2.png"],
    scale: 12,
    transition: 100,
    alternate: false,
    sortMethod: "Brightness",
  },
  Mario: {
    name: "Mario",
    sprites: ["mario1.png", "mario2.png"],
  },
  Pikachu: {
    name: "Pikachu",
    sprites: ["pikachu.png", "raichu.png"],
    sortMethod: "Brightness",
  },
  Supermario: {
    name: "Super Mario",
    sprites: ["supermario1.png", "supermario2.png"],
    sortMethod: "Horizontal",
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

const SORT_METHODS = {
  Diagonal: [
    (color) => {
      return Math.floor((color.x - color.y) / 3);
    },
    (color) => {
      return color.rgb.r + color.rgb.g + color.rgb.b;
    },
  ],
  Vertical: [
    (color) => {
      return color.x;
    },
  ],
  Horizontal: [
    (color) => {
      return color.y;
    },
  ],
  Brightness: [
    (color) => {
      return Math.floor((color.rgb.r + color.rgb.g + color.rgb.b) / 2);
    },
  ],
};

function rgbArrayToShadow(rgbArray, { sortMethod = "Brightness", scale = 1 }) {
  return _.chain(rgbArray)
    .filter((pixel) => {
      return !(
        pixel.rgb.a < 1 ||
        (pixel.rgb.r > 254 && pixel.rgb.g > 254 && pixel.rgb.b > 254)
      );
    })
    .sortBy(SORT_METHODS[sortMethod])
    .map((pixel) => {
      const color = compressColorRGB(pixel.rgb);
      return `${color} ${(pixel.x + 1) * scale}px ${(pixel.y + 1) * scale}px`;
    })
    .compact()
    .value()
    .join(",");
}

function saveFrame(path, config, stateSet) {
  readImageAsBase64(path, (base64) => {
    base64ImageToRGBArray(base64, (err, rgbArray) => {
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
        rgbArray,
        height: Math.abs(maxY - minY) + 1,
        width: Math.abs(maxX - minX) + 1,
      });
    });
  });
}

function App() {
  const [animationSpeedSrc, animationSpeedSet] = useState(
    Math.round(Math.pow(1000, 1 / LOG_SCALE_FACTOR))
  );
  const animationSpeed =
    Math.round(Math.pow(animationSpeedSrc, LOG_SCALE_FACTOR)) + 11 + 16;
  const [animationTransition, animationTransitionSet] = useState(25);
  const [alternateAnimation, alternateAnimationSet] = useState(true);

  const [currentSprite, currentSpriteSet] = useState("Yoshi");
  const [sortMethod, sortMethodSet] = useState("Vertical");
  const [scale, scaleSet] = useState(5);

  const [spriteA, spriteASet] = useState({
    shadow: null,
    height: 5,
    width: 5,
  });
  const [spriteB, spriteBSet] = useState({
    shadow: null,
    height: 5,
    width: 5,
  });

  useEffect(() => {
    if (!currentSprite) return;

    saveFrame(
      `${document.location.href}/sprites/${defaultSprites[currentSprite].sprites[0]}`,
      { scale },
      spriteASet
    );
    saveFrame(
      `${document.location.href}/sprites/${defaultSprites[currentSprite].sprites[1]}`,
      { scale },
      spriteBSet
    );

    // const { scale = 3, transition = 25, alternate = false } = defaultSprites[currentSprite];

    spriteASet({
      shadow: null,
      height: 0,
      width: 0,
    });
    spriteBSet({
      shadow: null,
      height: 0,
      width: 0,
    });

    scaleSet(defaultSprites[currentSprite].scale || 3);
    animationTransitionSet(defaultSprites[currentSprite].transition || 25);
    alternateAnimationSet(
      defaultSprites[currentSprite].alternate === undefined
        ? true
        : defaultSprites[currentSprite].alternate
    );
    sortMethodSet(defaultSprites[currentSprite].sortMethod || "Vertical");
  }, [currentSprite]);

  const totalWidth = Math.max(spriteA.width, spriteB.width) * scale;
  const totalHeight = Math.max(spriteA.height, spriteB.height) * scale;

  const css = `
@keyframes morphin {
  0%, ${50 - animationTransition / 2}% {
    box-shadow: ${rgbArrayToShadow(spriteA.rgbArray, {
      scale,
      sortMethod,
      translationX: totalWidth / -2,
      translationY: totalHeight / -2,
    })};
  }
  ${50 + animationTransition / 2}%, 100% {
    box-shadow: ${rgbArrayToShadow(spriteB.rgbArray, {
      scale,
      sortMethod,
      translationX: totalWidth / -2,
      translationY: totalHeight / -2,
    })};
  }
}

.pixel {
  height: ${scale}px;
  width: ${scale}px;
  margin: ${-scale}px ${totalHeight + scale * 2}px ${
    totalWidth + scale * 2
  }px ${-scale}px;
  animation: morphin ${animationSpeed}ms infinite${
    alternateAnimation ? " alternate " : " "
  }cubic-bezier(0.45, 0, 0.55, 1);
}`.trim();

  function onFileSelected(event, setFunction, reverse) {
    currentSpriteSet(null);
    event.stopPropagation();
    event.preventDefault();

    const dt = event.dataTransfer;
    const files = dt ? dt.files : event.target.files;
    const file = files[0];

    const fr = new window.FileReader();

    fr.onload = async (data) => {
      const base64src = data.currentTarget.result;

      const [base64] = await resizeImage(base64src);

      saveFrame(base64, { scale, reverse }, setFunction);
    };
    fr.readAsDataURL(file);
  }

  function eventIgnore(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  return (
    <Container>
      <JBX accent={"#ab99cf"} />
      <Space h={1} />
      <HeaderH1
        style={{
          fontWeight: 900,
          display: "inline-block",
          width: "auto",
          padding: "6px",
          backgroundColor: "var(--accent-color)",
        }}>
        morphin
      </HeaderH1>
      <Space h={1} />
      <Text>
        Tool that creates animated CSS transitions. Add sprites and get the code
        ready to paste in your site.
      </Text>
      <Space h={2} />
      <Tabs>
        <Inline>
          <Tab info>
            <Text>Examples: </Text>
          </Tab>
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
      <Space h={1} />
      <Inline>
        <Dropzone
          onDrop={(evt) => onFileSelected(evt, spriteASet)}
          onDragOver={eventIgnore}
          onDragEnter={eventIgnore}>
          <div
            style={{
              display: "flex",
              height: 48,
              width: 48,
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center",
            }}>
            <Sprite
              width={spriteA.width}
              height={spriteA.height}
              aria-label="Sprite A"
              src={spriteA.src}
            />
          </div>

          <Text>Sprite 1</Text>
          <input
            type="file"
            onChange={(evt) => onFileSelected(evt, spriteASet, true)}
            accept="image/*"
            aria-label="Drop an image here, or click to select"
          />
        </Dropzone>

        <Space h={1} w={1} />

        <Dropzone
          onDrop={(evt) => onFileSelected(evt, spriteBSet)}
          onDragOver={eventIgnore}
          onDragEnter={eventIgnore}>
          <div
            style={{
              display: "flex",
              height: 48,
              width: 48,
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center",
            }}>
            <Sprite
              width={spriteB.width}
              height={spriteB.height}
              aria-label="Sprite B"
              src={spriteB.src}
            />
          </div>

          <Text>Sprite 2</Text>
          <input
            type="file"
            onChange={(evt) => onFileSelected(evt, spriteBSet)}
            accept="image/*"
            aria-label="Drop an image here, or click to select"
          />
        </Dropzone>
      </Inline>
      <Space h={2} />

      <HeaderH2>Preview</HeaderH2>
      <Space h={1} />
      <style>{css}</style>
      <div key={css} className="pixel" />
      <Space h={2} />
      <Tabs>
        <Inline>
          <Tab info>
            <Text>Pixel matching method:</Text>
          </Tab>
          {Object.keys(SORT_METHODS).map((sortMethodKey) => (
            <Tab
              active={sortMethod === sortMethodKey}
              key={sortMethodKey}
              onClick={() => {
                sortMethodSet(sortMethodKey);
              }}>
              <Text>{sortMethodKey}</Text>
            </Tab>
          ))}
        </Inline>
      </Tabs>
      <Space h={1} />
      <Tabs>
        <Inline>
          <Tab info>
            <Text>Alternate:</Text>
          </Tab>
          <Tab
            active={alternateAnimation === true}
            onClick={() => {
              alternateAnimationSet(true);
            }}>
            <Text>Yes</Text>
          </Tab>
          <Tab
            active={alternateAnimation === false}
            onClick={() => {
              alternateAnimationSet(false);
            }}>
            <Text>No</Text>
          </Tab>
        </Inline>
      </Tabs>
      <Space h={1} />
      <Inline h={-1}>
        <Box flex={1} padding={[0.5, 1]} minWidth={"240px"}>
          <Text>
            Scale <span style={{ color: "#666" }}>{scale}</span>
          </Text>
          <Space h={1} />
          <Range
            aria-label="Scale"
            type="range"
            value={scale}
            onChange={(e) => scaleSet(Number(e.target.value))}
            min="1"
            max="25"
            step="0.5"
          />
        </Box>

        <Box flex={1} padding={[0.5, 1]} minWidth={"240px"}>
          <Text>
            Transition{" "}
            <span style={{ color: "#666" }}>{animationTransition}%</span>
          </Text>
          <Space h={1} />
          <Range
            aria-label="Transition Speed"
            type="range"
            value={animationTransition}
            onChange={(e) => animationTransitionSet(e.target.value)}
            min="1"
            max="100"
          />
        </Box>

        <Box flex={1} padding={[0.5, 1]} minWidth={"240px"}>
          <Text>
            Speed <span style={{ color: "#666" }}>{animationSpeed}ms</span>
          </Text>
          <Space h={1} />
          <Range
            aria-label="Animation Speed"
            type="range"
            value={animationSpeedSrc}
            onChange={(e) => animationSpeedSet(e.target.value)}
            step="0.5"
            min="2"
            max={Math.ceil(Math.pow(16384 / 2, 1 / LOG_SCALE_FACTOR))}
          />
        </Box>
      </Inline>
      <Space h={2} />
      <HeaderH3>Code</HeaderH3>
      <Space h={1} />
      <code>
        <Code
          aria-label="Generated code"
          onChange={() => {}}
          className="code"
          value={css}
        />
      </code>
      <Space h={1} />
      {navigator && navigator.clipboard && navigator.clipboard.writeText && (
        <Button
          onClick={() => {
            navigator.clipboard.writeText(css);
          }}>
          Copy Code
        </Button>
      )}
      <Space h={2} />
      <Text>
        For a simpler image to box-shadow conversion, see{" "}
        <A href="https://javier.xyz/img2css/">img2css</A>.
      </Text>
      <Space h={2} />
      <Text>More unrelated experiments</Text>
      <Space h={0.5} />
      <Text>
        <Ul>
          <Li>
            {"Create more cohesive color schemes, "}
            <A href="https://javier.xyz/cohesive-colors/">cohesive-colors</A>.
          </Li>
          <Li>
            Find the visual center of your images / logos,{" "}
            <A href="https://javier.xyz/visual-center/">visual-center</A>.
          </Li>
          <Li>
            JS AI Battle Game, <A href="https://clashjs.com/">clashjs</A>.
          </Li>
        </Ul>
      </Text>

      <Space h={2} />
      <Text>
        Made by <A href="https://javier.xyz">javierbyte</A>.
      </Text>
    </Container>
  );
}

export default App;
