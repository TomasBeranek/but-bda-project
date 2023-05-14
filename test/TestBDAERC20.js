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

        // var event1 = tx.logs.find((log) => log.event === "MintAdminAddSignature");
        // assert(event1.args.admin === accounts[2], 'Admin is different from accounts[2]!');
        // assert(event1.args.signer === accounts[0]), 'Signer is different from accounts[0]!';

        var event2 = tx.logs.find((log) => log.event === "MintAdminAdded");
        assert(event2.args.admin === accounts[2], 'Added admin is different from accounts[2]!');

        var mintAdmins = await token.getMintAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(mintAdmins), new Set([accounts[0], accounts[2]])), 'accounts[2] and accounts[0] should both be mint admins!');
    });

    it("Add mint admin by unauthorized user", async() => {
        let token = await BDAERC20.deployed();
        await tryCatch(token.signAddingMintingAdmin(accounts[1], {from: accounts[1]}), "mintingAdmin role required!");

        // mint admins should remain the same
        var mintAdmins = await token.getMintAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(mintAdmins), new Set([accounts[0], accounts[2]])), 'accounts[2] and accounts[0] should both be mint admins!');
    });

    it("Add 2 IDP admins by authorized user -- consensus needed", async() => {
        let token = await BDAERC20.deployed();

        // add accounts[2] as IDP admin
        var tx = await token.signAddingIDPAdmin(accounts[2], {from: accounts[0]});

        // var event1 = tx.logs.find((log) => log.event === "IDPAdminAddSignature");
        // assert(event1.args.admin === accounts[2], 'Admin is different from accounts[2]!');
        // assert(event1.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var event2 = tx.logs.find((log) => log.event === "IDPAdminAdded");
        assert(event2.args.admin === accounts[2], 'Added admin is different from accounts[2]!');

        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2]])), 'accounts[2] and accounts[0] should both be IDP admins!');

        // add accounts[3] as IDP admin -- consensus needed
        var tx2 = await token.signAddingIDPAdmin(accounts[3], {from: accounts[0]});
        // var event3 = tx2.logs.find((log) => log.event === "IDPAdminAddSignature");
        // assert(event3.args.admin === accounts[3], 'Admin is different from accounts[3]!');
        // assert(event3.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        // accounts[3] shouldn't be added yet
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2]])), 'accounts[2] and accounts[0] should both be IDP admins!');

        // check that accounts[0] cannot add second signature
        await tryCatch(token.signAddingIDPAdmin(accounts[3], {from: accounts[0]}), "The signer has already confirmed the addition of the admin!");

        // add second (final) signature
        var tx3 = await token.signAddingIDPAdmin(accounts[3], {from: accounts[2]});
        // var event4 = tx3.logs.find((log) => log.event === "IDPAdminAddSignature");
        // assert(event4.args.admin === accounts[3], 'Admin is different from accounts[3]!');
        // assert(event4.args.signer === accounts[2], 'Signer is different from accounts[2]!');

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
        // var event = tx.logs.find((log) => log.event === "IDPAdminRemoveSignature");
        // assert(event.args.admin === accounts[0], 'Admin is different from accounts[3]!');
        // assert(event.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        // accounts[0] should still be IDP admin
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2], accounts[3]])), 'accounts[2], accounts[0] accounts[3] should all be IDP admins!');

        // try to sign it again -- should revert
        await tryCatch(token.signRemovingIDPAdmin(accounts[0], {from: accounts[2]}), "The signer has already confirmed the removal of the admin!");

        // add final signature
        var tx = await token.signRemovingIDPAdmin(accounts[0], {from: accounts[3]});
        // var event = tx.logs.find((log) => log.event === "IDPAdminRemoveSignature");
        // assert(event.args.admin === accounts[0], 'Admin is different from accounts[3]!');
        // assert(event.args.signer === accounts[3], 'Signer is different from accounts[2]!');

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
        // var event3 = tx2.logs.find((log) => log.event === "IDPAdminAddSignature");
        // assert(event3.args.admin === accounts[0], 'Admin is different from accounts[3]!');
        // assert(event3.args.signer === accounts[3], 'Signer is different from accounts[0]!');

        // accounts[0] shouldn't be added yet
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[3], accounts[2]])), 'accounts[3] and accounts[2] should both be IDP admins!');

        // add second (final) signature
        var tx3 = await token.signAddingIDPAdmin(accounts[0], {from: accounts[2]});
        // var event4 = tx3.logs.find((log) => log.event === "IDPAdminAddSignature");
        // assert(event4.args.admin === accounts[0], 'Admin is different from accounts[3]!');
        // assert(event4.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var event5 = tx3.logs.find((log) => log.event === "IDPAdminAdded");
        assert(event5.args.admin === accounts[0], 'Added admin is different from accounts[3]!');

        // accounts[3] should be added as IDP admin
        var IDPAdmins = await token.getIDPAdmins.call({from: accounts[1]});
        assert(equalsSet(new Set(IDPAdmins), new Set([accounts[0], accounts[2], accounts[3]])), 'accounts[2], accounts[0] accounts[3] should all be IDP admins!');
    });

});

contract(' TEST SUITE 2 [ IDP Management ]', function(accounts) {
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
        // var event = tx.logs.find((log) => log.event === "IDPAddSignature");
        // assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');
        // assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

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

        // var event = tx.logs.find((log) => log.event === "IDPAdminAddSignature");
        // assert(event.args.admin === accounts[2], 'Admin is different from accounts[2]!');
        // assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var event = tx.logs.find((log) => log.event === "IDPAdminAdded");
        assert(event.args.admin === accounts[2], 'Added admin is different from accounts[2]!');

        // add second IDP
        var tx = await token.signAddingIDP(IDP2Address, {from: accounts[2]});
        // var event = tx.logs.find((log) => log.event === "IDPAddSignature");
        // assert(event.args.IDP === IDP2Address, 'IDP is different from IDP2Address!');
        // assert(event.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var tx = await token.signAddingIDP(IDP2Address, {from: accounts[0]});
        // var event = tx.logs.find((log) => log.event === "IDPAddSignature");
        // assert(event.args.IDP === IDP2Address, 'IDP is different from IDP2Address!');
        // assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

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

        // check if accounts[3] is really verified now
        assert(await token.isVerified.call(accounts[3], {from: accounts[3]}), 'accounts[3] should be verified user!');
    });

    it("Remove first IDP", async() => {
        let token = await BDAERC20.deployed();

        // remove first IDP
        var tx = await token.signRemovingIDP(IDP1Address, {from: accounts[2]});
        // var event = tx.logs.find((log) => log.event === "IDPRemoveSignature");
        // assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');
        // assert(event.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var tx = await token.signRemovingIDP(IDP1Address, {from: accounts[0]});
        // var event = tx.logs.find((log) => log.event === "IDPRemoveSignature");
        // assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');
        // assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

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

    it("Revoke non-verified user", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.signRevoke(accounts[7], {from: accounts[2]}), "User is not verified!");
    });

    it("Revoke verified user", async() => {
        let token = await BDAERC20.deployed();

        // remove accounts[1] with consensus of IDP admins
        var tx = await token.signRevoke(accounts[1], {from: accounts[0]});
        // var event = tx.logs.find((log) => log.event === "RevokeSignature");
        // assert(event.args.user === accounts[1], 'User is different from accounts[1]!');
        // assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var tx = await token.signRevoke(accounts[1], {from: accounts[2]});
        // var event = tx.logs.find((log) => log.event === "RevokeSignature");
        // assert(event.args.user === accounts[1], 'User is different from accounts[1]!');
        // assert(event.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var event = tx.logs.find((log) => log.event === "UserRevoked");
        assert(event.args.user === accounts[1], 'User is different from accounts[1]!');

        // check that accounts[1] no longer counts as verified
        assert(!await token.isVerified.call(accounts[1], {from: accounts[1]}), 'accounts[1] should not be verified!');
    });

    it("Approve verified, but not revoked user", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.signApprove(accounts[3], {from: accounts[2]}), "The proposed address is not revoked!");
    });

    it("Try revoke and approve without admin role", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.signApprove(accounts[1], {from: accounts[9]}), "IDP admin role required");
        await tryCatch(token.signRevoke(accounts[3], {from: accounts[7]}), "IDP admin role required");
    });

    it("Approve verified and revoked user", async() => {
        let token = await BDAERC20.deployed();

        // approve back accounts[1]
        var tx = await token.signApprove(accounts[1], {from: accounts[0]});
        // var event = tx.logs.find((log) => log.event === "ApproveSignature");
        // assert(event.args.user === accounts[1], 'User is different from accounts[1]!');
        // assert(event.args.signer === accounts[0], 'Signer is different from accounts[0]!');

        var tx = await token.signApprove(accounts[1], {from: accounts[2]});
        // var event = tx.logs.find((log) => log.event === "ApproveSignature");
        // assert(event.args.user === accounts[1], 'User is different from accounts[1]!');
        // assert(event.args.signer === accounts[2], 'Signer is different from accounts[2]!');

        var event = tx.logs.find((log) => log.event === "UserApproved");
        assert(event.args.user === accounts[1], 'User is different from accounts[1]!');

        // check that accounts[1] is verified again
        assert(await token.isVerified.call(accounts[1], {from: accounts[1]}), 'accounts[1] should be verified!');
    });
});

contract(' TEST SUITE 3 [ Restriction Admin Management ]', function(accounts) {
    // accounts[0] -- restr admin
    // accounts[1] -- restr admin
    // accounts[2] -- verified user
    // accounts[3] -- non verified user

    it("Change user TRANSFERLIMIT without restr admin", async() => {
        let token = await BDAERC20.deployed();
        // add IDP
        var tx = await token.signAddingIDP(IDP1Address, {from: accounts[0]});

        var event = tx.logs.find((log) => log.event === "IDPAdded");
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // verify accounts[2]
        var sig = await signMessage(accounts[2], IDP1PrivateKey);

        var tx = await token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[2]});
        var event = tx.logs.find((log) => log.event === "VerificationSuccessful");
        assert(event.args.user === accounts[2], 'User is different from accounts[2]!');
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        await tryCatch(token.signTransferLimitChange(accounts[2], 200, {from: accounts[1]}), "restrAdmin role required!");
    });

    it("Change TRANSFERLIMIT of non verified user", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.signTransferLimitChange(accounts[3], 200, {from: accounts[0]}), 'Transfer limit can be changed on for verified users!');
    });

    it("Add second restr admin", async() => {
        let token = await BDAERC20.deployed();

        var tx = await token.signAddingRestrAdmin(accounts[1], {from: accounts[0]});

        var event = tx.logs.find((log) => log.event === "RestrAdminAdded");
        assert(event.args.admin === accounts[1], 'Restr admin is different from accounts[1]!');

        // check that restr admin list contains correct admins
        var restrAdmins = await token.getRestrAdmins.call({from: accounts[9]});
        assert(equals(restrAdmins, [accounts[0], accounts[1]]), 'Restr admin list should contain accounts[0] adn accounts[1]!');
    });

    it("Change user TRANSFERLIMIT with consensus of verified user", async() => {
        let token = await BDAERC20.deployed();

        var tx = await token.signTransferLimitChange(accounts[2], 200, {from: accounts[0]});
        var tx = await token.signTransferLimitChange(accounts[2], 200, {from: accounts[1]});

        var event = tx.logs.find((log) => log.event === "TransferLimitChanged");
        assert(event.args.user === accounts[2], 'User is defferent from accounts[2]!');
        assert(Number(event.args.newValue) === 200, 'Transfer limit should be 200!');

        // check that restr admin list contains correct admins
        var limit = await token.getTransferLimit.call(accounts[2], {from: accounts[9]});
        assert(Number(limit) === 200, 'Transfer limit should be 200!');
    });
});

contract(' TEST SUITE 4 [ Minting ]', function(accounts) {
    // accounts[0] -- mint admin
    // accounts[1] -- mint admin
    // accounts[2] -- verified user
    // accounts[3] -- verified user
    // accounts[4] -- non verified user

    it("Mint without mint admin", async() => {
        let token = await BDAERC20.deployed();

        // add IDP
        var tx = await token.signAddingIDP(IDP1Address, {from: accounts[0]});

        var event = tx.logs.find((log) => log.event === "IDPAdded");
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // verify accounts[2]
        var sig = await signMessage(accounts[2], IDP1PrivateKey);

        var tx = await token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[2]});
        var event = tx.logs.find((log) => log.event === "VerificationSuccessful");
        assert(event.args.user === accounts[2], 'User is different from accounts[2]!');
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // verify accounts[3]
        var sig = await signMessage(accounts[3], IDP1PrivateKey);

        var tx = await token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[3]});
        var event = tx.logs.find((log) => log.event === "VerificationSuccessful");
        assert(event.args.user === accounts[3], 'User is different from accounts[3]!');
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        await tryCatch(token.mint([accounts[3]], [10], {from: accounts[4]}), "mintingAdmin role required!");
    });

    it("Mint to non verified user", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.mint([accounts[4]], [10], {from: accounts[0]}), 'Cannot mint to non verified account!');

    });

    it("Mint to verified user", async() => {
        let token = await BDAERC20.deployed();

        var tx = await token.mint([accounts[2]], [10], {from: accounts[0]});
        var event = tx.logs.find((log) => log.event === "Mint");
        assert(event.args.account === accounts[2], 'User is different from accounts[2]!');
        assert(event.args.admin === accounts[0], 'Mint admin is different from accounts[0]!');
        assert(Number(event.args.amount) === 10, 'Amount is different from 10!');

        // check balance
        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 10, 'Balance is different from 10!');

        // check already minted
        var minted = await token.mintedToday.call(accounts[0]);
        assert(Number(minted) === 10, 'Minted today is different from 10!');
    });

    it("Mint to multiple verified users", async() => {
        let token = await BDAERC20.deployed();

        var tx = await token.mint([accounts[2], accounts[3]], [10, 30], {from: accounts[0]});
        var event = tx.logs.filter((log) => log.event === "Mint")[0];
        assert(event.args.account === accounts[2], 'User is different from accounts[2]!');
        assert(event.args.admin === accounts[0], 'Mint admin is different from accounts[0]!');
        assert(Number(event.args.amount) === 10, 'Amount is different from 10!');

        var event = tx.logs.filter((log) => log.event === "Mint")[1];
        assert(event.args.account === accounts[3], 'User is different from accounts[3]!');
        assert(event.args.admin === accounts[0], 'Mint admin is different from accounts[0]!');
        assert(Number(event.args.amount) === 30, 'Amount is different from 30!');

        // check balance
        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 20, 'Balance is different from 20!');

        var balance = await token.balanceOf.call(accounts[3]);
        assert(Number(balance) === 30, 'Balance is different from 30!');

        // check already minted
        var minted = await token.mintedToday.call(accounts[0]);
        assert(Number(minted) === 50, 'Minted today is different from 50!');
    });

    it("Mint to multiple verified users and one non verified", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.mint([accounts[2], accounts[3], accounts[4]], [10, 20, 30], {from: accounts[0]}), 'Cannot mint to non verified account!');
    });

    it("Mint more than TMAX", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.mint([accounts[2], accounts[3]], [600, 700], {from: accounts[0]}), "Admin can't mint more than TMAX in a single day!");
    });

    it("Change TMAX with consensus", async() => {
        let token = await BDAERC20.deployed();

        // Add another mint admin
        var tx = await token.signAddingMintingAdmin(accounts[1], {from: accounts[0]});
        var event = tx.logs.find((log) => log.event === "MintAdminAdded");
        assert(event.args.admin === accounts[1], 'Mint admin is different from accounts[1]!');

        // check TMAX
        var TMAX = await token.getTMAX.call();
        assert(Number(TMAX) === 1000, 'TMAX is different from 1000!');

        // first signature
        var tx = await token.signTMAXChange(2000, {from: accounts[0]});

        // second (final) signature
        var tx = await token.signTMAXChange(2000, {from: accounts[1]});
        var event = tx.logs.find((log) => log.event === "TMAXChanged");
        assert(Number(event.args.newTMAX) === 2000, 'TMAX is different from 2000!');

        // check TMAX
        var TMAX = await token.getTMAX.call();
        assert(Number(TMAX) === 2000, 'TMAX is different from 2000!');
    });

    it("Length of mint addresses and length of amounts differ", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.mint([accounts[2], accounts[3]], [600], {from: accounts[0]}), 'Number of accounts and amounts is not the same!');
    });

    it("Consensus mint higher than TMAX", async() => {
        let token = await BDAERC20.deployed();

        // first signature
        var tx = await token.signMint([accounts[2]], [20000], {from: accounts[0]});

        // check balance
        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 20, 'Balance is different from 20!');

        // second (final) signature
        var tx = await token.signMint([accounts[2]], [20000], {from: accounts[1]});
        var event = tx.logs.find((log) => log.event === "MintConsensus");
        assert(event.args.account === accounts[2], 'User is different from accounts[2]!');
        assert(Number(event.args.amount) === 20000, 'Amount is different from 20000!');

        // check balance
        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 20020, 'Balance is different from 20020!');

        // check already minted, since signMint shouldnt count into TMAX
        var minted = await token.mintedToday.call(accounts[0]);
        assert(Number(minted) === 50, 'Minted today is different from 50!');
        var minted = await token.mintedToday.call(accounts[1]);
        assert(Number(minted) === 0, 'Minted today is different from 0!');
    });

    it("Mint more than TOTAL_SUPPLY_CAP", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.signMint([accounts[2], accounts[3]], [600, 999000], {from: accounts[0]}), 'Token supply cap reached!');
    });
});

contract(' TEST SUITE 5 [ Transfer and Delegation ]', function(accounts) {
    // accounts[0] -- mint admin
    // accounts[1] -- verified user
    // accounts[2] -- verified user
    // accounts[3] -- verified user
    // accounts[4] -- non verified user

    it("Send tokens from and to non verified account", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.transfer(accounts[2], 10, {from: accounts[1]}), 'Sender is not verified!');
    });

    it("Send tokens from and to verified account", async() => {
        let token = await BDAERC20.deployed();

        // add IDP
        var tx = await token.signAddingIDP(IDP1Address, {from: accounts[0]});
        var event = tx.logs.find((log) => log.event === "IDPAdded");
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // verify accounts[1]
        var sig = await signMessage(accounts[1], IDP1PrivateKey);

        var tx = await token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[1]});
        var event = tx.logs.find((log) => log.event === "VerificationSuccessful");
        assert(event.args.user === accounts[1], 'User is different from accounts[1]!');
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // verify accounts[2]
        var sig = await signMessage(accounts[2], IDP1PrivateKey);

        var tx = await token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[2]});
        var event = tx.logs.find((log) => log.event === "VerificationSuccessful");
        assert(event.args.user === accounts[2], 'User is different from accounts[2]!');
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // verify accounts[3]
        var sig = await signMessage(accounts[3], IDP1PrivateKey);

        var tx = await token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[3]});
        var event = tx.logs.find((log) => log.event === "VerificationSuccessful");
        assert(event.args.user === accounts[3], 'User is different from accounts[3]!');
        assert(event.args.IDP === IDP1Address, 'IDP is different from IDP1Address!');

        // mint some tokens
        var tx = await token.mint([accounts[1], accounts[2]], [500, 100], {from: accounts[0]});
        var event = tx.logs.filter((log) => log.event === "Mint")[0];
        assert(event.args.account === accounts[1], 'User is different from accounts[1]!');
        assert(event.args.admin === accounts[0], 'Mint admin is different from accounts[0]!');
        assert(Number(event.args.amount) === 500, 'Amount is different from 500!');

        var event = tx.logs.filter((log) => log.event === "Mint")[1];
        assert(event.args.account === accounts[2], 'User is different from accounts[2]!');
        assert(event.args.admin === accounts[0], 'Mint admin is different from accounts[0]!');
        assert(Number(event.args.amount) === 100, 'Amount is different from 100!');

        // check balance
        var balance = await token.balanceOf.call(accounts[1]);
        assert(Number(balance) === 500, 'Balance is different from 500!');

        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 100, 'Balance is different from 100!');

        var balance = await token.balanceOf.call(accounts[3]);
        assert(Number(balance) === 0, 'Balance is different from 100!');

        // transfer
        var tx = await token.transfer(accounts[2], 25, {from: accounts[1]});
        var event = tx.logs.find((log) => log.event === "Transfer");
        assert(event.args.from === accounts[1], 'Sender is different from accounts[1]!');
        assert(event.args.to === accounts[2], 'Reciever is different from accounts[2]!');
        assert(Number(event.args.value) === 25, 'Value is different from 25!');

        // check balance
        var balance = await token.balanceOf.call(accounts[1]);
        assert(Number(balance) === 475, 'Balance is different from 475!');

        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 125, 'Balance is different from 125!');

        var balance = await token.balanceOf.call(accounts[3]);
        assert(Number(balance) === 0, 'Balance is different from 100!');
    });

    it("Send more than TRANSFERLIMIT", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.transfer(accounts[2], 200, {from: accounts[1]}), 'Daily transfer limit reached!');
    });

    it("Change TRANSFERLIMIT and send more", async() => {
        let token = await BDAERC20.deployed();

        // change transfer limit
        var tx = await token.signTransferLimitChange(accounts[1], 2000, {from: accounts[0]});
        var event = tx.logs.find((log) => log.event === "TransferLimitChanged");
        assert(event.args.user === accounts[1], 'User is defferent from accounts[2]!');
        assert(Number(event.args.newValue) === 2000, 'Transfer limit should be 2000!');

        // repeat failed transfer
        var tx = await token.transfer(accounts[2], 200, {from: accounts[1]});
        var event = tx.logs.find((log) => log.event === "Transfer");
        assert(event.args.from === accounts[1], 'Sender is different from accounts[1]!');
        assert(event.args.to === accounts[2], 'Reciever is different from accounts[2]!');
        assert(Number(event.args.value) === 200, 'Value is different from 200!');

        // check balance
        var balance = await token.balanceOf.call(accounts[1]);
        assert(Number(balance) === 275, 'Balance is different from 275!');

        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 325, 'Balance is different from 325!');
    });

    it("Send tokens without enough funds", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.transfer(accounts[2], 10, {from: accounts[3]}), "ERC20: transfer amount exceeds balance");
    });

    it("Approve non verified user for delegation", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.approve(accounts[4], 100, {from: accounts[1]}), 'Spender is not verified!');
    });

    // accounts[1] -- 275
    // accounts[2] -- 325
    // accounts[3] -- 0
    it("Approve another user for delegation", async() => {
        let token = await BDAERC20.deployed();

        // approve
        var tx = await token.approve(accounts[3], 50, {from: accounts[1]});
        var event = tx.logs.find((log) => log.event === "Approval");
        assert(event.args.owner === accounts[1], 'Owner is different from accounts[1]!');
        assert(event.args.spender === accounts[3], 'Spender is different from accounts[3]!');
        assert(Number(event.args.value) === 50, 'Value is different from 50!');

        // check allowance
        var allowance = await token.allowance.call(accounts[1], accounts[3]);
        assert(Number(allowance) === 50, 'Allowance is different from 50!');
    });

    it("Spend tokens by spender within limit", async() => {
        let token = await BDAERC20.deployed();

        // transfer from
        var tx = await token.transferFrom(accounts[1], accounts[2], 25, {from: accounts[3]});
        var event = tx.logs.find((log) => log.event === "Transfer");
        assert(event.args.from === accounts[1], 'Sender is different from accounts[1]!');
        assert(event.args.to === accounts[2], 'Reciever is different from accounts[2]!');
        assert(Number(event.args.value) === 25, 'Value is different from 25!');

        // check allowance
        var allowance = await token.allowance.call(accounts[1], accounts[3]);
        assert(Number(allowance) === 25, 'Allowance is different from 25!');

        // check balance
        var balance = await token.balanceOf.call(accounts[1]);
        assert(Number(balance) === 250, 'Balance is different from 250!');

        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 350, 'Balance is different from 350!');
    });

    it("Spend more than was approved", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.transferFrom(accounts[1], accounts[2], 50, {from: accounts[3]}), "ERC20: insufficient allowance");
    });

    it("Change amount of approval for the same user", async() => {
        let token = await BDAERC20.deployed();

        // approve again
        var tx = await token.approve(accounts[3], 60, {from: accounts[1]});
        var event = tx.logs.find((log) => log.event === "Approval");
        assert(event.args.owner === accounts[1], 'Owner is different from accounts[1]!');
        assert(event.args.spender === accounts[3], 'Spender is different from accounts[3]!');
        assert(Number(event.args.value) === 60, 'Value is different from 60!');

        // check allowance
        var allowance = await token.allowance.call(accounts[1], accounts[3]);
        assert(Number(allowance) === 60, 'Allowance is different from 60!');
    });

    it("Delegate more within limit", async() => {
        let token = await BDAERC20.deployed();

        // transfer from
        var tx = await token.transferFrom(accounts[1], accounts[2], 50, {from: accounts[3]});
        var event = tx.logs.find((log) => log.event === "Transfer");
        assert(event.args.from === accounts[1], 'Sender is different from accounts[1]!');
        assert(event.args.to === accounts[2], 'Reciever is different from accounts[2]!');
        assert(Number(event.args.value) === 50, 'Value is different from 50!');

        // check allowance
        var allowance = await token.allowance.call(accounts[1], accounts[3]);
        assert(Number(allowance) === 10, 'Allowance is different from 10!');

        // check balance
        var balance = await token.balanceOf.call(accounts[1]);
        assert(Number(balance) === 200, 'Balance is different from 200!');

        var balance = await token.balanceOf.call(accounts[2]);
        assert(Number(balance) === 400, 'Balance is different from 400!');
    });

    it("Methods increaseAllowance and decreaseAllowance are not part of ERC20", async() => {
        let token = await BDAERC20.deployed();

        await tryCatch(token.increaseAllowance(accounts[3], 50, {from: accounts[1]}), "Not part of ERC20!");
        await tryCatch(token.decreaseAllowance(accounts[3], 50, {from: accounts[1]}), "Not part of ERC20!");
    });
});

async function printGasUsage(call, functionName) {
    const tx = await call;
    const receipt = await web3.eth.getTransactionReceipt(tx.tx);
    console.log("    " + functionName + ": ", receipt.gasUsed);
}

contract(' TEST SUITE 6 [ Gas measurements ]', function(accounts) {
    it("Gas measurements", async() => {
        let token = await BDAERC20.deployed();


        await printGasUsage(token.signAddingIDP(IDP1Address, {from: accounts[0]}), "signAddingIDP");
        var sig = await signMessage(accounts[0], IDP1PrivateKey);
        await printGasUsage(token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[0]}), "verify");

        var sig = await signMessage(accounts[1], IDP1PrivateKey);
        token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[1]});
        var sig = await signMessage(accounts[2], IDP1PrivateKey);
        token.verify(sig.messageHash, sig.v, sig.r, sig.s, {from: accounts[2]});

        await printGasUsage(token.mint([accounts[0], accounts[1], accounts[2]], [100, 100, 100], {from: accounts[0]}), "mint");
        await printGasUsage(token.signMint([accounts[0], accounts[1], accounts[2]], [100, 100, 100], {from: accounts[0]}), "signMint");
        await printGasUsage(token.transfer(accounts[1], 1, {from: accounts[0]}), "transfer");
        await printGasUsage(token.approve(accounts[1], 10, {from: accounts[0]}), "approve");
        await printGasUsage(token.transferFrom(accounts[0], accounts[2], 1, {from: accounts[1]}), "transferFrom");
        await printGasUsage(token.signTransferLimitChange(accounts[0], 100, {from: accounts[0]}), "signTransferLimitChange");
        await printGasUsage(token.signTMAXChange(2000, {from: accounts[0]}), "signTMAXChange");
        await printGasUsage(token.signAddingMintingAdmin(accounts[1], {from: accounts[0]}), "signAddingMintingAdmin");
        await printGasUsage(token.signAddingIDPAdmin(accounts[1], {from: accounts[0]}), "signAddingIDPAdmin");
        await printGasUsage(token.signAddingRestrAdmin(accounts[1], {from: accounts[0]}), "signAddingRestrAdmin");

        token.signRemovingMintingAdmin(accounts[1], {from: accounts[1]});
        token.signRemovingIDPAdmin(accounts[1], {from: accounts[1]});
        token.signRemovingRestrAdmin(accounts[1], {from: accounts[1]});

        await printGasUsage(token.signRemovingMintingAdmin(accounts[1], {from: accounts[0]}), "signRemovingMintingAdmin");
        await printGasUsage(token.signRemovingIDPAdmin(accounts[1], {from: accounts[0]}), "signRemovingIDPAdmin");
        await printGasUsage(token.signRemovingRestrAdmin(accounts[1], {from: accounts[0]}), "signRemovingRestrAdmin");
        await printGasUsage(token.signRevoke(accounts[1], {from: accounts[0]}), "signRevoke");
        await printGasUsage(token.signApprove(accounts[1], {from: accounts[0]}), "signApprove");
        await printGasUsage(token.signRemovingIDP(IDP1Address, {from: accounts[0]}), "signRemovingIDP");
    });
});
