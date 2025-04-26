const EventTicket = artifacts.require("EventTicket");

contract("EventTicket", (accounts) => {
  let eventTicket, owner, user, addr1;

  beforeEach(async () => {
    eventTicket = await EventTicket.new();  
    owner = accounts[0];
    user = accounts[1];
    addr1 = accounts[2];
  });

  it("should create an event successfully", async () => {
    await eventTicket.createEvent(
      "Concert",
      Math.floor(Date.now() / 1000) + 3600,
      web3.utils.toWei("1", "ether"),
      100,
      "NYC",
      "Awesome concert",
      "image_url",
      "Music",
      { from: owner }
    );

    const eventDetails = await eventTicket.events(0);
    assert.equal(eventDetails.name, "Concert");
    assert.equal(eventDetails.totalTickets.toString(), "100");
  });

  it("should allow buying a ticket", async function () {
    await eventTicket.createEvent(
      "Concert",
      Date.now() + 100000,
      web3.utils.toWei("1", "ether"),
      100,
      "NYC",
      "Awesome concert",
      "image_url",
      "Music",
      { from: owner }
    );

    await eventTicket.buyTicket(0, "token_uri", {
      value: web3.utils.toWei("1", "ether"),
      from: user
    });

    const ticketOwner = await eventTicket.ownerOf(0);
    assert.equal(ticketOwner, user);

    const eventDetails = await eventTicket.events(0);
    assert.equal(eventDetails.ticketsSold.toString(), "1");
  });

  // it("should allow reselling a ticket", async function () {
  //   await eventTicket.createEvent(
  //     "Concert",
  //     Date.now() + 100000,
  //     web3.utils.toWei("1", "ether"),
  //     100,
  //     "NYC",
  //     "Awesome concert",
  //     "image_url",
  //     "Music",
  //     { from: owner }
  //   );

  //   await eventTicket.buyTicket(0, "token_uri", {
  //     value: web3.utils.toWei("1", "ether"),
  //     from: user
  //   });

  //   await eventTicket.approve(addr1, 0, { from: user });

  //   // User resells the ticket to addr1
  //   // await eventTicket.resellTicket(addr1, 0, web3.utils.toWei("0.5", "ether"), { from: user });

  //   const ticketOwner = await eventTicket.ownerOf(0);
  //   assert.equal(ticketOwner, addr1);
  // });

  it("should invalidate ticket", async function () {
    await eventTicket.createEvent(
      "Concert",
      Date.now() + 100000,
      web3.utils.toWei("1", "ether"),
      100,
      "NYC",
      "Awesome concert",
      "image_url",
      "Music",
      { from: owner }
    );

    await eventTicket.buyTicket(0, "token_uri", {
      value: web3.utils.toWei("1", "ether"),
      from: user
    });

    await eventTicket.invalidateTicket(0, { from: owner });
    const isValid = await eventTicket.isTicketValid(0);
    assert.equal(isValid, false);
  });

  it("should fetch user tickets", async function () {
    await eventTicket.createEvent(
      "Concert",
      Date.now() + 100000,
      web3.utils.toWei("1", "ether"),
      100,
      "NYC",
      "Awesome concert",
      "image_url",
      "Music",
      { from: owner }
    );

    await eventTicket.buyTicket(0, "token_uri", {
      value: web3.utils.toWei("1", "ether"),
      from: user
    });

    const tickets = await eventTicket.getTicketsOfUser(user);
    assert.equal(tickets.length, 1);
    assert.equal(tickets[0].toString(), "0");
  });
});
