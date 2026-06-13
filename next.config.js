/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // transformers.js (and its onnxruntime-node native binding) must not be
  // bundled by webpack — load it as a real Node module at runtime.
  serverExternalPackages: ["@xenova/transformers"],
};

module.exports = nextConfig;
