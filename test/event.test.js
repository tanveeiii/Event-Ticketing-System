const Event = artifacts.require("Event");

contract("Event", (accounts) => {
  let eventInstance;

  beforeEach(async () => {
    eventInstance = await Event.new();
  });

  it("should return 0 initially", async () => {
    const value = await eventInstance.retrieve();
    assert.equal(value.toNumber(), 0, "Initial value is not zero");
  });

  it("should store and retrieve the correct value", async () => {
    await eventInstance.store(42);
    const value = await eventInstance.retrieve();
    assert.equal(value.toNumber(), 42, "Stored value does not match");
  });

  it("should emit ValueChanged event", async () => {
    const tx = await eventInstance.store(100);

    assert.equal(tx.logs[0].event, "ValueChanged", "Event name mismatch");
    assert.equal(tx.logs[0].args.value.toNumber(), 100, "Event value mismatch");
  });
});
