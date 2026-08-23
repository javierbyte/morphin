// Weighing a colour difference against a move. Colour dominates — a pixel would
// rather travel than change hue — but not lexicographically: the Square example
// encodes its intended pairing in greys that differ by a single unit per
// channel, and those pixels must still prefer standing still over chasing an
// exact colour match two pixels away.
const COLOR_WEIGHT = 8;

// Only the cheapest few destinations per pixel make it into the sort. A pixel
// never ends up at its 300th choice in a good matching.
const CANDIDATES_PER_PIXEL = 48;

// Nothing ever legitimately travels further than this once the paths have been
// untangled, so looking further afield only costs time. Frames are capped at
// 32x32 upstream, which makes this about a quarter of the longest diagonal.
// Anything this shortlist misses is still caught by the unrestricted pass.
const SEARCH_RADIUS = 10;

// How far apart two pixels can be and still be considered neighbours when
// working out which way a region is moving.
const FLOW_RADIUS = 2.5;

// Re-running the assignment with a sense of where each pixel's neighbours went
// is what turns a cloud of individually-sensible moves into a region that moves
// as a body. Three rounds is where it stops paying for itself.
const FLOW_ROUNDS = 3;
const FLOW_WEIGHT = 12;

const UNTANGLE_PASSES = 6;

function positionKey(pixel) {
  return `${pixel.x},${pixel.y}`;
}

function isSameColor(a, b) {
  return (
    a.rgb.r === b.rgb.r &&
    a.rgb.g === b.rgb.g &&
    a.rgb.b === b.rgb.b &&
    a.rgb.a === b.rgb.a
  );
}

// Normalized to 0..1 so COLOR_WEIGHT means the same thing at any sprite size.
function colorDistance2(a, b) {
  const dr = a.rgb.r - b.rgb.r;
  const dg = a.rgb.g - b.rgb.g;
  const db = a.rgb.b - b.rgb.b;
  return (dr * dr + dg * dg + db * db) / (3 * 255 * 255);
}

// Squared rather than linear distance is what keeps a region together:
// minimizing the sum of squared displacements is the same as maximizing the sum
// of dot products, and for two point sets related by a translation, translating
// every pixel by the same offset *is* the optimum.
function spatialDistance2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function boundsOf(pixelSets) {
  let maxX = 0;
  let maxY = 0;
  for (const pixels of pixelSets) {
    for (const pixel of pixels) {
      if (pixel.x > maxX) maxX = pixel.x;
      if (pixel.y > maxY) maxY = pixel.y;
    }
  }
  return { maxX, maxY };
}

// A stand-in partner for a pixel that had nobody to pair with: same spot, fully
// transparent, keeping its own rgb rather than using `transparent` so it fades
// without sliding through another hue.
function phantomOf(pixel) {
  return { x: pixel.x, y: pixel.y, rgb: { ...pixel.rgb, a: 0 } };
}

/**
 * Pairs up the pixels of two frames by where each one most plausibly went,
 * rather than by sorting both frames the same way and hoping the indexes line
 * up. Returns two equal-length co-indexed arrays — entry `i` of the first
 * animates into entry `i` of the second.
 */
export default function smartMatch(pixelsA, pixelsB) {
  const takenA = new Array(pixelsA.length).fill(false);
  const takenB = new Array(pixelsB.length).fill(false);
  const fixed = new Set();
  let pairs = [];

  // Pixels that did not change at all. Stating this outright — rather than
  // trusting the cost function to rediscover it — is both the guarantee that a
  // still background stays still and the reason Yoshi is cheap: it settles 232
  // of its 341 pixels before any searching starts. These are also the anchors
  // the flow field below leans on to keep still regions still.
  const bByPosition = new Map();
  pixelsB.forEach((pixel, index) => {
    bByPosition.set(positionKey(pixel), index);
  });

  pixelsA.forEach((pixel, indexA) => {
    const indexB = bByPosition.get(positionKey(pixel));
    if (indexB === undefined) return;
    if (takenB[indexB] || !isSameColor(pixel, pixelsB[indexB])) return;

    takenA[indexA] = true;
    takenB[indexB] = true;
    fixed.add(indexA);
    pairs.push([indexA, indexB]);
  });

  const { maxX, maxY } = boundsOf([pixelsA, pixelsB]);
  const diagonal2 = (maxX + 1) ** 2 + (maxY + 1) ** 2 || 1;

  // Which way is the neighbourhood of each point drifting? Measured from the
  // pairs settled so far, weighted towards close and similarly-coloured
  // neighbours. `forward` reads the field over frame A (where did the stuff
  // around here go), `!forward` reads it over frame B (where did it come from).
  function flowFieldOver(points, settled, forward) {
    const known = settled.map(([indexA, indexB]) => ({
      at: forward ? pixelsA[indexA] : pixelsB[indexB],
      dx: (forward ? 1 : -1) * (pixelsB[indexB].x - pixelsA[indexA].x),
      dy: (forward ? 1 : -1) * (pixelsB[indexB].y - pixelsA[indexA].y),
    }));

    const field = new Map();
    points.forEach((point, index) => {
      let sumX = 0;
      let sumY = 0;
      let sumWeight = 0;

      for (const other of known) {
        const distance = Math.hypot(point.x - other.at.x, point.y - other.at.y);
        if (distance > FLOW_RADIUS) continue;

        // A neighbour of the same colour is far better evidence of where this
        // pixel belongs than one that merely happens to be nearby.
        const weight =
          (1 / (1 + distance)) *
          (colorDistance2(point, other.at) < 0.001 ? 1 : 0.3);
        sumX += other.dx * weight;
        sumY += other.dy * weight;
        sumWeight += weight;
      }

      if (sumWeight) field.set(index, [sumX / sumWeight, sumY / sumWeight]);
    });
    return field;
  }

  // The plain cost: colour first, then distance.
  function baseCost(indexA, indexB) {
    return (
      COLOR_WEIGHT * colorDistance2(pixelsA[indexA], pixelsB[indexB]) +
      spatialDistance2(pixelsA[indexA], pixelsB[indexB]) / diagonal2
    );
  }

  let flow = null;

  // The same cost, plus a pull towards agreeing with the neighbours.
  function flowCost(indexA, indexB) {
    let cost = baseCost(indexA, indexB);
    if (!flow || !flow.has(indexA)) return cost;

    const [flowX, flowY] = flow.get(indexA);
    const errorX = pixelsB[indexB].x - pixelsA[indexA].x - flowX;
    const errorY = pixelsB[indexB].y - pixelsA[indexA].y - flowY;
    return cost + (FLOW_WEIGHT * (errorX * errorX + errorY * errorY)) / diagonal2;
  }

  function takeCheapest(candidates) {
    candidates.sort((left, right) => left.cost - right.cost);
    for (const candidate of candidates) {
      if (takenA[candidate.a] || takenB[candidate.b]) continue;
      takenA[candidate.a] = true;
      takenB[candidate.b] = true;
      pairs.push([candidate.a, candidate.b]);
    }
  }

  // Throws away everything except the fixed points and matches afresh, which is
  // what lets a later round act on a flow field the earlier rounds discovered.
  function assign() {
    const anchored = new Set(
      pairs.filter(([indexA]) => fixed.has(indexA)).map(([, indexB]) => indexB)
    );
    for (let index = 0; index < pixelsA.length; index++) {
      takenA[index] = fixed.has(index);
    }
    for (let index = 0; index < pixelsB.length; index++) {
      takenB[index] = anchored.has(index);
    }
    pairs = pairs.filter(([indexA]) => fixed.has(indexA));

    // Free B pixels bucketed by position, so each A pixel only has to look at
    // its own corner of the frame.
    const grid = new Map();
    pixelsB.forEach((pixel, index) => {
      if (takenB[index]) return;
      const cellKey = `${Math.floor(pixel.x / SEARCH_RADIUS)},${Math.floor(
        pixel.y / SEARCH_RADIUS
      )}`;
      if (!grid.has(cellKey)) grid.set(cellKey, []);
      grid.get(cellKey).push(index);
    });

    const candidates = [];
    pixelsA.forEach((pixel, indexA) => {
      if (takenA[indexA]) return;

      const row = [];
      const cellX = Math.floor(pixel.x / SEARCH_RADIUS);
      const cellY = Math.floor(pixel.y / SEARCH_RADIUS);
      for (let gx = cellX - 1; gx <= cellX + 1; gx++) {
        for (let gy = cellY - 1; gy <= cellY + 1; gy++) {
          const bucket = grid.get(`${gx},${gy}`);
          if (!bucket) continue;
          for (const indexB of bucket) {
            if (takenB[indexB]) continue;
            if (spatialDistance2(pixel, pixelsB[indexB]) > SEARCH_RADIUS ** 2) {
              continue;
            }
            row.push({ cost: flowCost(indexA, indexB), a: indexA, b: indexB });
          }
        }
      }

      if (row.length > CANDIDATES_PER_PIXEL) {
        row.sort((left, right) => left.cost - right.cost);
        row.length = CANDIDATES_PER_PIXEL;
      }
      candidates.push(...row);
    });
    takeCheapest(candidates);

    // Whatever the shortlist missed — a pixel with no near neighbour left, or
    // one whose every candidate got claimed — pairs off without restriction.
    const leftoverA = [];
    const leftoverB = [];
    for (let index = 0; index < pixelsA.length; index++) {
      if (!takenA[index]) leftoverA.push(index);
    }
    for (let index = 0; index < pixelsB.length; index++) {
      if (!takenB[index]) leftoverB.push(index);
    }
    if (!leftoverA.length || !leftoverB.length) return;

    const rest = [];
    for (const indexA of leftoverA) {
      for (const indexB of leftoverB) {
        rest.push({ cost: flowCost(indexA, indexB), a: indexA, b: indexB });
      }
    }
    takeCheapest(rest);
  }

  assign();
  for (let round = 0; round < FLOW_ROUNDS; round++) {
    flow = flowFieldOver(pixelsA, pairs, true);
    assign();
  }

  // Taking the cheapest pair at each step is fast but leaves paths crossing
  // each other, which reads as a swirl rather than a morph. Swapping any two
  // partners that would be happier the other way round untangles them. This is
  // judged on the plain geometric cost — the flow rounds have already settled
  // *which* region each pixel belongs to, and the job here is only to stop the
  // paths within a region from crossing.
  const movable = pairs
    .map((pair, index) => index)
    .filter((index) => !fixed.has(pairs[index][0]));

  for (let pass = 0; pass < UNTANGLE_PASSES; pass++) {
    let swapped = false;
    for (let left = 0; left < movable.length; left++) {
      for (let right = left + 1; right < movable.length; right++) {
        const [a1, b1] = pairs[movable[left]];
        const [a2, b2] = pairs[movable[right]];
        if (
          baseCost(a1, b2) + baseCost(a2, b1) >=
          baseCost(a1, b1) + baseCost(a2, b2) - 1e-12
        ) {
          continue;
        }
        pairs[movable[left]] = [a1, b2];
        pairs[movable[right]] = [a2, b1];
        swapped = true;
      }
    }
    if (!swapped) break;
  }

  // Reading order, so the generated CSS stays stable and skimmable.
  pairs.sort(([leftA], [rightA]) => {
    return (
      pixelsA[leftA].y - pixelsA[rightA].y ||
      pixelsA[leftA].x - pixelsA[rightA].x
    );
  });

  const orderedA = pairs.map(([indexA]) => pixelsA[indexA]);
  const orderedB = pairs.map(([, indexB]) => pixelsB[indexB]);

  // The frames hold different numbers of pixels, so whoever is left over gets a
  // transparent partner. Rather than freezing in place while everything around
  // it slides — which reads as a glitch — it drifts with its neighbours as it
  // fades, so surplus matter melts away with the body and new matter grows out
  // of it instead of blinking into existence.
  const driftA = flowFieldOver(pixelsA, pairs, true);
  const driftB = flowFieldOver(pixelsB, pairs, false);

  function driftedPhantom(pixel, field, index) {
    const drift = field.get(index);
    if (!drift) return phantomOf(pixel);

    return {
      x: Math.min(Math.max(Math.round(pixel.x + drift[0]), 0), maxX),
      y: Math.min(Math.max(Math.round(pixel.y + drift[1]), 0), maxY),
      rgb: { ...pixel.rgb, a: 0 },
    };
  }

  pixelsA.forEach((pixel, index) => {
    if (takenA[index]) return;
    orderedA.push(pixel);
    orderedB.push(driftedPhantom(pixel, driftA, index));
  });
  pixelsB.forEach((pixel, index) => {
    if (takenB[index]) return;
    orderedA.push(driftedPhantom(pixel, driftB, index));
    orderedB.push(pixel);
  });

  return [orderedA, orderedB];
}

export { phantomOf };
