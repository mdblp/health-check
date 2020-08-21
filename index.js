/**
 * Entry point for the health-check service
 */
'use strict';
const bunyan = require("bunyan");
const HealthCheckService = require('./service.js');
const packageJson = require("./package.json");
const config = require("./env.js");

// Create logger used by the service (based on configuration)
const logStreams = [
  {
    level: config.logLevel,
    stream: process.stdout
  }
];
if(config.logFile) {
  logStreams.push({
    level: config.logLevel,
    path: config.logFile
  });
}

const logger = bunyan.createLogger({
  name: config.serviceName,
  streams: logStreams
});

//Currently the list of services is provided by configuration. Ideally this should be obtained from hakken
if (config.monitoredServices == null) {
  logger.error("Cannot start %s service, the object environment variable 'MONITORED_URLS' is malformed. "
    + "It should be in the form of %s",
    config.serviceName,
    "[{\"name\": \"svc1\", \"url\":\"https://.../status\"},{\"name\": \"svc2\", \"url\":\"https://.../status\"}]"
  )
  process.exit(1);
}
const service = new HealthCheckService(config.monitoredServices, config.ylpVersion, packageJson.name, packageJson.version);
service.logger = logger;
service.start(config.servicePort);
