# Yourloops Health Check agregator service

Health-Check is a simple service which allows you to monitor several web services and provide an agregated status.
The service exposes this agregated status on route /status
This end point is typically what would be provided to a load balancer to check the health of the entire stack.

## [1.0.0] - 2019-06-13
### Added
- Change the output of the service: it now returns the full list of services even when one is down.
- Return more details comming from the services themselves

## [0.1.6] - 2019-01-31
### Added
- Package the application and make Jenkins publish the package on S3.
- Create production startup scripts
- Create a version file to track the version of NodeJs to use in production
### Fixes
- Correct the npm pre-test instructions: using --only-dev did curiously prevent the installation of some development dependancies such as minimatch.

## [0.1.1] - 2018-12-18
### Features
- Initiate a new project for yourloops.  
    For now keep it simple: contact each webservices (defined by configuration), get the result and report an agregated status and view.