const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const OwnerDemo = artifacts.require("OwnerDemo");

const mode = process.env.MODE;

let ownerDemoInstance;

contract("OwnerDemo", accounts => {

  before(async function () {
    ownerDemoInstance = await OwnerDemo.deployed();
  });


  after("write coverage/profiler output", async () => {
    if (mode === "profile") {
      await global.profilerSubprovider.writeProfilerOutputAsync();
    } else if (mode === "coverage") {
      await global.coverageSubprovider.writeCoverageAsync();
    }
  });



  it("should set owner correctly", async () => {
    const owner = accounts[0];
    const accountTwo = accounts[1];
    if (mode === "profile") {
      global.profilerSubprovider.start();
    }
    //await ownerDemoInstance.sendCoin(
    //  accountTwo,
    //  amount,
    //  { from: accountOne }
    //);
    assert.equal(await ownerDemoInstance.owner(), owner);
    if (mode === "profile") {
      global.profilerSubprovider.stop();
    }
  });

  it("Should allow owner to call functions with the onlyOwner modifier.", async () => {
    const currentOwner = accounts[0];
    const newOwner = accounts[1];

    assert.equal(await ownerDemoInstance.owner(), currentOwner);
    const {logs} = await ownerDemoInstance.transferOwner(newOwner);
    assert.equal(await ownerDemoInstance.owner(), newOwner);
  });


  it("Should fail if a non-owner calls functions with the onlyOwner modifier.", async () => {
    const currentOwner = accounts[1];
    const nonOwner = accounts[2];

    try {
      await ownerDemoInstance.transferOwner(nonOwner, { from: nonOwner });
      assert.equal(await ownerDemoInstance.owner(), nonOwner);
    } catch (err) {
      assert.equal(await ownerDemoInstance.owner(), currentOwner);
    }

    // open zeppelin.
    await shouldFail.reverting(ownerDemoInstance.transferOwner(nonOwner, { from: nonOwner }));
  });


  it("Should emit transfer event to logs.", async () => {
    const currentOwner = accounts[1];
    const nonOwner = accounts[2];
    const { logs } = await ownerDemoInstance.transferOwner(nonOwner, { from: currentOwner });
    await expectEvent.inLogs(logs, 'OwnershipTransferred', {previousOwner: accounts[1], newOwner: accounts[2]});
  });


});
