/*
 
*/
const bunyan = require("bunyan");
var config = require("./env.js");
'use strict';

const HealthCheckService = require('./service.js');

var logger = bunyan.createLogger({
    name: 'health-check',
    streams: [
        {
          level: 'info',
          stream: process.stdout
        },
        {
          level: 'info',
          path: './health-check.log'
        }
      ]
});
var service = new HealthCheckService(config.services);
service.logger=logger;
service.start(8080);
