const EventTicket = artifacts.require("EventTicket");
const TicketMarketplace = artifacts.require("TicketMarketplace");

contract("TicketMarketplace", (accounts) => {
  let eventTicket;
  let ticketMarketplace;
  const owner = accounts[0];
  const seller = accounts[1];
  const buyer = accounts[2];

  beforeEach(async () => {
    eventTicket = await EventTicket.new(); // <-- Deploy EventTicket first
    ticketMarketplace = await TicketMarketplace.new(eventTicket.address); // <-- Pass address to marketplace
  });

  it("should allow a ticket to be listed", async () => {
    await eventTicket.createEvent(
      "Marketplace Event",
      Math.floor(Date.now() / 1000) + 3600,
      web3.utils.toWei("0.5", "ether"),
      50,
      "Marketplace Location",
      "Marketplace Description",
      "Marketplace Image",
      "Music",
      { from: owner }
    );

    // seller buys ticket first
    await eventTicket.buyTicket(0, "ipfs://sellerTicket", { from: seller, value: web3.utils.toWei("0.5", "ether") });
    const ticketId = (await eventTicket.getTicketsOfUser(seller))[0];

    // approve marketplace to transfer ticket
    await eventTicket.approve(ticketMarketplace.address, ticketId, { from: seller });

    // seller lists ticket for sale
    await ticketMarketplace.listTicket(ticketId, web3.utils.toWei("1", "ether"), { from: seller });

    const listing = await ticketMarketplace.listings(ticketId);
    assert.equal(listing.price.toString(), web3.utils.toWei("1", "ether"));
    assert.equal(listing.seller, seller);

    it("should allow reselling a ticket", async function () {
      // Create an event
      await eventTicket.createEvent(
          "Concert",
          Date.now() + 100000,
          ethers.utils.parseEther("1"),
          100,
          "NYC",
          "Awesome concert",
          "image_url",
          "Music"
      );
  
      // User buys a ticket
      await eventTicket.connect(user).buyTicket(0, "token_uri", {
          value: ethers.utils.parseEther("1"),
      });
  
      // User lists the ticket for resale
      await eventTicket.connect(user).listTicket(0, ethers.utils.parseEther("0.5"));
  
      // Another user (addr1) buys the ticket from the marketplace
      await eventTicket.connect(addr1).buyTicket(0, { value: ethers.utils.parseEther("0.5") });
  
      // Check the new owner of the ticket
      expect(await eventTicket.ownerOf(0)).to.equal(addr1.address);
  });
  
  });
});
