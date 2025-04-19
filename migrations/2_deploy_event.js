const EventTicket = artifacts.require("EventTicket");

module.exports = function (deployer) {
  deployer.deploy(EventTicket, 12); // Adding gas limit
};
