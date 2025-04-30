const EventTicket = artifacts.require("EventTicket");
const {
  BN,
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

contract("EventTicket", (accounts) => {
  const [owner, organizer, buyer1, buyer2] = accounts;
  const eventName = "Test Concert";
  const eventDate = Math.floor(Date.now() / 1000) + 86400; // tomorrow
  const price = web3.utils.toWei("0.1", "ether");
  const totalTickets = 100;
  const location = "Test Venue";
  const description = "A test concert event";
  const imageUrl = "https://example.com/image.jpg";
  const category = "Music";
  const maxTicketsPerBuyer = 3;
  const tokenURI = "https://example.com/metadata/1";

  let eventTicket;
  let eventId;

  beforeEach(async () => {
    eventTicket = await EventTicket.new({ from: owner });

    // Create a test event
    const tx = await eventTicket.createEvent(
      eventName,
      eventDate,
      price,
      totalTickets,
      location,
      description,
      imageUrl,
      category,
      maxTicketsPerBuyer,
      { from: organizer }
    );

    // Get the eventId from the event
    const eventCreatedEvent = tx.logs.find(
      (log) => log.event === "EventCreated"
    );
    eventId = eventCreatedEvent.args.eventId.toNumber();
  });

  describe("Event Creation", () => {
    it("should create an event with correct parameters", async () => {
      const event = await eventTicket.events(eventId);

      assert.equal(event.name, eventName, "Event name mismatch");
      assert.equal(
        event.date.toString(),
        eventDate.toString(),
        "Event date mismatch"
      );
      assert.equal(event.location, location, "Event location mismatch");
      assert.equal(
        event.description,
        description,
        "Event description mismatch"
      );
      assert.equal(event.imageUrl, imageUrl, "Event image URL mismatch");
      assert.equal(
        event.price.toString(),
        price.toString(),
        "Event price mismatch"
      );
      assert.equal(
        event.totalTickets.toNumber(),
        totalTickets,
        "Total tickets mismatch"
      );
      assert.equal(
        event.ticketsSold.toNumber(),
        0,
        "Initial tickets sold should be 0"
      );
      assert.equal(event.organizer, organizer, "Event organizer mismatch");
      assert.equal(event.category, category, "Event category mismatch");
      assert.equal(
        event.maxTicketsPerBuyer.toNumber(),
        maxTicketsPerBuyer,
        "Max tickets per buyer mismatch"
      );
    });

    it("should emit EventCreated event", async () => {
      const tx = await eventTicket.createEvent(
        "Another Event",
        eventDate,
        price,
        totalTickets,
        location,
        description,
        imageUrl,
        category,
        maxTicketsPerBuyer,
        { from: organizer }
      );

      expectEvent(tx, "EventCreated", {
        eventName: "Another Event",
        eventDate: new BN(eventDate),
        eventPrice: new BN(price),
        totalTickets: new BN(totalTickets),
        location: location,
        organizer: organizer,
        maxTicketsPerBuyer: new BN(maxTicketsPerBuyer),
      });
    });

    it("should reject an event with past date", async () => {
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // yesterday

      await expectRevert(
        eventTicket.createEvent(
          eventName,
          pastDate,
          price,
          totalTickets,
          location,
          description,
          imageUrl,
          category,
          maxTicketsPerBuyer,
          { from: organizer }
        ),
        "Event must be in the future"
      );
    });

    it("should reject an event with 0 tickets", async () => {
      await expectRevert(
        eventTicket.createEvent(
          eventName,
          eventDate,
          price,
          0,
          location,
          description,
          imageUrl,
          category,
          maxTicketsPerBuyer,
          { from: organizer }
        ),
        "Tickets must be more than 0"
      );
    });

    it("should cap maxTicketsPerBuyer to global limit if too high", async () => {
      const globalLimit = await eventTicket.MAX_TICKETS_PER_USER();
      const tooHighLimit = globalLimit.toNumber() + 1;

      const tx = await eventTicket.createEvent(
        "Event with high limit",
        eventDate,
        price,
        totalTickets,
        location,
        description,
        imageUrl,
        category,
        tooHighLimit,
        { from: organizer }
      );

      const newEventId = tx.logs
        .find((log) => log.event === "EventCreated")
        .args.eventId.toNumber();
      const event = await eventTicket.events(newEventId);

      assert.equal(
        event.maxTicketsPerBuyer.toNumber(),
        globalLimit.toNumber(),
        "Max tickets should be capped to global limit"
      );
    });
  });

  describe("Ticket Purchase", () => {
    it("should allow buying a single ticket", async () => {
      const initialBalance = new BN(await web3.eth.getBalance(organizer));

      const tx = await eventTicket.buyTicket(eventId, tokenURI, {
        from: buyer1,
        value: price,
      });

      // Check token ownership
      const tokenId = new BN(0); // First token ID is 0
      const tokenOwner = await eventTicket.ownerOf(tokenId);
      assert.equal(tokenOwner, buyer1, "Buyer should own the ticket");

      // Check token URI
      const actualTokenURI = await eventTicket.tokenURI(tokenId);
      assert.equal(actualTokenURI, tokenURI, "Token URI mismatch");

      // Check ticket validity
      const isValid = await eventTicket.isTicketValid(tokenId);
      assert.isTrue(isValid, "Ticket should be valid");

      // Check ticket to event mapping
      const ticketEventId = await eventTicket.ticketToEvent(tokenId);
      assert.equal(
        ticketEventId.toNumber(),
        eventId,
        "Ticket should be mapped to correct event"
      );

      // Check event ticket count updated
      const event = await eventTicket.events(eventId);
      assert.equal(
        event.ticketsSold.toNumber(),
        1,
        "Tickets sold should increment"
      );

      // Check user ticket count
      const userTickets = await eventTicket.getUserTicketCount(buyer1, eventId);
      assert.equal(userTickets.toNumber(), 1, "User should have 1 ticket");

      // Check payment transferred to organizer
      const finalBalance = new BN(await web3.eth.getBalance(organizer));
      assert.isTrue(
        finalBalance.sub(initialBalance).eq(new BN(price)),
        "Organizer should receive payment"
      );

      // Check events emitted
      expectEvent(tx, "TicketPurchased", {
        eventId: new BN(eventId),
        buyer: buyer1,
        tokenId: tokenId,
        purchaseCount: new BN(1),
      });

      expectEvent(tx, "PaymentTransferred", {
        organizer: organizer,
        amount: new BN(price),
      });
    });

    it("should allow buying multiple tickets", async () => {
      const quantity = 3;
      const tokenURIs = [
        "https://example.com/metadata/1",
        "https://example.com/metadata/2",
        "https://example.com/metadata/3",
      ];
      const totalPrice = new BN(price).mul(new BN(quantity));

      const tx = await eventTicket.buyMultipleTickets(
        eventId,
        tokenURIs,
        quantity,
        { from: buyer1, value: totalPrice }
      );

      // Check token ownership
      for (let i = 0; i < quantity; i++) {
        const tokenId = new BN(i);
        const tokenOwner = await eventTicket.ownerOf(tokenId);
        assert.equal(tokenOwner, buyer1, `Buyer should own ticket ${i}`);

        // Check token URI
        const actualTokenURI = await eventTicket.tokenURI(tokenId);
        assert.equal(
          actualTokenURI,
          tokenURIs[i],
          `Token URI mismatch for token ${i}`
        );
      }

      // Check event ticket count updated
      const event = await eventTicket.events(eventId);
      assert.equal(
        event.ticketsSold.toNumber(),
        quantity,
        "Tickets sold should increment by quantity"
      );

      // Check user ticket count
      const userTickets = await eventTicket.getUserTicketCount(buyer1, eventId);
      assert.equal(
        userTickets.toNumber(),
        quantity,
        `User should have ${quantity} tickets`
      );

      // Check event
      expectEvent(tx, "TicketPurchased", {
        eventId: new BN(eventId),
        buyer: buyer1,
        tokenId: new BN(0),
        purchaseCount: new BN(quantity),
      });
    });

    it("should reject purchase if event doesn't exist", async () => {
      const nonExistentEventId = 999;

      await expectRevert(
        eventTicket.buyTicket(nonExistentEventId, tokenURI, {
          from: buyer1,
          value: price,
        }),
        "Event does not exist"
      );
    });

    it("should reject purchase with incorrect payment amount", async () => {
      const incorrectPrice = web3.utils.toWei("0.05", "ether");

      await expectRevert(
        eventTicket.buyTicket(eventId, tokenURI, {
          from: buyer1,
          value: incorrectPrice,
        }),
        "Incorrect amount"
      );
    });

    it("should reject purchase if exceeding max tickets per buyer", async () => {
      // Buy max tickets
      const tokenURIs = Array(maxTicketsPerBuyer)
        .fill()
        .map((_, i) => `https://example.com/metadata/${i}`);
      const totalPrice = new BN(price).mul(new BN(maxTicketsPerBuyer));

      await eventTicket.buyMultipleTickets(
        eventId,
        tokenURIs,
        maxTicketsPerBuyer,
        { from: buyer1, value: totalPrice }
      );

      // Try to buy one more
      await expectRevert(
        eventTicket.buyTicket(eventId, "https://example.com/metadata/excess", {
          from: buyer1,
          value: price,
        }),
        "Exceeds maximum tickets per buyer"
      );
    });

    it("should reject purchase if event sold out", async () => {
      // Create event with only 1 ticket
      const smallEventTx = await eventTicket.createEvent(
        "Small Event",
        eventDate,
        price,
        1, // only 1 ticket
        location,
        description,
        imageUrl,
        category,
        maxTicketsPerBuyer,
        { from: organizer }
      );

      const smallEventId = smallEventTx.logs
        .find((log) => log.event === "EventCreated")
        .args.eventId.toNumber();

      // Buy the only ticket
      await eventTicket.buyTicket(smallEventId, tokenURI, {
        from: buyer1,
        value: price,
      });

      // Try to buy another ticket
      await expectRevert(
        eventTicket.buyTicket(
          smallEventId,
          "https://example.com/metadata/another",
          { from: buyer2, value: price }
        ),
        "Sold out"
      );
    });

    it("should reject purchase if event has already occurred", async () => {
      // Create event
      const nearFutureTx = await eventTicket.createEvent(
        "Near Future Event",
        eventDate,
        price,
        totalTickets,
        location,
        description,
        imageUrl,
        category,
        maxTicketsPerBuyer,
        { from: organizer }
      );

      const nearFutureEventId = nearFutureTx.logs
        .find((log) => log.event === "EventCreated")
        .args.eventId.toNumber();

      // Advance time past event date
      await time.increaseTo(eventDate + 1);

      // Try to buy a ticket
      await expectRevert(
        eventTicket.buyTicket(nearFutureEventId, tokenURI, {
          from: buyer1,
          value: price,
        }),
        "Event already occurred"
      );
    });
  });

  describe("Ticket Management", () => {
    let tokenId;

    beforeEach(async () => {
      // Buy a ticket first
      const tx = await eventTicket.buyTicket(eventId, tokenURI, {
        from: buyer1,
        value: price,
      });

      tokenId = 0; // First token ID
    });

    it("should allow organizer to invalidate a ticket", async () => {
      await eventTicket.invalidateTicket(tokenId, { from: organizer });

      const isValid = await eventTicket.isTicketValid(tokenId);
      assert.isFalse(isValid, "Ticket should be invalidated");
    });

    it("should allow contract owner to invalidate a ticket", async () => {
      await eventTicket.invalidateTicket(tokenId, { from: owner });

      const isValid = await eventTicket.isTicketValid(tokenId);
      assert.isFalse(isValid, "Ticket should be invalidated");
    });

    it("should reject ticket invalidation from non-organizer or non-owner", async () => {
      await expectRevert(
        eventTicket.invalidateTicket(tokenId, { from: buyer2 }),
        "Only organizer or owner can invalidate"
      );
    });

    it("should correctly get user's ticket IDs", async () => {
      // Buy multiple tickets
      const quantity = 3;
      const tokenURIs = [
        "https://example.com/metadata/1",
        "https://example.com/metadata/2",
        "https://example.com/metadata/3",
      ];
      const totalPrice = new BN(price).mul(new BN(quantity));

      await eventTicket.buyMultipleTickets(eventId, tokenURIs, quantity, {
        from: buyer2,
        value: totalPrice,
      });

      // Get buyer2's tickets
      const tickets = await eventTicket.getTicketsOfUser(buyer2);

      assert.equal(
        tickets.length,
        quantity,
        "Should return correct number of tickets"
      );

      // Check ticket IDs (starting from 1 since buyer1 has token 0)
      for (let i = 0; i < quantity; i++) {
        assert.equal(
          tickets[i].toNumber(),
          i + 1,
          `Incorrect token ID at index ${i}`
        );
      }
    });

    it("should correctly get event from token", async () => {
      const event = await eventTicket.getEventFromToken(tokenId);

      assert.equal(event.name, eventName, "Event name mismatch");
      assert.equal(event.organizer, organizer, "Event organizer mismatch");
    });
  });

  describe("Event Management", () => {
    it("should allow organizer to add more tickets", async () => {
      const additionalTickets = 50;

      await eventTicket.addTickets(eventId, additionalTickets, {
        from: organizer,
      });

      const event = await eventTicket.events(eventId);
      assert.equal(
        event.totalTickets.toNumber(),
        totalTickets + additionalTickets,
        "Total tickets should increase"
      );
    });

    it("should reject adding tickets if not organizer", async () => {
      await expectRevert(
        eventTicket.addTickets(eventId, 50, { from: buyer1 }),
        "Only organizer can add tickets"
      );
    });

    it("should allow organizer to update max tickets per buyer", async () => {
      const newMaxTickets = 2;

      await eventTicket.updateMaxTicketsPerBuyer(eventId, newMaxTickets, {
        from: organizer,
      });

      const event = await eventTicket.events(eventId);
      assert.equal(
        event.maxTicketsPerBuyer.toNumber(),
        newMaxTickets,
        "Max tickets per buyer should update"
      );
    });

    it("should cap updated max tickets to global limit", async () => {
      const globalLimit = await eventTicket.MAX_TICKETS_PER_USER();
      const tooHighLimit = globalLimit.toNumber() + 5;

      await eventTicket.updateMaxTicketsPerBuyer(eventId, tooHighLimit, {
        from: organizer,
      });

      const event = await eventTicket.events(eventId);
      assert.equal(
        event.maxTicketsPerBuyer.toNumber(),
        globalLimit.toNumber(),
        "Max tickets should be capped to global limit"
      );
    });

    it("should reject updating max tickets if not organizer", async () => {
      await expectRevert(
        eventTicket.updateMaxTicketsPerBuyer(eventId, 2, { from: buyer1 }),
        "Only organizer can update ticket limit"
      );
    });
  });

  describe("Fallback function", () => {
    it("should execute fallback function when called with data", async () => {
      // Send transaction with data to trigger fallback
      await web3.eth.sendTransaction({
        from: buyer1,
        to: eventTicket.address,
        value: web3.utils.toWei("0.01", "ether"),
        data: "0x1234",
      });

      const fallbackResult = await eventTicket.calledFallbackFun();
      assert.equal(
        fallbackResult,
        "Fallback function is executed!",
        "Fallback function should be executed"
      );
    });

    it("should accept ETH through receive function", async () => {
      const initialBalance = new BN(
        await web3.eth.getBalance(eventTicket.address)
      );
      const sendAmount = web3.utils.toWei("0.1", "ether");

      // Send ETH without data to trigger receive
      await web3.eth.sendTransaction({
        from: buyer1,
        to: eventTicket.address,
        value: sendAmount,
      });

      const finalBalance = new BN(
        await web3.eth.getBalance(eventTicket.address)
      );
      assert.isTrue(
        finalBalance.sub(initialBalance).eq(new BN(sendAmount)),
        "Contract should receive ETH"
      );
    });
  });
});
