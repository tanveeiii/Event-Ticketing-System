const EventTicket = artifacts.require("EventTicket");
const Marketplace = artifacts.require("TicketMarketplace");

module.exports = async function (deployer) {
  await deployer.deploy(EventTicket);
  const eventTicketInstance = await EventTicket.deployed();

  await deployer.deploy(Marketplace, eventTicketInstance.address);
};