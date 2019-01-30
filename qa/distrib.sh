#!/bin/bash
root_dir=${WORKSPACE:-./}

# make sure to remove all dev dependencies
npm prune --production

mkdir -p dist

# copy all required files
cp -r ./node_modules dist/node_modules
cp *.js dist/
cp package.json dist/
cp start*.sh dist/
cp version.sh dist/