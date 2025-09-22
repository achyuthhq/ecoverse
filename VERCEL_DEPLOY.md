# Vercel Deployment Guide

This guide provides instructions for deploying the Ecoverse application to Vercel, with a focus on resolving path alias issues.

## Prerequisites

- A Vercel account
- Git repository with your Ecoverse codebase

## Path Alias Configuration

The application uses path aliases (e.g., `@/components`) to simplify imports. To ensure these work correctly on Vercel:

1. **tsconfig.json** should have the proper path configuration:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **next.config.js** should explicitly configure webpack aliases:
   ```js
   const path = require('path');

   const nextConfig = {
     // ... other config
     webpack: (config) => {
       config.resolve.alias['@'] = path.join(__dirname, 'src');
       return config;
     },
   };
   ```

## Directory Structure

Ensure all components and library files are in the correct location:

- All components should be in the `src/components` directory, not in the root `components` directory
- All library files should be in the `src/lib` directory, not in the root `lib` directory
- No symbolic links should be used - replace them with actual files
- Maintain consistent casing in file names and import statements

## Prisma Configuration

Vercel caches dependencies, which can lead to issues with Prisma Client generation. To fix this:

1. **Update package.json build script** to include Prisma generation:
   ```json
   "scripts": {
     "build": "prisma generate && next build"
   }
   ```

2. **Ensure schema.prisma is up to date** and committed to your repository.

3. **Add DATABASE_URL to Vercel environment variables** in your project settings.

## Deployment Steps

1. **Clear Vercel Cache**:
   - Go to your Vercel project
   - Navigate to Settings > General
   - Scroll down to "Build & Development Settings"
   - Click "Clear Cache and Redeploy"

2. **Deploy with Environment Variables**:
   - Ensure all required environment variables are set in Vercel
   - These should match the variables in your `.env.local` file
   - Critical variables include:
     - `DATABASE_URL`
     - `NEXTAUTH_URL`
     - `NEXTAUTH_SECRET`
     - Firebase configuration variables

3. **Monitor Build Logs**:
   - Watch the build logs for any path resolution errors
   - If errors occur, check the specific file paths mentioned

## Common Issues and Solutions

1. **Case Sensitivity Issues**:
   - Vercel runs on Linux which is case-sensitive
   - Ensure all import paths match the exact case of the file names
   - Example: `import { Button } from "@/components/ui/Button"` will fail if the file is named `button.tsx`

2. **Missing Files**:
   - Ensure all imported files exist in the repository
   - Check for files that might be in `.gitignore` but required for the build

3. **Path Alias Resolution**:
   - If path aliases still don't work, try using relative imports as a temporary solution
   - Example: `import { Button } from "../../components/ui/button"`

4. **Prisma Client Issues**:
   - If you see errors about outdated Prisma Client, ensure your build script includes `prisma generate`
   - Check that your DATABASE_URL is correctly set in Vercel environment variables

## Verifying the Build Locally

Before deploying to Vercel, verify that the build works locally:

```bash
npm run build
```

If the build succeeds locally but fails on Vercel, it's likely due to case sensitivity, environment configuration differences, or Prisma-related issues.

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Path Aliases in TypeScript](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel) 