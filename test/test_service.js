const chai = require('chai');
const chaiHttp = require('chai-http');
const Service = require("../service.js");
const nock = require("nock");

chai.should();
chai.use(chaiHttp);

describe('Global health check service', () => {

  const hcName = "health-check";
  const hcVersion = "0.0.1";
  const ylpVersion = "x.y.z";
  const testServices = [
    { name: "shoreline", url: "http://my.services.com/auth/status", pingTimeout: 5000 },
    { name: "gatekeeper", url: "http://my.services.com/access/status", pingTimeout: 5000 },
    { name: "tide-whisperer", url: "http://my.services.com/data/status", pingTimeout: 5000 }
  ];
  const svc = new Service(testServices, ylpVersion, hcName, hcVersion);
  svc.logger.level('warn');
  const services = nock('http://my.services.com');

  const { responseCode, responseStatus } = Service;

  before((done) => {
    // prepare services mocking
    // "access" service is returning malformed JSON so let's ensure the service is able to work with that
    services.get('/auth/status').reply(200, "OK")
      .get('/access/status').reply(200, "\"OK\"")
      .get('/data/status').reply(200, "OK");
    svc.start(8080, done);
  });

  describe('When all services are responding correctly', () => {
    let statusResults = [];
    it('the service should return a success code and an array of 5 items, including "yourloops" and "health-checks" item', (done) => {
      chai.request(svc.server).get('/status').end((err, res) => {
        res.should.have.status(responseCode.success);
        res.body.should.be.a('array');
        res.body.length.should.eql(5);
        statusResults = res.body;
        done();
      });
    });
    it('all 3 services (excluding "yourloops" and "health-checks") should report a status success', () => {
      // we start at 1 as "yourloops" is #0
      statusResults[1].status.should.eql(responseStatus.success);
      statusResults[2].status.should.eql(responseStatus.success);
      statusResults[3].status.should.eql(responseStatus.success);
    });
    it('all 3 services (excluding "yourloops" and "health-checks") should report a "details" = "OK"', () => {
      statusResults[1].details.should.eql(responseStatus.success);
      statusResults[2].details.should.eql(responseStatus.success);
      statusResults[3].details.should.eql(responseStatus.success);
    });
    it('"yourloops" item should report a status success', () => {
      statusResults[0].status.should.eql(responseStatus.success);
    });
    it('"yourloops" item should have version = ' + ylpVersion, () => {
      statusResults[0].version.should.eql(ylpVersion);
    });
    it('"health-checks" item should report a status success', () => {
      statusResults[4].status.should.eql(responseStatus.success);
    });
    it('"health-checks" item should have version = ' + ylpVersion, () => {
      statusResults[4].version.should.eql(hcVersion);
    });
  });
  describe('When one service is down', () => {
    let statusResults = [];
    before(() => {
      //redefine mock urls to make one of them to fail:
      nock.cleanAll();
      services.get('/auth/status').reply(500, "service is down")
        .get('/access/status').reply(200, responseStatus.success)
        .get('/data/status').reply(200, responseStatus.success);
    });
    it('the service should return a status failure and an array of 4 items, including "yourloops" and "health-checks" item', (done) => {
      chai.request(svc.server).get('/status').end((err, res) => {
        res.should.have.status(responseCode.failure);
        statusResults = res.body;
        res.body.should.be.an('array');
        res.body.length.should.eql(5);
        done();
      });
    });
    it('should return an error for shoreline/auth', () => {
      let authStatus = statusResults.filter(status => status.service == "shoreline");
      authStatus[0].status.should.eql(responseStatus.failure);
      authStatus[0].error.should.eql("500 - \"service is down\"");
    });
    it('"yourloops" item should report a status code failure', () => {
      statusResults[0].status.should.eql(responseStatus.failure);
    });
    it('"yourloops" item should have version = ' + ylpVersion, () => {
      statusResults[0].version.should.eql(ylpVersion);
    });
    it('"health-checks" item should report a status success', () => {
      statusResults[4].status.should.eql(responseStatus.success);
    });
    it('"health-checks" item should have version = ' + ylpVersion, () => {
      statusResults[4].version.should.eql(hcVersion);
    });
  });
  describe('When one service does not respond in a timely manner (timeout)', () => {
    let statusResults = [];
    before(() => {
      //redefine mock urls to make one of them to fail:
      nock.cleanAll();
      services.get('/auth/status').reply(responseCode.success, responseStatus.success)
        .get('/access/status').reply(responseCode.success, responseStatus.success)
        .get('/data/status').delay(6000).reply(responseCode.failure, "mongo ping failed");
    });
    it('the service should return a code failure and an array of 5 items, including "yourloops" and "health-checks" item', (done) => {
      chai.request(svc.server).get('/status').end((err, res) => {
        res.should.have.status(responseCode.failure);
        statusResults = res.body;
        res.body.should.be.an('array');
        res.body.length.should.eql(5);
        done();
      });
    });
    it('should return an error for tide-whisperer', () => {
      let authStatus = statusResults.filter(status => status.service == "tide-whisperer");
      authStatus[0].status.should.eql(responseStatus.failure);
    });
    it('"yourloops" item should report a status failure', () => {
      statusResults[0].status.should.eql(responseStatus.failure);
    });
    it('"yourloops" item should have version = ' + ylpVersion, () => {
      statusResults[0].version.should.eql(ylpVersion);
    });
    it('"health-checks" item should report a status success', () => {
      statusResults[4].status.should.eql(responseStatus.success);
    });
    it('"health-checks" item should have version = ' + ylpVersion, () => {
      statusResults[4].version.should.eql(hcVersion);
    });
  });
  describe('Body content should be correctly parsed', () => {
    let statusResults = [];
    const tidewhispererStatus = { status: responseStatus.success, version: "1.2.3" };
    before(() => {
      // redefine mock urls to make one of them to fail
      // "access" service is returning malformed JSON so let's ensure the service is able to work with that
      nock.cleanAll();
      services.get('/auth/status').reply(200, "")
        .get('/access/status').reply(200, "\"OK\"")
        .get('/data/status').reply(200, JSON.stringify(tidewhispererStatus));
    });
    it('the service should return an http status success and an array of 5 items, including "yourloops" and "health-checks" item', (done) => {
      chai.request(svc.server).get('/status').end((err, res) => {
        res.should.have.status(responseCode.success);
        statusResults = res.body;
        res.body.should.be.a('array');
        res.body.length.should.eql(5);
        done();
      });
    });
    it('An empty body should not generate an error', () => {
      let authStatus = statusResults.filter(status => status.service == "shoreline");
      authStatus[0].details.should.eql("");
    });
    it('JSON content should be parsed', () => {
      let result = statusResults.filter(status => status.service == "gatekeeper");
      result[0].details.should.eql(responseStatus.success);
      result = statusResults.filter(status => status.service == "tide-whisperer");
      result[0].details.should.be.an('object');
      result[0].details.should.eql(tidewhispererStatus);
    });
  });

  after(() => {
    svc.stop();
  });
});
