const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: path.resolve(__dirname),
    images: {
        unoptimized: true
    }
};

module.exports = nextConfig;
