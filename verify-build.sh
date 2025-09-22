#!/bin/bash

echo "Verifying build process..."

# Run a production build to check for any path alias issues
echo "Running production build..."
npm run build

# Check the result
if [ $? -eq 0 ]; then
  echo "✅ Build successful! Path aliases are working correctly."
else
  echo "❌ Build failed. There may still be issues with path aliases."
  echo "Please check the build output for details."
fi 