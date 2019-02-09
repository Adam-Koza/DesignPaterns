const OwnerDemo = artifacts.require("OwnerDemo");
const WhiteListDocuments = artifacts.require("WhiteListDocuments");

module.exports = function(deployer) {
  deployer.deploy(OwnerDemo);
  deployer.deploy(WhiteListDocuments);
};
