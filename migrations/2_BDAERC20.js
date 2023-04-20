var W3 = require('web3');
var BDAERC20 = artifacts.require("BDAERC20");

// load parameters of BDAERC20
var conf = require("../config/BDAERC20_config.js");

module.exports = function(deployer, network, accounts) {
    if (network == "mainnet") {
        throw "Halt. Sanity check. Not ready for deployment to mainnet.";
    } else if (network == "sepolia" || network == "sepolia-fork") {
        throw "Halt. Sanity check. Not ready for deployment to 'sepolia'.";
    } else { // development & test networks
        // local blockchain
    }

    console.log('Deploying BDAERC20 to network', network);

    // anybody can deploy contract - e.g., accounts[0]
    result = deployer.deploy(BDAERC20, conf.NAME, conf.SYMBOL, { from: accounts[0], gas: 2 * 1000 * 1000 }).then(() => {
        console.log('Deployed BDAERC20 with address', BDAERC20.address);
        console.log("\t \\/== Default gas limit:", BDAERC20.class_defaults.gas);
    });
};