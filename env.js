// Loads the environment and makes it accessible,
// and also has sensible defaults

// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==
'use strict';

var fs = require('fs');

var config = require('amoeba').config;

function maybeReplaceWithContentsOfFile(obj, field)
{
  var potentialFile = obj[field];
  if (potentialFile != null && fs.existsSync(potentialFile)) {
    obj[field] = fs.readFileSync(potentialFile).toString();
  }
}

module.exports = (function() {
  var env = {};


  // The service name to publish on discovery
  env.serviceName = config.fromEnvironment('SERVICE_NAME',"health-check");

  env.services = JSON.parse(config.fromEnvironment('MONITORED_URLS'));

  return env;
})();
