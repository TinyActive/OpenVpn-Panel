/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true
    },
    // basePath and assetPrefix removed for custom domain deployment
    // Only use basePath if deploying to username.github.io/repo-name
}

module.exports = nextConfig
