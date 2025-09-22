/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com', 
      'i.ibb.co',
      'images.unsplash.com',  // Unsplash images
      'lh3.googleusercontent.com',  // Google profile images
      'avatars.githubusercontent.com',  // GitHub profile images (in case you add GitHub auth later)
      'platform-lookaside.fbsbx.com',  // Facebook profile images (in case you add Facebook auth later)
    ],
  },
  // Ensure environment variables are loaded
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Explicitly configure path aliases to match tsconfig.json
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig; 