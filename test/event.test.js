const EventTicket = artifacts.require("EventTicket");

contract("EventTicket", (accounts) => {
  const organizer = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  let eventTicketInstance;
  let eventId;

  beforeEach(async () => {
    eventTicketInstance = await EventTicket.new({ from: organizer });
    const now = Math.floor(Date.now() / 1000);
    await eventTicketInstance.createEvent("Concert", now + 1000, web3.utils.toWei("1", "ether"), 2, { from: organizer });
    eventId = 0;
  });

  it("should create an event correctly", async () => {
    const event = await eventTicketInstance.events(eventId);
    assert.equal(event.name, "Concert", "Event name should be 'Concert'");
    assert.equal(event.organizer, organizer, "Organizer address should match");
  });

  it("should allow users to buy a ticket", async () => {
    const tokenURI = "ipfs://example-token-uri";
    await eventTicketInstance.buyTicket(eventId, tokenURI, {
      from: user1,
      value: web3.utils.toWei("1", "ether")
    });

    const owner = await eventTicketInstance.ownerOf(0);
    assert.equal(owner, user1, "Ticket owner should be user1");
  });

  it("should fail if buying more tickets than available", async () => {
    const tokenURI = "ipfs://example-token-uri";
    await eventTicketInstance.buyTicket(eventId, tokenURI, {
      from: user1,
      value: web3.utils.toWei("1", "ether")
    });
    await eventTicketInstance.buyTicket(eventId, tokenURI, {
      from: user2,
      value: web3.utils.toWei("1", "ether")
    });

    try {
      await eventTicketInstance.buyTicket(eventId, tokenURI, {
        from: accounts[3],
        value: web3.utils.toWei("1", "ether")
      });
      assert.fail("Should not be able to buy more tickets than available");
    } catch (error) {
      assert(error.message.includes("Sold out"), "Expected 'Sold out' error");
    }
  });

  it("should allow ticket resale", async () => {
    const tokenURI = "ipfs://resale-test";
    await eventTicketInstance.buyTicket(eventId, tokenURI, {
      from: user1,
      value: web3.utils.toWei("1", "ether")
    });

    await eventTicketInstance.resellTicket(user2, 0, { from: user1 });

    const newOwner = await eventTicketInstance.ownerOf(0);
    assert.equal(newOwner, user2, "New owner should be user2");
  });

  it("should prevent resell from non-owners", async () => {
    const tokenURI = "ipfs://resale-test";
    await eventTicketInstance.buyTicket(eventId, tokenURI, {
      from: user1,
      value: web3.utils.toWei("1", "ether")
    });

    try {
      await eventTicketInstance.resellTicket(user2, 0, { from: user2 });
      assert.fail("Should not allow resale by non-owner");
    } catch (error) {
      assert(error.message.includes("Not the ticket owner"), "Expected ownership error");
    }
  });
});
