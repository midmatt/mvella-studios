import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid Next picking a parent ~/package-lock.json as the workspace root.
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // The dev copy of this repo lives on an exFAT-formatted external SSD.
    // On exFAT, macOS shadows every file with an AppleDouble `._` companion,
    // and Next's on-disk image cache (.next/cache/images) reads those back
    // instead of the real optimized file on the second (cache HIT) request —
    // serving `application/octet-stream` AppleDouble data, which browsers
    // render as a broken image. Disabling optimization in dev bypasses that
    // cache entirely and serves the raw files. Production (Vercel, Linux) is
    // unaffected and keeps full image optimization.
    unoptimized: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
