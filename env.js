/**
 * Set configuration variables for the health-check service
 * Try to retrieve values for environment variables as much as possible, otherwise use defaults.
 */

'use strict';
const bunyan = require("bunyan");

var logger = bunyan.createLogger({
  name: "health-check-config",
  streams: [
      {
        level: "error",
        stream: process.stdout
      }
    ]
});

module.exports = (function() {
  var env = {};
  //port on which to expose the service
  env.servicePort = process.env.SERVICE_PORT || 8080;
  // YourLoops version the health-check is running on
  env.ylpVersion = process.env.YLP_VERSION;
  // The service
  env.serviceName = process.env.SERVICE_NAME || "health-check";
  env.pingTimeout = JSON.parse(process.env.PING_TIMEOUT || 5000);
  
  // list of urls to monitor
  // exemple: [{"name": "svc1", "url":"https://.../status"},{"name": "svc2", "url":"https://.../status"}]
  var monitored_urls = process.env.MONITORED_URLS;
  if(monitored_urls) {
    try {
      env.monitoredServices = JSON.parse(monitored_urls);
      for(let i=0; i<env.monitoredServices.length; i++) {
        if (!env.monitoredServices[i].pingTimeout) {
          env.monitoredServices[i].pingTimeout = env.pingTimeout;
        }
      }
    } catch(err) {
      logger.error("Error while parsing the list of monitored services: " + err);
    }
  }
  
  //Log config
  env.logLevel = process.env.LOG_LEVEL || 'info';
  env.logFile = process.env.LOG_FILE

  return env;
})();
