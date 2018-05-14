var Bikes = artifacts.require("Bikes");

module.exports = function(deployer) {
  deployer.deploy(Bikes);
};