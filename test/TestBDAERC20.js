var BDAERC20 = artifacts.require("BDAERC20");
var Admin = artifacts.require("Admin");

var Web3 = require('web3');
const truffleAssert = require('truffle-assertions');
var W3 = new Web3();
const BN = web3.utils.BN;

const GAS_PRICE = 20000000000; // in Wei

var IDP1Address = '0x2E3167f191D4c98fE8f744D55f43CAF303f9c1AB';
var IDP1PrivateKey = '0x5b23605f0e859b228a7a20452bd5c1d1b89b1928adb05f2f885c03032e0ccf3d';
var IDP2Address = '0x5e36A5756ea287acBFf852D99d357Bd8524C7B1f';
var IDP2PrivateKey = '0xf1e1f9bcbb533418fef089ba4c6b700e4473d7cdfde56b2310faedc703aaf577';

// to test for expected revert message
const PREFIX = "VM Exception while processing transaction: revert ";
async function tryCatch(promise, message) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        assert(error.message.startsWith(PREFIX + message), `Expected revert message '${PREFIX}${message}' but got '${error.message}' instead!`);
    }
};

const equals = (a, b) =>
  a.length === b.length &&
  a.every((v, i) => v === b[i]);


const equalsSet = (xs, ys) =>
  xs.size === ys.size &&
  [...xs].every((x) => ys.has(x));


async function signMessage(accountAddr, privateKey) {
    // it needs to be in lower case, because solidity doesnt save address (msg.sender) in mixed case (mixed case == checksum)
    var message = accountAddr.toLowerCase();

    // hash message
    var hashedMessage = web3.utils.soliditySha3(message);

    // sign message (hash of address of user)
    return await web3.eth.accounts.sign(hashedMessage, privateKey);
}

contract(' TEST SUITE 1 [ Admin Management ]', function(accounts) {
    // accounts[0] - owner of token
    // accounts[1] - regular user
    // accounts[2] - mint/idp admin
    // accounts[3] - idp admin

    it("Admin contracts can be called only from token contract", async() => {
        let token = await BDAERC20.deployed();
        let mintAdminContractAddress = await token.getMintContractAddress({from: accounts[1]});
        let mintAdminContract = new web3.eth.Contract(Admin.abi, mintAdminContractAddress);

        // following calls should fail, since they call directly the MintAdmin contract created by BDAERC20 contract
        await tryCatch(mintAdminContract.methods.isAdmin(accounts[0]).send({from: accounts[1]}), "This contract can be called only from BDAERC20 contract!");
        await tryCatch(mintAdminContract.methods.isAdmin(accounts[1]).send({from: accounts[0]}), "This contract can be called only from BDAERC20 contract!");

        // following calls should succeed, since it can be called by everyone
        var x = await token.isMintAdmin.call(accounts[0], {from: accounts[1]});
        assert(x, 'accounts[0] shoud be mint admin!');
        var x = await token.isMintAdmin.call(accounts[1], {from: accounts[6]});
        assert(!x, 'accounts[1] shouldn\'t be mint admin!');
    });

    it("accounts[0] is the only admin in every admin role", async() => {
        let token = await BDAERC20.deployed();

        var mintAdmins = await token.getMintAdmins.call({from: accounts[1]});
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});

        assert(equals(mintAdmins, [accounts[0]]), 'accounts[0] is not the only mint admin!');
        assert(equals(IDPAdmins, [accounts[0]]), 'accounts[0] is not the only IDP admin!');
    });

    it("Add mint admin by authorized user", async() => {
        let token = await BDAERC20.deployed();

        var tx = await token.signAddingMintingAdmin(accounts[2], {from: accounts[0]});

        var event1 = tx.logs.find((log) => log.event === "MintAdminAddSignature");
        assert(event1.args.admin === accounts[2], 'Admin is different from accounts[2]!');
        assert(event1.args.signer === accounts[0]), 'Signer is different from accounts[0]!';

        var event2 = tx.logs.find((log) => log.event === "MintAdminAdded");
        assert(event2.args.admin === accounts[2], 'Added admin is different from accounts[2]!');

        var mintAdmins = await token.getMintAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(mintAdmins), new Set([accounts[0], accounts[2]])), 'accounts[2] and accounts[0] should both be mint admins!');
    });

    it("Add mint admin by unauthorized user", async() => {
        let token = await BDAERC20.deployed();
        await tryCatch(token.signAddingMintingAdmin(accounts[1], {from: accounts[1]}), "Mint admin role required!");

        // mint admins should remain the same
        var mintAdmins = await token.getMintAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(mintAdmins), new Set([accounts[0], accounts[2]])), 'accounts[2] and accounts[0] should both be mint admins!');
    });

    it("Add 2 IDP admins by authorized user -- consensus needed", async() => {
        let token = await BDAERC20.deployed();

        // add accounts[2] as IDP admin
        var tx = await token.signAddingIDPAdmin(accounts[2], {from: accounts[0]});

        var event1 = tx.logs.find((log) => log.event === "IDPAdminAddSignature");
        assert(event1.args.admin === accounts[2], 'Admin is different from accounts[2]!');
        assert(event1.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var event2 = tx.logs.find((log) => log.event === "IDPAdminAdded");
        assert(event2.args.admin === accounts[2], 'Added admin is different from accounts[2]!');

        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2]])), 'accounts[2] and accounts[0] should both be IDP admins!');

        // add accounts[3] as IDP admin -- consensus needed
        var tx2 = await token.signAddingIDPAdmin(accounts[3], {from: accounts[0]});
        var event3 = tx2.logs.find((log) => log.event === "IDPAdminAddSignature");
        assert(event3.args.admin === accounts[3], 'Admin is different from accounts[3]!');
        assert(event3.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        // accounts[3] shouldn't be added yet
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2]])), 'accounts[2] and accounts[0] should both be IDP admins!');

        // check that accounts[0] cannot add second signature
        await tryCatch(token.signAddingIDPAdmin(accounts[3], {from: accounts[0]}), "The signer has already confirmed the addition of the admin!");

        // add second (final) signature
        var tx3 = await token.signAddingIDPAdmin(accounts[3], {from: accounts[2]});
        var event4 = tx3.logs.find((log) => log.event === "IDPAdminAddSignature");
        assert(event4.args.admin === accounts[3], 'Admin is different from accounts[3]!');
        assert(event4.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var event5 = tx3.logs.find((log) => log.event === "IDPAdminAdded");
        assert(event5.args.admin === accounts[3], 'Added admin is different from accounts[3]!');

        // accounts[3] should be added as IDP admin
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2], accounts[3]])), 'accounts[2], accounts[0] accounts[3] should all be IDP admins!');
    });

    it("Add existing admin", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.signAddingIDPAdmin(accounts[3], {from: accounts[2]}), "The proposed address is already an admin!");
        await tryCatch(token.signAddingMintingAdmin(accounts[0], {from: accounts[2]}), "The proposed address is already an admin!");
    });

    it("Remove non-existing admin", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.signRemovingIDPAdmin(accounts[8], {from: accounts[2]}), "The proposed address isn't an admin!");
        await tryCatch(token.signRemovingMintingAdmin(accounts[3], {from: accounts[0]}), "The proposed address isn't an admin!");
    });

    it("Remove existing IDP admin", async() => {
        let token = await BDAERC20.deployed();

        // remove accounts[0] as IDP admin (first signature)
        var tx = await token.signRemovingIDPAdmin(accounts[0], {from: accounts[2]});
        var event = tx.logs.find((log) => log.event === "IDPAdminRemoveSignature");
        assert(event.args.admin === accounts[0], 'Admin is different from accounts[3]!');
        assert(event.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        // accounts[0] should still be IDP admin
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2], accounts[3]])), 'accounts[2], accounts[0] accounts[3] should all be IDP admins!');

        // try to sign it again -- should revert
        await tryCatch(token.signRemovingIDPAdmin(accounts[0], {from: accounts[2]}), "The signer has already confirmed the removal of the admin!");

        // add final signature
        var tx = await token.signRemovingIDPAdmin(accounts[0], {from: accounts[3]});
        var event = tx.logs.find((log) => log.event === "IDPAdminRemoveSignature");
        assert(event.args.admin === accounts[0], 'Admin is different from accounts[3]!');
        assert(event.args.signer === accounts[3], 'Signer is different from accounts[2]!');

        var event = tx.logs.find((log) => log.event === "IDPAdminRemoved");
        assert(event.args.admin === accounts[0], 'Removed admin is different from accounts[3]!');

        // accounts[0] should no longer be IDP admin
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[2], accounts[3]])), 'accounts[2], accounts[3] should be only IDP admins!');
    });

    it("Add accounts[0] back as IDP admin", async() => {
        let token = await BDAERC20.deployed();

        // add accounts[0] as IDP admin -- consensus needed
        var tx2 = await token.signAddingIDPAdmin(accounts[0], {from: accounts[3]});
        var event3 = tx2.logs.find((log) => log.event === "IDPAdminAddSignature");
        assert(event3.args.admin === accounts[0], 'Admin is different from accounts[3]!');
        assert(event3.args.signer === accounts[3], 'Signer is different from accounts[0]!');

        // accounts[0] shouldn't be added yet
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[3], accounts[2]])), 'accounts[3] and accounts[2] should both be IDP admins!');

        // add second (final) signature
        var tx3 = await token.signAddingIDPAdmin(accounts[0], {from: accounts[2]});
        var event4 = tx3.logs.find((log) => log.event === "IDPAdminAddSignature");
        assert(event4.args.admin === accounts[0], 'Admin is different from accounts[3]!');
        assert(event4.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var event5 = tx3.logs.find((log) => log.event === "IDPAdminAdded");
        assert(event5.args.admin === accounts[0], 'Added admin is different from accounts[3]!');

        // accounts[3] should be added as IDP admin
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2], accounts[3]])), 'accounts[2], accounts[0] accounts[3] should all be IDP admins!');
    });

});

contract(' TEST SUITE 1 [ IDP Management ]', function(accounts) {
    // accounts[0] - owner of token, mint/idp admin
    // accounts[1] - regular user
    // accounts[2] - idp admin
    // accounts[3] - regular user
    // accounts[4] - regular user

    it("Try to verify user with empty IDP list", async() => {
        let token = await BDAERC20.deployed();

        // check that IDP list is empty
        var IDPs = await token.getIDPs.call({from: accounts[1]});
        assert(equals(IDPs, []), 'IDP list should be empty!');

        // create verification message
        var sig = await signMessage(accounts[1], IDP1PrivateKey);

        await tryCatch(token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[1]}), "Message was not signed by a valid IDP!");
    });

    it("Add IDP without IDPAdmin", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.signAddingIDP(IDP1Address, {from: accounts[2]}), "IDP admin role required!");

        // check that IDP list is empty
        var IDPs = await token.getIDPs.call({from: accounts[1]});
        assert(equals(IDPs, []), 'IDP list should be empty!');
    });

    it("Add IDP with IDPAdmin", async() => {
        let token = await BDAERC20.deployed();

        var tx = await token.signAddingIDP(IDP1Address, {from: accounts[0]});
        var event = tx.logs.find((log) => log.event === "IDPAddSignature");
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');
        assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var event = tx.logs.find((log) => log.event === "IDPAdded");
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // check that IDP list contains only IDP1Address
        var IDPs = await token.getIDPs.call({from: accounts[1]});
        assert(equals(IDPs, [IDP1Address]), 'IDP list should contain only IDP1Address!');
    });

    it("Signing with non existent IDP", async() => {
        let token = await BDAERC20.deployed();

        // create verification message
        var sig = await signMessage(accounts[1], IDP2PrivateKey);

        await tryCatch(token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[1]}), "Message was not signed by a valid IDP!");
    });

    it("Signing with valid IDP", async() => {
        let token = await BDAERC20.deployed();

        // create verification message
        var sig = await signMessage(accounts[1], IDP1PrivateKey);

        var tx = await token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[1]});
        var event = tx.logs.find((log) => log.event === "VerificationSuccessful");
        assert(event.args.user === accounts[1], 'User is different from accounts[1]!');
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // check if accounts[1] is really verified now
        assert(await token.isVerified.call(accounts[1], {from: accounts[1]}), 'accounts[1] should be verified user!');
    });

    it("Add new IDP with IDPAdmin consensus", async() => {
        let token = await BDAERC20.deployed();

        // add second IDPAdmin
        var tx = await token.signAddingIDPAdmin(accounts[2], {from: accounts[0]});

        var event = tx.logs.find((log) => log.event === "IDPAdminAddSignature");
        assert(event.args.admin === accounts[2], 'Admin is different from accounts[2]!');
        assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var event = tx.logs.find((log) => log.event === "IDPAdminAdded");
        assert(event.args.admin === accounts[2], 'Added admin is different from accounts[2]!');

        // add second IDP
        var tx = await token.signAddingIDP(IDP2Address, {from: accounts[2]});
        var event = tx.logs.find((log) => log.event === "IDPAddSignature");
        assert(event.args.IDP === IDP2Address, 'IDP is different from IDP2Address!');
        assert(event.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var tx = await token.signAddingIDP(IDP2Address, {from: accounts[0]});
        var event = tx.logs.find((log) => log.event === "IDPAddSignature");
        assert(event.args.IDP === IDP2Address, 'IDP is different from IDP2Address!');
        assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var event = tx.logs.find((log) => log.event === "IDPAdded");
        assert(event.args.IDP === IDP2Address, 'IDP is different from IDP2Address!');

        // check if IDP list contains both IDPs
        var IDPs = await token.getIDPs.call({from: accounts[8]});
        assert(equals(IDPs, [IDP1Address, IDP2Address]), 'IDP list should contain both IDP1Address and IDP2Address!');
    });

    it("Signing with new IDP", async() => {
        let token = await BDAERC20.deployed();

        // create verification message
        var sig = await signMessage(accounts[3], IDP2PrivateKey);

        var tx = await token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[3]});
        var event = tx.logs.find((log) => log.event === "VerificationSuccessful");
        assert(event.args.user === accounts[3], 'User is different from accounts[3]!');
        assert(event.args.IDP === IDP2Address, 'IDP is different from IDP2Address!');

        // check if accounts[1] is really verified now
        assert(await token.isVerified.call(accounts[1], {from: accounts[1]}), 'accounts[1] should be verified user!');
    });

    it("Remove first IDP", async() => {
        let token = await BDAERC20.deployed();

        // remove first IDP
        var tx = await token.signRemovingIDP(IDP1Address, {from: accounts[2]});
        var event = tx.logs.find((log) => log.event === "IDPRemoveSignature");
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');
        assert(event.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var tx = await token.signRemovingIDP(IDP1Address, {from: accounts[0]});
        var event = tx.logs.find((log) => log.event === "IDPRemoveSignature");
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');
        assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var event = tx.logs.find((log) => log.event === "IDPRemoved");
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // check if IDP list contains only IDP2Address
        var IDPs = await token.getIDPs.call({from: accounts[0]});
        assert(equals(IDPs, [IDP2Address]), 'IDP list should contain only IDP2Address!');
    });

    it("Signing with removed IDP", async() => {
        let token = await BDAERC20.deployed();

        // create verification message
        var sig = await signMessage(accounts[4], IDP1PrivateKey);

        await tryCatch(token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[4]}), "Message was not signed by a valid IDP!");
    });

    it("Try to verify with incorrect signature", async() => {
        let token = await BDAERC20.deployed();

        // create verification message from accounts[6]
        var sig = await signMessage(accounts[6], IDP1PrivateKey);

        // send message + signature from accounts[7]
        await tryCatch(token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[7]}), "Message hash is incorrect!");
    });
});


// contract(' TEST SUITE 2 [ Minting ]', function(accounts) {
//     it("Signing with non existent IDP", async() => {
//         contract = await BDAERC20.deployed();
//         console.log(contract.address);

//         // it needs to be in lower case, because solidity doesnt save address (msg.sender) in mixed case (mixed case == checksum)
//         var message = accounts[1].toLowerCase();

//         // hash message
//         var hashedMessage = web3.utils.soliditySha3(message);

//         // sign message (hash of address of user)
//         var sig = await web3.eth.accounts.sign(hashedMessage, IDPPrivateKey);

//         // check for correct revert being called
//         await tryCatch(contract.verify.call(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[1]}), "Message was not signed by a valid IDP!");
//     });

// });


//     let tokenContract;

    // hooks for each contract



// //     it("Try to mint without mintingAdmin", async() => {
// //         // var contract = await BDAERC20.deployed()
// //         // await contract.mint()

// //         // try {
// //         //     var receipt = await contract.executeTransaction(txID, { from: accounts[9] }); // the sender can be anybody, as tx is already confirmed

// //         //     // the previously executed transaction is executed again by anybody == replay attack
// //         //     var contractAfter = await web3.eth.getBalance(contract.address);
// //         //     assert.equal((new BN(contractAfter)).add(new BN(VALUE_SENT)), contractBefore);
// //         //     assert.fail('Replay attack was successfull.');
// //         // } catch (error) {
// //         //     const revertFound = error.message.search('revert') >= 0;
// //         //     assert(revertFound, `Expected "revert", got ${error} instead`);
// //         // }
// //         // var receiptils.toWei('99', 'ether'));
// //     });
// // });

// });


// contract('BDAERC20 Tests', function(accounts) {
//     it("Send money from accounts[1] to accounts[0]", async() => {
//         assert.equal(0,0);
//     });

//     it("Send money from accounts[1] to accounts[0]", async() => {
//         assert.equal(0,0);
//     });

//     // var INITIAL_BALANCE = W3.utils.toWei("1", 'ether'); // in wei
//     // var VALUE_SENT = W3.utils.toWei("0.1", 'ether'); // in wei
//     // var TOO_BIG_AMOUNT = W3.utils.toWei("1000", 'ether'); // in wei
//     // var RECEPIENT = accounts[9];

//     // it("Zero Ballance", async() => {
//     //     var contract = await MultiSigWallet.deployed()
//     //     console.log("Address of wallet's contract is: ", contract.address);
//     //     var balance = await web3.eth.getBalance(contract.address);
//     //     assert.equal(0, balance);
//     // });

//     // it("Contract owners are correct.", async() => {
//     //     var contract = await MultiSigWallet.deployed()

//     //     for (let i = 0; i < conf.NUMBER_OF_OWNERS; i++) {
//     //         var owner = await contract.owners.call(i);
//     //         assert.equal(accounts[i], owner);
//     //     }
//     // });

//     // it("Send money to contract by account[0]", async() => {
//     //     var contract = await MultiSigWallet.deployed()
//     //     var receipt = await web3.eth.sendTransaction({
//     //         from: accounts[0],
//     //         to: contract.address,
//     //         value: INITIAL_BALANCE
//     //     })
//     //     console.log("\t \\/== Gas used for sending ether to the contract: ", receipt.gasUsed);

//     //     var contrBalance = await web3.eth.getBalance(contract.address);
//     //     console.log("\t Current balance of contract is", W3.utils.fromWei(contrBalance.toString(), 'ether'), 'Ethers.');
//     //     assert.equal(contrBalance, W3.utils.toWei('1', 'ether'));

//     //     var senderBalance = await web3.eth.getBalance(accounts[0]);
//     //     assert.ok(senderBalance < W3.utils.toWei('99', 'ether'));
//     // });

//     // it("Submit (and confirm) new transaction by the 1st owner (i.e., account[0])", async() => {
//     //     var contract = await MultiSigWallet.deployed()
//     //     var receipt = await contract.submitTransaction(RECEPIENT, VALUE_SENT, { from: accounts[0] });
//     //     console.log("\t \\/== Gas used for submitTransaction() by owner[0]: ", receipt.receipt.gasUsed);

//     //     assert(isEventInLogs("Submission", receipt.receipt.logs))
//     //     assert(isEventInLogs("Confirmation", receipt.receipt.logs))

//     //     // for demonstration purposes, you may check count of signatures and call other UI intended functions
//     //     var sigCnt = await contract.getSignatureCount.call(0);
//     //     assert.equal(sigCnt, 1);

//     //     // for demonstration purposes we check how/whether the storage of blokchain was updated
//     //     var cnt = await contract.transactionCount.call()
//     //     assert.equal(cnt, 1);

//     //     var tx = await contract.transactions.call(0);
//     //     assert.equal(tx.destination, RECEPIENT)
//     //     assert.equal(tx.value, VALUE_SENT)
//     // });

//     // it("Confirm (i.e., co-sign) and execute transaction by remaining n-1 owners (i.e., account[1]... account[n - 1])", async() => {
//     //     var contract = await MultiSigWallet.deployed()
//     //     var recepientBefore = await web3.eth.getBalance(RECEPIENT); // store the balance of recepient before execution of transaction
//     //     var gasPayedByRecepient = 0;
//     //     var txID = 0; // the 1st transaction

//     //     // the rest of minimal required owners sign the transaction
//     //     var receipt;
//     //     for (let i = 1; i < conf.REQUIRED_SIGS; i++) {
//     //         receipt = await contract.confirmTransaction(txID, { from: accounts[i] });
//     //         console.log(receipt);
//     //         console.log(`\t \\/== Gas used for confirmTransaction() by owner[${i}] is: `, receipt.receipt.gasUsed);
//     //         if (RECEPIENT === accounts[i])
//     //             gasPayedByRecepient = receipt.receipt.gasUsed; // this is required to take into consideration when checking the recepient's balance after
//     //         assert(isEventInLogs("Confirmation", receipt.receipt.logs))
//     //     }
//     //     // since we have already all required signatures, the last confirmation mut cause tx to be also executed
//     //     assert(isEventInLogs("Execution", receipt.receipt.logs));


//     //     // check whether is transaction confirmed
//     //     var isConfirmed = await contract.isTxConfirmed.call(txID);
//     //     assert(isConfirmed)

//     //     // you may check count of signatures
//     //     var sigCnt = await contract.getSignatureCount.call(txID);
//     //     assert.equal(sigCnt, conf.REQUIRED_SIGS);

//     //     //check balance of contract and recipient after execution of transaction
//     //     var contrBalance = await web3.eth.getBalance(contract.address);
//     //     assert.equal((new BN(contrBalance)).add(new BN(VALUE_SENT)), INITIAL_BALANCE);

//     //     var recepientAfter = await web3.eth.getBalance(RECEPIENT);
//     //     assert.equal((new BN(recepientBefore)).add(new BN(VALUE_SENT)).sub(new BN(gasPayedByRecepient * GAS_PRICE)), recepientAfter);
//     // });

//     // it("Check replay protection by initiating already executed transaction again.", async() => {
//     //     var contract = await MultiSigWallet.deployed()
//     //     var contractBefore = await web3.eth.getBalance(contract.address); // store the balance of recepient before execution of transaction
//     //     var txID = 0; // the 1st one

//     //     try {
//     //         var receipt = await contract.executeTransaction(txID, { from: accounts[9] }); // the sender can be anybody, as tx is already confirmed

//     //         // the previously executed transaction is executed again by anybody == replay attack
//     //         var contractAfter = await web3.eth.getBalance(contract.address);
//     //         assert.equal((new BN(contractAfter)).add(new BN(VALUE_SENT)), contractBefore);
//     //         assert.fail('Replay attack was successfull.');
//     //     } catch (error) {
//     //         const revertFound = error.message.search('revert') >= 0;
//     //         assert(revertFound, `Expected "revert", got ${error} instead`);
//     //     }
//     // });


//     // it("Check event NotEnoughBalance is emitted properly.", async() => {
//     //     var contract = await MultiSigWallet.deployed()
//     //     var txID = 1; // the 2nd one
//     //     var receipt = await contract.submitTransaction(RECEPIENT, TOO_BIG_AMOUNT, { from: accounts[0] });
//     //     for (let i = 1; i < conf.REQUIRED_SIGS; i++) {
//     //         receipt = await contract.confirmTransaction(txID, { from: accounts[i] });
//     //         assert(isEventInLogs("Confirmation", receipt.receipt.logs))
//     //     }
//     //     assert(isEventInLogs("Confirmation", receipt.receipt.logs));

//     //     assert(isEventInLogs("NotEnoughBalance", receipt.receipt.logs));
//     // });


//     // it("Get owners who signed the 2nd transaction (i.e., ID = 1).", async() => {
//     //     var contract = await MultiSigWallet.deployed()
//     //     var txID = 1; // the 1st one

//     //     try {
//     //         var signersOfLastTx = await contract.getOwnersWhoSignedTx.call(txID);
//     //     } catch (error) {
//     //         const typeError = error.message.search('call') >= 0;
//     //         assert(typeError, `Expected TypeError, got ${error} instead`);
//     //         throw "Function getOwnersWhoSignedTx() is not implemented yet."
//     //     }

//     //     // console.log(signersOfLastTx);
//     //     for (let i = 0; i < conf.REQUIRED_SIGS; i++) {
//     //         assert(signersOfLastTx.includes(accounts[i]));
//     //     }



//     // });
// });



/// AUX Functions

function isEventInLogs(event, logs) {
    for (let i = 0; i < logs.length; i++) {
        if (logs[i].event !== undefined && logs[i].event == event) {
            return true;
        }
    }
    return false;
};