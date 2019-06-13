#!/bin/sh
root_dir=${WORKSPACE:-./}

if [ ! -d "$root_dir/dist" ]; then
  echo "Dist folder does not exist, let's run distrib.sh"
  $root_dir/qa/distrib.sh
fi

# rename dist to make sure it is named after the module name and release number (it's important for the deployment process)
mv $root_dir/dist $root_dir/health-check-$1
tar -czf $root_dir/health-check-$1.tar.gz -C $root_dir health-check-$1/*