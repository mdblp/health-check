/**
 * Entry point for the health-check service
 */
'use strict';
const bunyan = require("bunyan");
const HealthCheckService = require('./service.js');
var config = require("./env.js");

// Create logger used by the service (based on configuration)
var logger = bunyan.createLogger({
    name: config.serviceName,
    streams: [
        {
          level: config.logLevel,
          stream: process.stdout
        },
        {
          level: config.logLevel,
          path: config.logFile
        }
      ]
});

//Currently the list of services is provided by configuration. Ideally this should be obtained from hakken
if(config.monitoredServices == null) {
  logger.error("Cannot start %s service, the object environment variable 'MONITORED_URLS' is malformed. "
    + "It should be in the form of %s",
    config.serviceName,
    "[{\"name\": \"svc1\", \"url\":\"https://.../status\"},{\"name\": \"svc2\", \"url\":\"https://.../status\"}]"
    )
    process.exit(1);
}
var service = new HealthCheckService(config.ylpVersion, config.monitoredServices);
service.logger=logger;
service.start(config.servicePort);
