import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid Next picking a parent ~/package-lock.json as the workspace root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
