# Health Check
## Service description
Health-Check is a simple service which allows you to monitor several web services and provide an agregated status.  
The service exposes this agregated status on route `/status`  
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
TODO: how to configure

```bash
$ npm start
```

You can test the service locally: 
```
$ curl http://localhost:8080/status
```
The service should return either an http status code 200, in case of success, or 503 when one the services does not respond.  


## Contribute
Start by clonning the repo and install the dependencies as explained above. Then you are ready to change the code and test!  

### Running the tests
To run the unit tests, use:

```bash
$ npm test
```

### Link to Jira issues
add in commit log: `<ignored text> <ISSUE_KEY> <ignored text> #<COMMAND> <optional COMMAND_ARGUMENTS>`
for example: 
