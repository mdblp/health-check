# Health Check
## Service description
Health-Check is a simple service which allows you to monitor several web services and provide an aggregated status.  

### How it works
Each time the service is contacted it will ping (http GET) each service endpoints provided in the configuration and build an aggregated view. 
If all services respond with a status 200 the health check service will return 200 as well. 
If (at least) one of the monitored services responds with a code different than 2XX or does not respond within the expected delay (timeout) it will return 503.   
The timeout can be provided globaly and for each service.

In addition, the service is displaying the overall status of YourLoops in first position. It includes the global status (either 200 or 503 depending on the other services) and potentially the version number is passed as en environment variable `YLP_VERSION`.

The service exposes this aggregated status on route `/status`  
This end point is typically what would be provided to a load balancer to check the health of the entire stack.


## Install
Requirements:

- [Node.js](http://nodejs.org/ 'Node.js') version 10.x
- [npm](https://www.npmjs.com/ 'npm') version 6.x or higher

### Install from sources
Clone this repo [from GitHub](https://github.com/mdblp/health-check 'GitHub: health-check'), then install the dependencies:

After cloning this repository to your local machine, first make sure that you have node `10.x` and npm `6.x` installed. If you have a different major version of node installed, consider using [nvm](https://github.com/creationix/nvm 'GitHub: Node Version Manager') to manage and switch between multiple node (& npm) installations. 

Once your environment is setup with node `10.x` and npm `6.x` install the dependencies with npm:

```bash
$ npm install
```

## Running locally
### Configuration
To start properly the service expect a few environment variables to be set:
* MONITORED_URLS: the list of urls to ping to monitor services. These urls must be provided as a JSON array.  
  Exemple: 
  ```
    export MONITORED_URLS="[
        {\"name\": \"blip\", \"url\":\"http://localhost:3000\"},
        {\"name\": \"gatekeeper\", \"url\":\"http://localhost:9123/status\"},
        {\"name\": \"hakken\", \"url\":\"http://localhost:8000/status\"},
        {\"name\": \"highwater\", \"url\":\"http://localhost:9191/status\"}
    ]"
  ```
  You can add an optionnal timeout to each of the services (in case you need different timeout set for your monitored services):  
  ```
    export MONITORED_URLS="[
        {\"name\": \"blip\", \"url\":\"http://localhost:3000\"},
        {\"name\": \"gatekeeper\", \"url\":\"http://localhost:9123/status\",  \"pingTimeout\": 3000},
        {\"name\": \"hakken\", \"url\":\"http://localhost:8000/status\"},
        {\"name\": \"highwater\", \"url\":\"http://localhost:9191/status\,  \"pingTimeout\": 4000"}
    ]"
  ```
* SERVICE_PORT: the port on which the service should listen. Defaults to 8080.
* SERVICE_NAME: the name of the service, used in the logs. Default to "health-check".  
* PING_TIMEOUT: Global timeout value, in milliseconds. Defaults to 5000.

### Execution
```bash
$ npm start
```

You can test the service locally: 
```
$ curl http://localhost:8080/status
```
The service should return either an http status code 200, in case of success, or 503 when (at least) one of the services does not respond.  

## Contribute
Start by clonning the repo and install the dependencies as explained above. Then you are ready to change the code and test!  

### Running the tests
To run the unit tests, use:

```bash
$ npm test
```

