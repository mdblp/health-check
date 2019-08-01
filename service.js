/**
 * Service.js
 * Implementation of the health-check service
 */
'use strict';

var restify = require('restify');
var request = require('request-promise');
const bunyan = require("bunyan");

const responseCode = {
    success: 200,
    failure: 503
}

const responseStatus = {
    success: "OK",
    failure : "NOK"
};

class HealthCheckService {
    constructor(services, ylpVersion) {
        //let's check the list of services is OK:
        if (services && Array.isArray(services)) {
            services.forEach((service) => {
                if (typeof service.name != 'string' || typeof service.url != 'string') {
                    throw "the list of monitored services is malformed";
                }
            });
        }
        this.services = services;
        this.ylpVersion = ylpVersion;
        //default logger
        this.logger = bunyan.createLogger({
            name: 'health-check-default',
            streams: [
                {
                    level: 'info',
                    stream: process.stdout
                }
            ]
        });
    }

    /**
     * check the status of a given service
     * @param {*} service the service to check
     */
    serviceStatus(service) {
        this.logger.debug("check url " + service.url);

        return new Promise((resolve, reject) => {
            var retVal = { 'service': service.name };
            // prepare request:
            var options = {
                method: 'GET',
                uri: service.url,
                timeout: service.pingTimeout,
                transform: function (body, response, resolveWithFullResponse) {
                    return { 'statusCode': response.statusCode, 'data': body };
                }
            }

            request(options)
                .then((res) => {
                    if (res.statusCode == 200) {
                        retVal['status'] = responseStatus.success;
                    } else {
                        retVal['status'] = responseStatus.failure;
                    }
                    let details = "";
                    try {
                        details = JSON.parse(res.data);
                    } catch(err) {
                        details = res.data;
                    }
                    retVal['details'] = details;
                    resolve(retVal);
                })
                .catch((err) => {
                    retVal['status'] = responseStatus.failure;
                    retVal['error'] = err.message;
                    reject(retVal);
                });
        });
    }

    
    /**
     * Check all services (from configuration) and return the result (ok or not)
     * @param {*} req express request
     * @param {*} res express response
     */
    checkServices(req, res) {
        this.logger.info("Checking services health");
        let globalResult = [];
        let ylp = { 'service': 'yourloops', 'version': this.ylpVersion };
        
        // By default, we consider everything is going fine
        let resCode = responseCode.success;

        let isOK = true;
        let nbOfServices = this.services.length;
        let totalOfCheckedServices = 0;
        for (let i = 0; i < nbOfServices; i++) {
            this.serviceStatus(this.services[i]).then((result) => {
                globalResult.push(result);
            }).catch((err) => {
                isOK = false;
                globalResult.push(err);
            }).finally(() => {
                totalOfCheckedServices ++;
                if (totalOfCheckedServices == nbOfServices) {
                    if (isOK) {
                        this.logger.info("all services are up and running!");
                    } else {
                        this.logger.info("at least one service is down");
                        // at least one service down and we return failure
                        resCode = responseCode.failure;
                    }
                    // Overall status of YLP depends on all services status
                    ylp['status'] = (resCode == responseCode.success)? responseStatus.success : responseStatus.failure;
                    // Push YLP service information on first position
                    globalResult.unshift(ylp);
                    this.logger.debug(globalResult);
                    // Respond
                    res.status(resCode);
                    res.send(globalResult);
                }
            });
        }
    }

    /**
     * Start the service
     * @param {*} port port on which the service should listen for incoming requests
     * @param {*} callback a function to call when the server started to listen
     */
    start(port, callback = null) {
        this.logger.debug("Starting health-check service");
        this.logger.debug("services array: " + JSON.stringify(this.services));
        //create server
        this.server = restify.createServer()
        //define routes
        this.server.get('/status', this.checkServices.bind(this));
        //and then start listening
        this.server.listen(port, () => {
            let serviceList = "";
            this.services.forEach(element => {
                serviceList += element.name + " : " + element.url + '\n';
            });
            this.logger.info("Health check service started on %s and will monitor the following services: \n %s", this.server.url, serviceList);
            if (callback != null) callback();
        });
    }

    /**
     * Stop the service
     */
    stop() {
        this.logger.debug("Stopping health-check service");
        this.server.close(() => {
            this.logger.info("Health Check service has stopped");
        })
    }
}

module.exports = HealthCheckService;
module.exports.responseStatus = responseStatus;
module.exports.responseCode = responseCode;