#!/bin/bash

echo "Building Komodo images locally..."

# Build core image
echo "Building komodo-core..."
docker build -f bin/core/aio.Dockerfile -t komodo-core:latest .

# Build periphery image  
echo "Building komodo-periphery..."
docker build -f bin/periphery/aio.Dockerfile -t komodo-periphery:latest .

echo "Build complete!"
echo ""
echo "To use these images, update your docker-compose.yml:"
echo "  komodo_core:"
echo "    image: komodo-core:latest"
echo ""
echo "  komodo_periphery:"  
echo "    image: komodo-periphery:latest"