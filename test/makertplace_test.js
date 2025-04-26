const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketMarketplace", function () {
  let EventTicket, eventTicket, TicketMarketplace, marketplace, owner, buyer, seller;

  beforeEach(async function () {
    [owner, buyer, seller, addr1] = await ethers.getSigners();

    EventTicket = await ethers.getContractFactory("EventTicket");
    eventTicket = await EventTicket.deploy();
    await eventTicket.deployed();

    TicketMarketplace = await ethers.getContractFactory("TicketMarketplace");
    marketplace = await TicketMarketplace.deploy(eventTicket.address);
    await marketplace.deployed();

    // Seller creates an event and buys a ticket
    await eventTicket.connect(seller).createEvent("Concert", Date.now() + 100000, ethers.utils.parseEther("1"), 100, "NYC", "Awesome concert", "image_url", "Music");
    await eventTicket.connect(seller).buyTicket(0, "token_uri");
  });

  it("should allow a ticket to be listed", async function () {
    await eventTicket.connect(seller).approve(marketplace.address, 0);
    await marketplace.connect(seller).listTicket(0, ethers.utils.parseEther("2"));

    const listing = await marketplace.getListing(0);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.price).to.equal(ethers.utils.parseEther("2"));
  });

  it("should allow buying a listed ticket", async function () {
    await eventTicket.connect(seller).approve(marketplace.address, 0);
    await marketplace.connect(seller).listTicket(0, ethers.utils.parseEther("2"));

    await expect(() =>
      marketplace.connect(buyer).buyTicket(0, { value: ethers.utils.parseEther("2") })
    ).to.changeEtherBalances(
      [buyer, seller],
      [ethers.utils.parseEther("-2"), ethers.utils.parseEther("2")]
    );

    expect(await eventTicket.ownerOf(0)).to.equal(buyer.address);
  });

  it("should allow a seller to cancel a listing", async function () {
    await eventTicket.connect(seller).approve(marketplace.address, 0);
    await marketplace.connect(seller).listTicket(0, ethers.utils.parseEther("2"));

    await marketplace.connect(seller).cancelListing(0);
    const listing = await marketplace.getListing(0);
    expect(listing.seller).to.equal(ethers.constants.AddressZero);
  });

  it("should fetch all listings correctly", async function () {
    await eventTicket.connect(seller).approve(marketplace.address, 0);
    await marketplace.connect(seller).listTicket(0, ethers.utils.parseEther("2"));

    const [listings, tokenIds] = await marketplace.getAllListings();
    expect(listings.length).to.equal(1);
    expect(tokenIds.length).to.equal(1);
    expect(listings[0].seller).to.equal(seller.address);
  });
});
