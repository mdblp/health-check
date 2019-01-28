#!/bin/sh

mkdir -p health-check-dblp.$1
# copy all required files

cp -r ./node_modules health-check-dblp.$1/node_modules
cp *.js health-check-dblp.$1/
cp package.json health-check-dblp.$1/
cp start*.sh health-check-dblp.$1/
cp version.sh health-check-dblp.$1/

tar -czf health-check-dblp.$1.tar.gz health-check-dblp.$1/*