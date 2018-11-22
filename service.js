
'use strict';

var restify = require('restify');
var request = require('request-promise');
const bunyan = require("bunyan");

class HealthCheckService{
    constructor(services) {
        this.services=services;    
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

    //check the status of a given service
    serviceStatus(service) {
        this.logger.debug("check url " + service.url);
        
        return new Promise((resolve,reject) => {
            var retVal={'service': service.name};

            //prepare request:
            var options = {
                method: 'GET',
                uri: service.url,
                transform: function(body, response, resolveWithFullResponse) {
                    return {'statusCode': response.statusCode, 'data': body};
                  }
            }
            
            request(options)
            .then((res) => {
                if(res.statusCode == 200) {
                    retVal['status']="OK";
                } else {
                    retVal['status']="NOK";
                }
                resolve(retVal);
            })
            .catch((err) => {
                //retVal['status']="NOK";
                reject(err);
            });
        });   
    }

    //Check all services and return the result (ok or not)
    checkServices(req, res, next) {
        this.logger.info("Checking services health");
        var promises = [];
        for(let i=0; i < this.services.length; i++){
            promises[i]=this.serviceStatus(this.services[i]);
        }
        Promise.all(promises).then((values) => {
            this.logger.info("all services are up and running!");
            this.logger.debug(values);
            res.status(200);
            res.send(values);
        }).catch((err) => {
            this.logger.info("at least one service is down " + JSON.stringify(err));
            res.status(503);
            res.send(JSON.stringify(err));
        });
    }

    start(port, callback=null){
        this.logger.debug("Starting health-check service");
        this.logger.debug("services array: " + this.services);
        //create server
        this.server = restify.createServer()
        //define routes
        this.server.get('/status', this.checkServices.bind(this)); 
        //and then start listening
        this.server.listen(port, () => {
            let serviceList="";
            this.services.forEach(element => {
                serviceList += element.name +" : " + element.url + '\n';
            });
            this.logger.info("Health check service started on %s and will monitor the following services: \n %s", this.server.url, serviceList);
            if (callback != null) callback();
        });
    } 

    stop() {
        this.logger.debug("Stopping health-check service");
        this.server.close(() => {
            this.logger.info("Health Check service has stopped");
        })
    }
}

module.exports = HealthCheckService;