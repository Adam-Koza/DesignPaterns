const { expectEvent, shouldFail, shouldNotFail } = require('openzeppelin-test-helpers');
const WhiteListDocuments = artifacts.require("WhiteListDocuments");

const mode = process.env.MODE;

let whiteListDocumentsInstance;

contract("WhiteListDocuments", accounts => {

    before(async function () {
        whiteListDocumentsInstance = await WhiteListDocuments.deployed();
        console.log("");
        console.log("Constructor:");
    });


    after("write coverage/profiler output", async () => {
        if (mode === "profile") {
            await global.profilerSubprovider.writeProfilerOutputAsync();
        } else if (mode === "coverage") {
            await global.coverageSubprovider.writeCoverageAsync();
        }
    });



    ////////////////////////////////////////
    //
    //          CONSTRUCTOR:
    //
    ////////////////////////////////////////




    it("should set owner correctly.", async () => {
        const owner = accounts[0];
        if (mode === "profile") {
            global.profilerSubprovider.start();
        }

        assert.equal(await whiteListDocumentsInstance.owner(), owner);
        if (mode === "profile") {
            global.profilerSubprovider.stop();
        }
    });

    it("Should add owner to the white list.", async () => {
        const owner = accounts[0];

        assert.equal(await whiteListDocumentsInstance.whiteList(owner), true);
    });




    ////////////////////////////////////////
    // 
    //          MODIFIERS:
    //
    ////////////////////////////////////////





    it("Should allow owner to call functions with the onlyOwner modifier.", async () => {
        console.log("");
        console.log("Modifiers:");
        const currentOwner = accounts[0];
        const newOwner = accounts[1];

        assert.equal(await whiteListDocumentsInstance.owner(), currentOwner);
        await whiteListDocumentsInstance.transferOwner(newOwner);
        assert.equal(await whiteListDocumentsInstance.owner(), newOwner);
        assert.equal(await whiteListDocumentsInstance.whiteList(currentOwner), false);
        await whiteListDocumentsInstance.addToWhiteList(currentOwner, {from: newOwner});
        assert.equal(await whiteListDocumentsInstance.whiteList(currentOwner), true);
        await whiteListDocumentsInstance.removeFromWhiteList(currentOwner, {from: newOwner});
        assert.equal(await whiteListDocumentsInstance.whiteList(currentOwner), false);

    });


    it("Should fail if a non-owner calls functions with the onlyOwner modifier.", async () => {
        const nonOwner = accounts[2];

        await shouldFail.reverting(whiteListDocumentsInstance.transferOwner(nonOwner, { from: nonOwner }));
        await shouldFail.reverting(whiteListDocumentsInstance.addToWhiteList(nonOwner, { from: nonOwner }));
        await shouldFail.reverting(whiteListDocumentsInstance.removeFromWhiteList(nonOwner, { from: nonOwner }));
    });

    it("Should allow white listed users to call functions with the onlyWhiteList modifier.", async () => {
        const currentOwner = accounts[1];
        const nonOwner = accounts[2];

        // Confirm Owner.
        assert.equal(await whiteListDocumentsInstance.owner(), currentOwner);
        assert.equal(await whiteListDocumentsInstance.whiteList(nonOwner), false);
        // Add nonOwner to white list.
        await whiteListDocumentsInstance.addToWhiteList(nonOwner, {from: currentOwner});
        assert.equal(await whiteListDocumentsInstance.whiteList(nonOwner), true);
        // Write a document to the contract.
        await whiteListDocumentsInstance.setDocument(web3.utils.fromAscii("test.txt"), "/home/test.txt", web3.utils.fromAscii("jsdkfksdjfhsjdkfh"), {from: nonOwner});
        let expected = web3.utils.fromAscii("test.txt") + "000000000000000000000000000000000000000000000000";
        let returned = await whiteListDocumentsInstance.getAllDocuments();
        assert.equal(returned[0], expected);
        // Remove a document from the contract.
        await whiteListDocumentsInstance.removeDocument(web3.utils.fromAscii("test.txt"), {from: nonOwner});
        let returned2 = await whiteListDocumentsInstance.getAllDocuments();
        assert.equal(returned2.length, 0);
    });

    it("Should fail if not white listed user calls functions with the onlyWhiteList modifier.", async () => {
        const nonWhiteList = accounts[3];

        await shouldFail.reverting(whiteListDocumentsInstance.setDocument(web3.utils.fromAscii("test.txt"), "/home/test.txt", web3.utils.fromAscii("jsdkfksdjfhsjdkfh"), {from: nonWhiteList}));
        await shouldFail.reverting(whiteListDocumentsInstance.removeDocument(web3.utils.fromAscii("test.txt"), { from: nonWhiteList }));
    });






    ////////////////////////////////////////
    //
    //          EVENTS:
    //
    ////////////////////////////////////////





    it("Should emit AddToWhiteList event to logs.", async () => {
        console.log("");
        console.log("Events:");
        const currentOwner = accounts[1];
        const nonWhiteList = accounts[3];

        const { logs } = await whiteListDocumentsInstance.addToWhiteList(nonWhiteList, {from: currentOwner});
        await expectEvent.inLogs(logs, 'AddToWhiteList', { _added: nonWhiteList, _by: currentOwner });
    });

    it("Should emit RemoveFromWhiteList event to logs.", async () => {
        const currentOwner = accounts[1];
        const WhiteList = accounts[3];

        const { logs } = await whiteListDocumentsInstance.removeFromWhiteList(WhiteList, {from: currentOwner});
        await expectEvent.inLogs(logs, 'RemoveFromWhiteList', { _removed: WhiteList, _by: currentOwner });
    });

    it("Should emit TransferOwner event to logs.", async () => {
        const currentOwner = accounts[1];
        const nonOwner = accounts[3];

        const { logs } = await whiteListDocumentsInstance.transferOwner(nonOwner, {from: currentOwner});
        await expectEvent.inLogs(logs, 'TransferOwner', { _newOwner: nonOwner, _oldOwner: currentOwner });
    });

    it("Should emit DocumentUpdated event to logs.", async () => {
        const currentOwner = accounts[3];

        const { logs } = await whiteListDocumentsInstance.setDocument(web3.utils.fromAscii("test.txt"), "/home/test.txt", web3.utils.fromAscii("jsdkfksdjfhsjdkfh"), {from: currentOwner});
        await expectEvent.inLogs(logs, 'DocumentUpdated', { _name: web3.utils.fromAscii("test.txt") + "000000000000000000000000000000000000000000000000"});
    });

    it("Should emit DocumentRemoved event to logs.", async () => {
        const currentOwner = accounts[3];

        const { logs } = await whiteListDocumentsInstance.removeDocument(web3.utils.fromAscii("test.txt"), {from: currentOwner});
        await expectEvent.inLogs(logs, 'DocumentRemoved', { _name: web3.utils.fromAscii("test.txt") + "000000000000000000000000000000000000000000000000"});
    });



    ////////////////////////////////////////
    //
    //          transferOwner:
    //
    ////////////////////////////////////////




    it("Should transfer contract to new owner.", async () => {
        console.log("");
        console.log("transferOwner:");
        const currentOwner = accounts[3];
        const nonOwner = accounts[0];

        await whiteListDocumentsInstance.transferOwner(nonOwner, {from: currentOwner});
        assert.equal(await whiteListDocumentsInstance.owner(), nonOwner);
    });

    it("Should add new owner to the white list.", async () => {
        const currentOwner = accounts[0];

        assert.equal(await whiteListDocumentsInstance.whiteList(currentOwner), true);
    });

    it("Should remove old owner from the white list.", async () => {
        const oldOwner = accounts[3];

        assert.equal(await whiteListDocumentsInstance.whiteList(oldOwner), false);
    });




    ////////////////////////////////////////
    //
    //          addToWhileList:
    //
    ////////////////////////////////////////

    



    it("Should add user to white list.", async () => {
        console.log("");
        console.log("addToWhiteList:");
        const currentOwner = accounts[0];
        const nonWhiteList = accounts[4];

        await whiteListDocumentsInstance.addToWhiteList(nonWhiteList, {from: currentOwner});
        assert.equal(await whiteListDocumentsInstance.whiteList(nonWhiteList), true);
    });




    ////////////////////////////////////////
    //
    //          removeFromWhileList:
    //
    ////////////////////////////////////////

    


    it("Should remove user from white list.", async () => {
        console.log("");
        console.log("removeFromWhiteList:");
        const currentOwner = accounts[0];
        const WhiteList = accounts[4];

        await whiteListDocumentsInstance.removeFromWhiteList(WhiteList, {from: currentOwner});
        assert.equal(await whiteListDocumentsInstance.whiteList(WhiteList), false);
    });



    ////////////////////////////////////////
    //
    //          setDocument:
    //
    ////////////////////////////////////////




    it("Should add new document to contract from owner.", async () => {
        console.log("");
        console.log("setDocument:");
        const currentOwner = accounts[0];

        await whiteListDocumentsInstance.setDocument(web3.utils.fromAscii("test.txt"), "/home/test.txt", web3.utils.fromAscii("jsdkfksdjfhsjdkfh"), {from: currentOwner});
        let expected = web3.utils.fromAscii("test.txt") + "000000000000000000000000000000000000000000000000";
        let returned = await whiteListDocumentsInstance.getAllDocuments();
        assert.equal(returned[0], expected);
    });

    it("Should add new document to contract from white list user.", async () => {
        const currentOwner = accounts[0];
        const WhiteList = accounts[4];

        await whiteListDocumentsInstance.addToWhiteList(WhiteList, {from: currentOwner});
        await whiteListDocumentsInstance.setDocument(web3.utils.fromAscii("test2.txt"), "/home/test2.txt", web3.utils.fromAscii("jsdkfksdjfhsjdkfh"), {from: WhiteList});
        await whiteListDocumentsInstance.setDocument(web3.utils.fromAscii("test3.txt"), "/home/test3.txt", web3.utils.fromAscii("jsdkfksdjfhsjdkfh"), {from: WhiteList});
        let expected = web3.utils.fromAscii("test.txt") + "000000000000000000000000000000000000000000000000";
        let returned = await whiteListDocumentsInstance.getAllDocuments();
        assert.equal(returned[0], expected);
    });

    it("Should update document to contract from owner.", async () => {
        const currentOwner = accounts[0];

        await whiteListDocumentsInstance.setDocument(web3.utils.fromAscii("test.txt"), "/home/test.txt", web3.utils.fromAscii("jsdkfDFJNDKJFSKDJFN"), {from: currentOwner});
        let expected = web3.utils.fromAscii("test.txt") + "000000000000000000000000000000000000000000000000";
        let returned = await whiteListDocumentsInstance.getAllDocuments();
        assert.equal(returned[0], expected);

        assert.equal(returned.length, 3);
    });

    it("Should update document to contract from white list user.", async () => {
        const WhiteList = accounts[4];


        await whiteListDocumentsInstance.setDocument(web3.utils.fromAscii("test2.txt"), "/home/test2.txt", web3.utils.fromAscii("jsdkfZMCLKDMCLKSDMC"), {from: WhiteList});
        let expected = web3.utils.fromAscii("test.txt") + "000000000000000000000000000000000000000000000000";
        let returned = await whiteListDocumentsInstance.getAllDocuments();
        assert.equal(returned[0], expected);
        assert.equal(returned.length, 3);
    });





    ////////////////////////////////////////
    //
    //          removeDocument:
    //
    ////////////////////////////////////////




    it("Should remove low index document by owner.", async () => {
        console.log("");
        console.log("removeDocument:");
        const currentOwner = accounts[0];

        await whiteListDocumentsInstance.removeDocument(web3.utils.fromAscii("test.txt"), {from: currentOwner});
        let returned = await whiteListDocumentsInstance.getAllDocuments();
        assert.equal(returned.length, 2);
    });

    it("Should remove document by white list user.", async () => {
        const WhiteList = accounts[4];

        await whiteListDocumentsInstance.removeDocument(web3.utils.fromAscii("test2.txt"), {from: WhiteList});
        let returned = await whiteListDocumentsInstance.getAllDocuments();
        assert.equal(returned.length, 1);
    });





    ////////////////////////////////////////
    //
    //          getDocument:
    //
    ////////////////////////////////////////



    it("Should retrieve document details.", async () => {
        console.log("");
        console.log("getDocument:");

        let returned = await whiteListDocumentsInstance.getDocument(web3.utils.fromAscii("test3.txt"));
        let expected = web3.utils.fromAscii("jsdkfksdjfhsjdkfh") + "000000000000000000000000000000";
        assert.equal(returned[1], expected);
    });










});
