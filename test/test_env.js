let chai = require('chai');
let should = chai.should();

describe("Configuration", () => {
    let config;
    let ylpVersion = "x.y.z";
    before(() => {
        process.env.MONITORED_URLS = JSON.stringify([
            {name: "gatekeeper", url:"http://localhost:9123/status"},
            {name: "hakken", url:"http://localhost:8000/status", "pingTimeout": 3000},
        ]);
        process.env.PING_TIMEOUT = 4000;
        process.env.YLP_VERSION = ylpVersion;
        config = require("../env.js");
    });
    it("Service urls should be parsed correctly", () => {
        config.monitoredServices.should.deep.contain(
            {name: "gatekeeper", url:"http://localhost:9123/status", "pingTimeout": 4000},
            {name: "hakken", url:"http://localhost:8000/status", "pingTimeout": 3000});
    }); 
    it("Global ping timeout should be correctly set", () => {
        config.pingTimeout.should.eql(4000);
    });
    it("Gatekeeper ping timeout should be set with the default value", () => {
        config.monitoredServices[0].pingTimeout.should.eql(4000);
    });
    it("Hakken ping timeout should be set with a custom value", () => {
        config.monitoredServices[1].pingTimeout.should.eql(3000);
    });
    it("YourLoops version should be " + ylpVersion, () => {
        config.ylpVersion.should.eql(ylpVersion);
    });
});