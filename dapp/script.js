let web3;
let BDAERC20Contract;
let activeTab = 'user-tab';

// Mnemonic for accounts in ganache-cli
// logic comic motion galaxy replace mimic warfare dilemma usual blame palm receive
function getContract(web3) {
    const abi = [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"_totalSupplyCap","type":"uint256"},{"internalType":"uint256","name":"_transferlimit","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"IDP","type":"address"}],"name":"IDPAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"admin","type":"address"}],"name":"IDPAdminAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"admin","type":"address"}],"name":"IDPAdminRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"IDP","type":"address"}],"name":"IDPRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"admin","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"admin","type":"address"}],"name":"MintAdminAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"MintAdminChangeTMAX","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"admin","type":"address"}],"name":"MintAdminRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"MintConsensus","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"admin","type":"address"}],"name":"RestrAdminAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"admin","type":"address"}],"name":"RestrAdminRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTMAX","type":"uint256"}],"name":"TMAXChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"newValue","type":"uint256"}],"name":"TransferLimitChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"UserApproved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"UserRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"IDP","type":"address"}],"name":"VerificationSuccessful","type":"event"},{"inputs":[],"name":"TOTAL_SUPPLY_CAP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFERLIMIT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"adminIDP","outputs":[{"internalType":"contract AdminIDP","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"adminMint","outputs":[{"internalType":"contract AdminMint","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"adminRestr","outputs":[{"internalType":"contract AdminRestr","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getIDPAdmins","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getIDPContractAddress","outputs":[{"internalType":"contract Admin","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getIDPs","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMintAdmins","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMintContractAddress","outputs":[{"internalType":"contract Admin","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRestrAdmins","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTMAX","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getTransferLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVerifiedUsers","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"isIDP","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"isIDPAdmin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"isMintAdmin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"isRestrAdmin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isRevoked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isVerified","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isVerifiedUntil","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"mintedToday","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signAddingIDP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signAddingIDPAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signAddingMintingAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signAddingRestrAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signApprove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"signMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signRemovingIDP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signRemovingIDPAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signRemovingMintingAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signRemovingRestrAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"signRevoke","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newTMAX","type":"uint256"}],"name":"signTMAXChange","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"newValue","type":"uint256"}],"name":"signTransferLimitChange","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"transferedToday","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_hashedMessage","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"verify","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"verifyExpiration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
    const deployedContractAddr = "0xEbf5a17FC0931c7C5C420BdD163D682fc93366d6";
    return new web3.eth.Contract(abi, deployedContractAddr);
}

function toggleDropdown(button) {
    var dropdown = button.parentNode.parentNode;
    dropdown.classList.toggle('is-active');
}

function extractRevertMessage(message) {
    if (message.includes("User denied transaction")) {
        return "User denied transaction";
    } else {
        revertMessage = message.split("VM Exception while processing transaction: revert ")[1];

        if (typeof revertMessage === "undefined") {
            return message.split('{"message":"')[1].split('","')[0];
        } else {
            return revertMessage.split("!")[0];;
        }
    }
}

async function userTransfer() {
    const reciever = document.querySelector("#transfer-addr").value;
    const amount = document.querySelector("#transfer-amount").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.transfer(reciever, amount).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Transfer transaction sent succesfully.", "green");
}

async function approveDelegation() {
    const owner = document.querySelector("#account-addr").innerHTML;
    const amount = document.querySelector("#delegate-amount").value;
    const spender = document.querySelector("#delegate-addr").value;

    try {
        await BDAERC20Contract.methods.approve(spender, amount).send( {from: owner} );
    } catch (error) {
        console.log(error);
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Approve delegation transaction sent succesfully.", "green");
}

async function getAllowance() {
    const owner = document.querySelector("#sender-addr").value;
    const spender = document.querySelector("#account-addr").innerHTML;
    var allowance;

    try {
        allowance = await BDAERC20Contract.methods.allowance(owner, spender).call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    document.querySelector("#allowance").innerHTML = allowance + " BDAT";
    showPopupMessage("Allowance retrieved succesfully.", "green");
}

async function sendDelegationTransfer() {
    const from = document.querySelector("#sender-addr").value;
    const to = document.querySelector("#reciever-addr").value;
    const amount = document.querySelector("#delegate-transfer-amount").value;
    const spender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.transferFrom(from, to, amount).send( {from: spender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    await getAllowance();
    showPopupMessage("Delegataion transfer transaction sent succesfully.", "green");
}

async function changeTMAX() {
    const sender = document.querySelector("#account-addr").innerHTML;
    const newTMAX = document.querySelector("#change-tmax").value;

    try {
        await BDAERC20Contract.methods.signTMAXChange(newTMAX).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Maximum minting per day change transaction sent succesfully.", "green");
}

async function adminMint() {
    const sender = document.querySelector("#account-addr").innerHTML;
    const divs = document.querySelectorAll("#mint-account");
    var recievers = [];
    var amounts = [];

    for (let i = 0; i < divs.length; i++) {
        recievers.push(divs[i].querySelector("#mint-addr").value);
        amounts.push(divs[i].querySelector("#mint-amount").value);
    }

    try {
        await BDAERC20Contract.methods.mint(recievers, amounts).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Minting transaction sent succesfully.", "green");
}

async function adminMintConsensus() {
    const sender = document.querySelector("#account-addr").innerHTML;
    const divs = document.querySelectorAll("#mint-account");
    var recievers = [];
    var amounts = [];

    for (let i = 0; i < divs.length; i++) {
        recievers.push(divs[i].querySelector("#mint-addr").value);
        amounts.push(divs[i].querySelector("#mint-amount").value);
    }

    try {
        await BDAERC20Contract.methods.signMint(recievers, amounts).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Minting with consensus signature transaction sent succesfully.", "green");
}

async function addMintAdmin() {
    const newAddr = document.querySelector("#add-mint-admin-addr").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signAddingMintingAdmin(newAddr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Add mint admin signature transaction sent succesfully.", "green");
}

async function removeMintAdmin() {
    const addr = document.querySelector("#remove-mint-admin-addr").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signRemovingMintingAdmin(addr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Remove mint admin signature transaction sent succesfully.", "green");
}

async function addIDPAdmin() {
    const newAddr = document.querySelector("#add-idp-admin-addr").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signAddingIDPAdmin(newAddr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Add IDP admin signature transaction sent succesfully.", "green");
}

async function removeIDPAdmin() {
    const addr = document.querySelector("#remove-idp-admin-addr").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signRemovingIDPAdmin(addr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Remove IDP admin signature transaction sent succesfully.", "green");
}

async function addRestrAdmin() {
    const newAddr = document.querySelector("#add-restr-admin-addr").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signAddingRestrAdmin(newAddr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Add restriction admin signature transaction sent succesfully.", "green");
}

async function removeRestrAdmin() {
    const addr = document.querySelector("#remove-restr-admin-addr").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signRemovingRestrAdmin(addr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Remove restriction admin signature transaction sent succesfully.", "green");
}

async function addIDP() {
    const newAddr = document.querySelector("#add-idp-addr").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signAddingIDP(newAddr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Add IDP signature transaction sent succesfully.", "green");
}

async function removeIDP() {
    const addr = document.querySelector("#remove-idp-addr").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signRemovingIDP(addr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Remove IDP signature transaction sent succesfully.", "green");
}

async function reloadUserData() {
    // Check if user is verfied/revoked
    const accountAddress = document.querySelector("#account-addr").innerHTML;
    var isVerified;
    var isRevoked;

    try {
        isVerified = await BDAERC20Contract.methods.isVerified(accountAddress).call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    try {
        isRevoked = await BDAERC20Contract.methods.isRevoked(accountAddress).call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    if (!isVerified && !isRevoked) {
        document.querySelector("#account-balance").innerHTML = "-";
        document.querySelector("#account-transfered-today").innerHTML = "-";
        document.querySelector("#account-transfer-limit").innerHTML = "-";
        document.querySelector("#verified-until").innerHTML = 'Not verified &thinsp;<i class="fas fa-times has-text-danger"></i>';
        document.querySelector("#verify-button").innerHTML = "Verify";
        let userDivs = document.querySelectorAll('div#user-send-tokens');
        for (let i = 0; i < userDivs.length; i++) {
            userDivs[i].style.display = 'none'; // Hide menu for sending tokens etc.
        }
    } else if (!isVerified && isRevoked) {
        document.querySelector("#account-balance").innerHTML = await getBalance(accountAddress) + " BDAT";
        document.querySelector("#account-transfered-today").innerHTML = await getTranseferedToday(accountAddress) + " BDAT";
        document.querySelector("#account-transfer-limit").innerHTML = await getTransferLimit(accountAddress) + " BDAT";
        document.querySelector("#verified-until").innerHTML = 'Revoked &thinsp;<i class="fas fa-times has-text-danger"></i>';
        document.querySelector("#verify-button").innerHTML = "Extend expiration";
        let userDivs = document.querySelectorAll('div#user-send-tokens');
        for (let i = 0; i < userDivs.length; i++) {
            userDivs[i].style.display = 'none'; // Hide menu for sending tokens etc.
        }
    } else if (isVerified && !isRevoked) {
        document.querySelector("#account-balance").innerHTML = await getBalance(accountAddress) + " BDAT";
        document.querySelector("#account-transfered-today").innerHTML = await getTranseferedToday(accountAddress) + " BDAT";
        document.querySelector("#account-transfer-limit").innerHTML = await getTransferLimit(accountAddress) + " BDAT";
        const date = new Date((await getVerifiedUntil(accountAddress)) * 1000);
        document.querySelector("#verified-until").innerHTML = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()} &thinsp;<i class="fas fa-check has-text-success">`;
        document.querySelector("#verify-button").innerHTML = "Extend expiration";
        let userDivs = document.querySelectorAll('div#user-send-tokens');
        for (let i = 0; i < userDivs.length; i++) {
            userDivs[i].style.display = ''; // Show menu for sending tokens etc.
        }
    }
}

async function getBalance(accountAddress) {
    try {
        return await BDAERC20Contract.methods.balanceOf(accountAddress).call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
    }
    return "-";
}

async function getTranseferedToday(accountAddress) {
    try {
        return await BDAERC20Contract.methods.transferedToday(accountAddress).call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
    }
    return "-";
}

async function getTransferLimit(accountAddress) {
    try {
        return await BDAERC20Contract.methods.getTransferLimit(accountAddress).call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
    }
    return "-";
}

async function getVerifiedUntil(accountAddress) {
    try {
        return await BDAERC20Contract.methods.isVerifiedUntil(accountAddress).call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
    }
    return "-";
}

async function signMessage(accountAddr, privateKey) {
    // it needs to be in lower case, because solidity doesnt save address (msg.sender) in mixed case (mixed case == checksum)
    var message = accountAddr.toLowerCase();

    // hash message
    var hashedMessage = web3.utils.soliditySha3(message);

    // sign message (hash of address of user)
    return await web3.eth.accounts.sign(hashedMessage, privateKey);
}

async function verifyUser() {
    const accountAddress = document.querySelector("#account-addr").innerHTML;

    const IDP1Address    = '0x2E3167f191D4c98fE8f744D55f43CAF303f9c1AB';
    const IDP1PrivateKey = '0x5b23605f0e859b228a7a20452bd5c1d1b89b1928adb05f2f885c03032e0ccf3d';
    const IDP2Address    = '0x5e36A5756ea287acBFf852D99d357Bd8524C7B1f';
    const IDP2PrivateKey = '0xf1e1f9bcbb533418fef089ba4c6b700e4473d7cdfde56b2310faedc703aaf577';

    var sig = await signMessage(accountAddress, IDP1PrivateKey);

    try {
        await BDAERC20Contract.methods.verify(sig.messageHash, sig.v, sig.r, sig.s).send( {from: accountAddress} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Verify transaction sent succesfully.", "green");

    // Show default tab
    showTab("user-tab");

    // Load address list
    reloadAddressList();
}

async function approveUser() {
    const addr = document.querySelector("#approve-user").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signApprove(addr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Approve user signature transaction sent succesfully.", "green");
}

async function revokeUser() {
    const addr = document.querySelector("#revoke-user").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signRevoke(addr).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Revoke user signature transaction sent succesfully.", "green");
}

async function changeTransferLimit() {
    const addr = document.querySelector("#transfer-limit-addr").value;
    const newValue = document.querySelector("#new-transfer-limit").value;
    const sender = document.querySelector("#account-addr").innerHTML;

    try {
        await BDAERC20Contract.methods.signTransferLimitChange(addr, newValue).send( {from: sender} );
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    showPopupMessage("Change user transfer limit signature transaction sent succesfully.", "green");
}


async function reloadMintAdminData() {
    const accountAddress = document.querySelector("#account-addr").innerHTML;
    var mintedToday;
    var tmax;

    try {
        mintedToday = await BDAERC20Contract.methods.mintedToday(accountAddress).call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    try {
        tmax = await BDAERC20Contract.methods.getTMAX().call();
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    var mintLeft = tmax - mintedToday;

    document.querySelector("#mint-today").innerHTML = mintedToday + " BDAT";
    document.querySelector("#mint-left").innerHTML = mintLeft + " BDAT";
    document.querySelector("#mint-tmax").innerHTML = tmax + " BDAT";
}

function showTab(tabName) {
  // Make everything invisible
  let userDivs = document.querySelectorAll('div#user');
  for (let i = 0; i < userDivs.length; i++) {
      userDivs[i].style.display = 'none';
  }

  let user2Divs = document.querySelectorAll('div#user-send-tokens');
  for (let i = 0; i < user2Divs.length; i++) {
    user2Divs[i].style.display = 'none';
  }

  let mintDivs = document.querySelectorAll('div#mint-admin');
  for (let i = 0; i < mintDivs.length; i++) {
      mintDivs[i].style.display = 'none';
  }

  let idpDivs = document.querySelectorAll('div#idp-admin');
  for (let i = 0; i < idpDivs.length; i++) {
      idpDivs[i].style.display = 'none';
  }

  let restrDivs = document.querySelectorAll('div#restriction-admin');
  for (let i = 0; i < restrDivs.length; i++) {
      restrDivs[i].style.display = 'none';
  }

  if (tabName == "user-tab") {
      // Display user settings
      for (let i = 0; i < userDivs.length; i++) {
          userDivs[i].style.display = '';
      }
        // Display user settings
        for (let i = 0; i < user2Divs.length; i++) {
            user2Divs[i].style.display = '';
        }
      reloadUserData();
  } else if (tabName == "mint-admin-tab") {
      // Display mint admin settings
      for (let i = 0; i < mintDivs.length; i++) {
          mintDivs[i].style.display = '';
      }
      reloadMintAdminData();
  } else if (tabName == "idp-admin-tab") {
      // Display IDP admin settings
      for (let i = 0; i < idpDivs.length; i++) {
          idpDivs[i].style.display = '';
      }
    //   reloadIDPAdminData();
  } else if (tabName == "restriction-admin-tab") {
      // Display restriction admin settings
      for (let i = 0; i < restrDivs.length; i++) {
          restrDivs[i].style.display = '';
      }
    //   reloadRestrAdminData();
  }
}

function tabHandler(event) {
    var tabName = event.target.parentElement.id;
    activateTab(tabName);
}

function activateTab(tabName) {
    const clickedTab =document.getElementById(tabName);
    const tabs = document.querySelectorAll('.roles');
    // Remove "is-active" class from all tabs
    tabs.forEach(tab => {
        tab.classList.remove('is-active');
    });

    // Add "is-active" class to clicked tab
    clickedTab.classList.add('is-active');

    activeTab = tabName;
    showTab(tabName);
}

function dropdownItemHandler(event) {
    document.getElementById("dropdown-text").innerHTML = event.target.innerHTML;
    reloadAddressList();
}

function addMintAccount() {
    var original = document.querySelector("#mint-account");
    var copy = original.cloneNode(true);

    // Remove all labels
    var labelElements = copy.querySelectorAll("label");
    for (var i = 0; i < labelElements.length; i++) {
        labelElements[i].parentNode.removeChild(labelElements[i]);
    }

    var lastSibling = original.parentNode.lastElementChild; // use lastElementChild instead of lastChild
    original.parentNode.insertBefore(copy, lastSibling);
}

async function redirectToDAPP() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (e) {
            showPopupMessage("Error: " + e.message, "red");
            return;
        }
    } else {
        showPopupMessage("Error: MetMask not detected!", "red");
        return;
    }

    if (typeof web3 === "undefined") {
        web3 = new window.Web3(window.ethereum);
        if (typeof BDAERC20Contract === "undefined") {
            // Load object with ABI and contract address
            BDAERC20Contract = await getContract(web3);
        }
    }

    window.location.href = 'bdat-dapp.html';
}

function removeMintAccount() {
    var parent = document.querySelector("#mint-account").parentNode;
    console.log(parent.children);
    if (parent.children.length > 2) {
        var secondToLastChild = parent.children[parent.children.length - 2]; // get the second to last child node
        parent.removeChild(secondToLastChild); // remove the second to last child node
    }
}

async function reloadAddressList() {
    var role = document.getElementById("dropdown-text").innerHTML;
    var addrs = [];

    if (role === "Mint admin") {
        try {
            addrs = await BDAERC20Contract.methods.getMintAdmins().call();
        } catch (error) {
            showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
            return;
        }
    } else if (role === "IDP admin") {
        try {
            addrs = await BDAERC20Contract.methods.getIDPAdmins().call();
        } catch (error) {
            showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
            return;
        }
    } else if (role === "Restr admin") {
        try {
            addrs = await BDAERC20Contract.methods.getRestrAdmins().call();
        } catch (error) {
            showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
            return;
        }
    } else if (role === "Identity provider") {
        try {
            addrs = await BDAERC20Contract.methods.getIDPs().call();
        } catch (error) {
            showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
            return;
        }
    } else if (role === "Verified user") {
        try {
            addrs = await BDAERC20Contract.methods.getVerifiedUsers().call();
        } catch (error) {
            showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
            return;
        }
        addrs = addrs.filter(item => item !== "0x0000000000000000000000000000000000000000")
    }

    // Remove previous content
    document.querySelector("#table-addrs").innerHTML = "";

    for (var i = 0; i < addrs.length; i++) {
        document.querySelector("#table-addrs").innerHTML += `<tr><th>${i+1}</th><td>${addrs[i]}</td></tr>`;
    }
}

async function hideRoles() {
    const account = document.querySelector("#account-addr").innerHTML;
    var isMintAdmin;
    var isIDPAdmin;
    var isRestrAdmin;

    try {
        isMintAdmin = await BDAERC20Contract.methods.isMintAdmin(account).call();
        if (isMintAdmin) {
            document.querySelector("#mint-admin-tab").style.display = "block";
        } else {
            document.querySelector("#mint-admin-tab").style.display = "none";
        }
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }


    try {
        isIDPAdmin = await BDAERC20Contract.methods.isIDPAdmin(account).call();
        if (isIDPAdmin) {
            document.querySelector("#idp-admin-tab").style.display = "block";
        } else {
            document.querySelector("#idp-admin-tab").style.display = "none";
        }
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    try {
        isRestrAdmin = await BDAERC20Contract.methods.isRestrAdmin(account).call();
        if (isRestrAdmin) {
            document.querySelector("#restriction-admin-tab").style.display = "block";
        } else {
            document.querySelector("#restriction-admin-tab").style.display = "none";
        }
    } catch (error) {
        showPopupMessage("Error: " + extractRevertMessage(error.message) + "!", "red");
        return;
    }

    return [isMintAdmin, isIDPAdmin, isRestrAdmin]
}

function showPopupMessage(message, color) {
    if (color === "red") {
        document.querySelector('.popup-content').style.backgroundColor = "#f14668";
    } else if (color === "green") {
        document.querySelector('.popup-content').style.backgroundColor = "#00d1b2";
    }

    // Show the popup
    const popup = document.querySelector('.popup');
    popup.style.display = 'block';

    // Set the message
    const popupMessage = document.querySelector('#popup-message');
    popupMessage.textContent = message;

    // Fade out the popup after 3 seconds
    setTimeout(function() { hidePopupMessage(); }, 4000);
}

function hidePopupMessage() {
    // Hide the popup
    const popup = document.querySelector('.popup');
    popup.style.display = 'none';
}

async function init() {
    // Listen for the accountsChanged event
    window.ethereum.on("accountsChanged", function (accounts) {
        activeTab = 'user-tab';
        init();
    });

    if (window.location.pathname.split('/').pop() !== "bdat-dapp.html") {
        return;
    }

    if (typeof web3 === "undefined") {
        web3 = new window.Web3(window.ethereum);
        if (typeof BDAERC20Contract === "undefined") {
            // Load object with ABI and contract address
            BDAERC20Contract = await getContract(web3);
        }
    }

    // Close dropdown menus when user clicks outside of them
    document.addEventListener('click', function (event) {
        var dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(function (dropdown) {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('is-active');
            }
        });
    });

    // Dont reload or send forms when button is pressed
    var buttons = document.querySelectorAll("button");

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function(event) {
        event.preventDefault();
      });
    }

    // Init list of addresses taken from wallet -- for privacy reason metamask return only default address
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length > 0) {
        document.querySelector("#account-addr").innerHTML = accounts[0];
    } else {
        showPopupMessage("Error: No accounts in the wallet!", "red");
    }

    // Hide tabs of roles, which the account doesnt have
    hideRoles();

    // Make User active tab
    const tabs = document.querySelectorAll('.roles');
    tabs.forEach(tab => {
        tab.classList.remove('is-active');
    });
    document.querySelector("#user-tab").classList.add('is-active'); //99.8031ETH

    // Show default tab
    showTab("user-tab");

    // Load address list
    reloadAddressList();

    // Add listeners for contract events
    BDAERC20Contract.events.VerificationSuccessful({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (event.returnValues.user.toLowerCase() === account) {
            if (activeTab === "user-tab") {
                reloadUserData();
            }
            showPopupMessage("Verification successful.", "green");
        }

        if (document.getElementById("dropdown-text").innerHTML === "Verified user") {
            reloadAddressList();
        }
    });

    BDAERC20Contract.events.Transfer({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (event.returnValues.to.toLowerCase() === account) {
            if (activeTab === 'user-tab') {
                reloadUserData();
            }
            showPopupMessage("Tokens recieved.", "green");
        }

        if (event.returnValues.from.toLowerCase() === account) {
            if (activeTab === 'user-tab') {
                reloadUserData();
            }
            showPopupMessage("Tokens sent.", "green");
        }
    });

    BDAERC20Contract.events.MintAdminAdded({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (event.returnValues.admin.toLowerCase() === account) {
            hideRoles(); // Add new tab since we got a new role
            showPopupMessage("Mint admin added.", "green");
        }

        if (document.getElementById("dropdown-text").innerHTML === "Mint admin") {
            reloadAddressList();
        }
    });

    BDAERC20Contract.events.MintAdminRemoved({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (document.getElementById("dropdown-text").innerHTML === "Mint admin") {
            reloadAddressList();
        }

        if ((event.returnValues.admin.toLowerCase() === account) && (activeTab === "mint-admin-tab")) {
            activateTab("user-tab");
            hideRoles();
            showPopupMessage("Mint admin removed.", "green");
        }
    });

    BDAERC20Contract.events.IDPAdminAdded({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (event.returnValues.admin.toLowerCase() === account) {
            hideRoles(); // Add new tab since we got a new role
            showPopupMessage("IDP admin added.", "green");
        }

        if (document.getElementById("dropdown-text").innerHTML === "IDP admin") {
            reloadAddressList();
        }
    });

    BDAERC20Contract.events.IDPAdminRemoved({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (document.getElementById("dropdown-text").innerHTML === "IDP admin") {
            reloadAddressList();
        }

        if ((event.returnValues.admin.toLowerCase() === account) && (activeTab === "idp-admin-tab")) {
            activateTab("user-tab");
            hideRoles();
            showPopupMessage("IDP admin removed.", "green");
        }
    });

    BDAERC20Contract.events.RestrAdminAdded({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (event.returnValues.admin.toLowerCase() === account) {
            hideRoles(); // Add new tab since we got a new role
            showPopupMessage("Restriction admin added.", "green");
        }

        if (document.getElementById("dropdown-text").innerHTML === "Restr admin") {
            reloadAddressList();
        }
    });

    BDAERC20Contract.events.RestrAdminRemoved({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (document.getElementById("dropdown-text").innerHTML === "Restr admin") {
            reloadAddressList();
        }

        if ((event.returnValues.admin.toLowerCase() === account) && (activeTab === "restriction-admin-tab")) {
            activateTab("user-tab");
            hideRoles();
            showPopupMessage("Restriction admin removed.", "green");
        }
    });

    BDAERC20Contract.events.IDPAdded({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        if (document.getElementById("dropdown-text").innerHTML === "Identity provider") {
            reloadAddressList();
        }
    });

    BDAERC20Contract.events.IDPRemoved({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        if (document.getElementById("dropdown-text").innerHTML === "Identity provider") {
            reloadAddressList();
        }
    });

    BDAERC20Contract.events.UserRevoked({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (document.getElementById("dropdown-text").innerHTML === "Verified user") {
            reloadAddressList();
        }

        if (event.returnValues.user.toLowerCase() !== account) {
            return;
        }

        if (activeTab === "user-tab") {
            reloadUserData();
        }

        showPopupMessage("User revoked.", "green");
    });

    BDAERC20Contract.events.UserApproved({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (document.getElementById("dropdown-text").innerHTML === "Verified user") {
            reloadAddressList();
        }

        if (event.returnValues.user.toLowerCase() !== account) {
            return;
        }

        if (activeTab === "user-tab") {
            reloadUserData();
        }

        showPopupMessage("User approved.", "green");
    });

    BDAERC20Contract.events.Mint({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        console.log(activeTab);
        if (event.returnValues.account.toLowerCase() === account) {
            if (activeTab === 'user-tab') {
                reloadUserData();
            }
            showPopupMessage("Tokens minted.", "green");
        }

        if (event.returnValues.admin.toLowerCase() === account) {
            if (activeTab === 'mint-admin-tab') {
                reloadMintAdminData();
            }
            showPopupMessage("Tokens minted.", "green");
        }
    });

    BDAERC20Contract.events.MintConsensus({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (event.returnValues.account.toLowerCase() === account) {
            if (activeTab === 'user-tab') {
                reloadUserData();
            }
            showPopupMessage("Tokens minted with consensus.", "green");
        }
    });

    BDAERC20Contract.events.TMAXChanged({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        if (activeTab === 'mint-admin-tab') {
            reloadMintAdminData();
            showPopupMessage("Maximum minting per day changed.", "green");
        }
    });

    BDAERC20Contract.events.TransferLimitChanged({}, function(error, event) {
        if (error) {
            showPopupMessage(error.message, "red");
            return;
        }

        const account = document.querySelector("#account-addr").innerHTML;

        if (event.returnValues.user.toLowerCase() !== account) {
            return;
        }

        if (activeTab === 'user-tab') {
            reloadUserData();
        }

        showPopupMessage("Transfer limit per day changed.", "green");
    });
}

window.onload = init;
