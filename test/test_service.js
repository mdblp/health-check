let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
var Service = require("../service.js");
var nock = require("nock");

chai.use(chaiHttp);

describe('Global health check service', () => {
    
    var testServices = [
        {"name": "shoreline", "url":"http://my.services.com/auth/status"},
        {"name": "gatekeeper", "url":"http://my.services.com/access/status"},
        {"name": "tide-whisperer", "url":"http://my.services.com/data/status"}
    ];
    var svc = new Service(testServices);
    svc.logger.level('warn');
    var services = nock('http://my.services.com');
    before((done) => {
        //prepare services mocking
        services.get('/auth/status').reply(200, "OK")
                .get('/access/status').reply(200,"OK")
                .get('/data/status').reply(200,"OK");
        svc.start(8080,done);
    });

    describe('When all services are responding correctly', () => {
        it('should return http 200', (done) => {
            chai.request(svc.server).get('/status').end((err,res) => {
                res.should.have.status(200);
                //res.body.shoud.be.a('object'); //that.eql({something expected})
                done();
            });
        });
    });
    describe('When one service does not respond', () => {
        it('should return http 503', (done) => {
            //redefine mock urls to make one of them to fail:
            nock.cleanAll();
            services.get('/auth/status').reply(500, "OK")
                    .get('/access/status').reply(200,"OK")
                    .get('/data/status').reply(200,"OK");
            chai.request(svc.server).get('/status').end((err,res) => {
                res.should.have.status(503);
                //res.body.shoud.be.a('object'); //that.eql({something expected})
                done();
            });
        });
    });

    after(() => {
        svc.stop();
    });
});