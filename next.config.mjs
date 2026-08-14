import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * macOS writes a 4096-byte AppleDouble `._*` companion next to every file on
 * filesystems that don't store xattrs natively. Next's image optimizer cache
 * (`.next/cache/images`) then serves those companions on cache HIT as
 * `application/octet-stream`, which browsers render as a broken image.
 */
const APPLEDOUBLE_FS = new Set([
  "exfat",
  "msdos",
  "fat",
  "ntfs",
  "smbfs",
  "cifs",
]);

function imageCacheWouldPoison() {
  // Vercel / CI Linux never write AppleDouble; keep full optimization.
  if (process.env.VERCEL || process.env.CI) return false;
  if (process.platform !== "darwin") return false;

  try {
    const realDir = fs.realpathSync(__dirname);
    const mounts = execFileSync("/sbin/mount", { encoding: "utf8" });
    let bestPoint = "";
    let bestFs = "";

    for (const line of mounts.split("\n")) {
      const match = line.match(/^.*? on (\/.*?) \(([^,)]+)/);
      if (!match) continue;
      const point = match[1];
      if (realDir === point || realDir.startsWith(`${point}/`)) {
        if (point.length >= bestPoint.length) {
          bestPoint = point;
          bestFs = match[2].trim().toLowerCase();
        }
      }
    }

    if (APPLEDOUBLE_FS.has(bestFs)) return true;
  } catch {
    // Fall through to on-disk AppleDouble detection.
  }

  try {
    const cacheDir = path.join(__dirname, ".next", "cache", "images");
    return fs.readdirSync(cacheDir).some((name) => name.startsWith("._"));
  } catch {
    return false;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid Next picking a parent ~/package-lock.json as the workspace root.
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // Disable the optimizer whenever its on-disk cache would live on a
    // volume that poisons HIT responses (this machine's exFAT SSD, or an
    // already-poisoned `.next/cache/images`). `next dev` is always
    // unoptimized. Vercel production stays optimized.
    unoptimized:
      process.env.NODE_ENV !== "production" || imageCacheWouldPoison(),
  },
};

export default nextConfig;
