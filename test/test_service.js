let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
var Service = require("../service.js");
var nock = require("nock");

chai.use(chaiHttp);

describe('Global health check service', () => {
    
    let ylpVersion = "x.y.z";
    var testServices = [
        {name: "shoreline", url:"http://my.services.com/auth/status", pingTimeout: 5000},
        {name: "gatekeeper", url:"http://my.services.com/access/status", pingTimeout: 5000},
        {name: "tide-whisperer", url:"http://my.services.com/data/status", pingTimeout: 5000}
    ];
    var svc = new Service(testServices, ylpVersion);
    svc.logger.level('warn');
    var services = nock('http://my.services.com');
    before((done) => {
        //prepare services mocking
        services.get('/auth/status').reply(200, "OK")
                .get('/access/status').reply(200,"\"OK\"")
                .get('/data/status').reply(200,"OK");
        svc.start(8080,done);
    });

    describe('When all services are responding correctly', () => {
        let statusResults = [];
        it('the service should return a success code 200 and an array of 4 items, including "yourloops" item', (done) => {
            chai.request(svc.server).get('/status').end((err,res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.eql(4);
                statusResults = res.body;
                done();
            });
        });
        it('all 3 services (excluding "yourloops") should report a status = "OK"', () => {
            // we start at 1 as "yourloops" is #0
            statusResults[1].status.should.eql("OK");
            statusResults[2].status.should.eql("OK");
            statusResults[3].status.should.eql("OK");
        });
        it('all 3 services (excluding "yourloops") should report a detail = "OK"', () => {
            statusResults[1].details.should.eql("OK");
            statusResults[2].details.should.eql("OK");
            statusResults[3].details.should.eql("OK");
        });
        it('"yourloops" item should report a status = 200', () => {
            statusResults[0].status.should.eql(200);
        });
        it('"yourloops" item should have version = ' + ylpVersion, () => {
            statusResults[0].version.should.eql(ylpVersion);
        });
    });
    describe('When one service is down', () => {
        let statusResults = [];
        before(() => {
            //redefine mock urls to make one of them to fail:
            nock.cleanAll();
            services.get('/auth/status').reply(500, "service is down")
                    .get('/access/status').reply(200,"OK")
                    .get('/data/status').reply(200,"OK");
        });
        it('the service should return an http error 503 and an array of 4 items, including "yourloops" item', (done) => {
            chai.request(svc.server).get('/status').end((err,res) => {
                res.should.have.status(503);
                statusResults = res.body;
                res.body.should.be.a('array');
                res.body.length.should.eql(4);
                done();
            });
        });
        it('should return an error for shoreline', () => {           
            let authStatus = statusResults.filter(status => status.service == "shoreline");
            authStatus[0].status.should.eql("NOK");
            authStatus[0].error.should.eql("500 - \"service is down\"");
        });
        it('"yourloops" item should report a status = 503', () => {
            statusResults[0].status.should.eql(503);
        });
        it('"yourloops" item should have version = ' + ylpVersion, () => {
            statusResults[0].version.should.eql(ylpVersion);
        });
    });
    describe('When one service does not respond in a timely manner (timeout)', () => {
        let statusResults = [];
        before(() => {
            //redefine mock urls to make one of them to fail:
            nock.cleanAll();
            services.get('/auth/status').reply(200, "OK")
                    .get('/access/status').reply(200,"OK")
                    .get('/data/status').delay(6000).reply(200,"mongo ping failed");
        });
        it('the service should return an http error 503 and an array of 4 items, including "yourloops" item', (done) => {
            chai.request(svc.server).get('/status').end((err,res) => {
                res.should.have.status(503);
                statusResults = res.body;
                res.body.should.be.a('array');
                res.body.length.should.eql(4);
                done();
            });
        });
        it('should return an error for tide-whisperer', () => {           
            let authStatus = statusResults.filter(status => status.service == "tide-whisperer");
            authStatus[0].status.should.eql("NOK");
            //authStatus[0].error.should.eql("500 - \"cannot reach server\"");
        });
        it('"yourloops" item should report a status = 503', () => {
            statusResults[0].status.should.eql(503);
        });
        it('"yourloops" item should have version = ' + ylpVersion, () => {
            statusResults[0].version.should.eql(ylpVersion);
        });
    });
    describe('Body content should be correctly parsed', () => {
        let statusResults = [];
        const tidewhispererStatus = {status: "OK", version: "1.2.3"};
        before(() => {
            //redefine mock urls to make one of them to fail:
            nock.cleanAll();
            services.get('/auth/status').reply(200, "")
                    .get('/access/status').reply(200,"\"OK\"")
                    .get('/data/status').reply(200,JSON.stringify(tidewhispererStatus));
        });
        it('the service should return an http status 200 and an array of 4 items, including "yourloops" item', (done) => {
            chai.request(svc.server).get('/status').end((err,res) => {
                res.should.have.status(200);
                statusResults = res.body;
                res.body.should.be.a('array');
                res.body.length.should.eql(4);
                done();
            });
        });
        it('An empty body should not generate an error', () => {
            let authStatus = statusResults.filter(status => status.service == "shoreline");          
            authStatus[0].details.should.eql("");
        });
        it('JSON content should be parsed', () => {           
            let result = statusResults.filter(status => status.service == "gatekeeper");
            result[0].details.should.eql("OK");
            result = statusResults.filter(status => status.service == "tide-whisperer");
            result[0].details.should.be.an('object');
            result[0].details.should.eql(tidewhispererStatus);
        });
    });

    after(() => {
        svc.stop();
    });
});