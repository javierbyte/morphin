import { BASE_PATH } from './src/lib/basePath.js';

/** @type {import('next').NextConfig} */
export default {
  // Static bundle pushed to the gh-pages branch.
  output: 'export',
  basePath: BASE_PATH,
  // The canonical is javier.xyz/morphin, without a trailing slash.
  trailingSlash: false,
  // next/image has no optimizer in an exported site, and the sprites are
  // pixel art served as-is.
  images: { unoptimized: true },
};
