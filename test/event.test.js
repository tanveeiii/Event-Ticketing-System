const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventTicket", function () {
  let EventTicket, eventTicket, owner, user, addr1;

  beforeEach(async function () {
    [owner, user, addr1] = await ethers.getSigners();
    EventTicket = await ethers.getContractFactory("EventTicket");
    eventTicket = await EventTicket.deploy();
    await eventTicket.deployed();
  });

  it("should create an event successfully", async function () {
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

    const eventDetails = await eventTicket.events(0);
    expect(eventDetails.name).to.equal("Concert");
    expect(eventDetails.totalTickets).to.equal(100);
  });

  it("should allow buying a ticket", async function () {
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

    await eventTicket.connect(user).buyTicket(0, "token_uri", {
      value: ethers.utils.parseEther("1"),
    });

    expect(await eventTicket.ownerOf(0)).to.equal(user.address);

    const eventDetails = await eventTicket.events(0);
    expect(eventDetails.ticketsSold).to.equal(1);
  });

  it("should allow reselling a ticket", async function () {
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

    await eventTicket.connect(user).buyTicket(0, "token_uri", {
      value: ethers.utils.parseEther("1"),
    });

    await eventTicket.connect(user).approve(addr1.address, 0);

    // User resells the ticket to addr1
    await expect(() =>
      eventTicket.connect(user).resellTicket(addr1.address, 0, { value: ethers.utils.parseEther("0.5") })
    ).to.changeEtherBalance(user, ethers.utils.parseEther("0.5"));

    expect(await eventTicket.ownerOf(0)).to.equal(addr1.address);
  });

  it("should invalidate ticket", async function () {
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

    await eventTicket.connect(user).buyTicket(0, "token_uri", {
      value: ethers.utils.parseEther("1"),
    });

    await eventTicket.invalidateTicket(0);
    expect(await eventTicket.isTicketValid(0)).to.equal(false);
  });

  it("should fetch user tickets", async function () {
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

    await eventTicket.connect(user).buyTicket(0, "token_uri", {
      value: ethers.utils.parseEther("1"),
    });

    const tickets = await eventTicket.getTicketsOfUser(user.address);
    expect(tickets.length).to.equal(1);
    expect(tickets[0]).to.equal(0);
  });
});
