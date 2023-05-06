// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";


import "./Admins.sol";


contract BDAERC20 is ERC20 {
    // Admin contracts
    Admin public immutable adminMint;
    AdminIDP public immutable adminIDP;

    // we cannot use external database to store admin/user addresses so it must be stored in contract -- operations might be very gas expensive
    EnumerableMap.AddressToUintMap private verifiedUntil;

    uint constant public verifyExpiration =  31536000; // 1 year in seconds


    // events
    event VerificationSuccessful(address indexed user, address indexed IDP);
    event MintAdminAdded(address indexed admin);
    event MintAdminRemoved(address indexed admin);
    event IDPAdminAdded(address indexed admin);
    event IDPAdminRemoved(address indexed admin);
    event MintAdminAddSignature(address indexed admin, address indexed signer);
    event MintAdminRemoveSignature(address indexed admin, address indexed signer);
    event IDPAdminAddSignature(address indexed admin, address indexed signer);
    event IDPAdminRemoveSignature(address indexed admin, address indexed signer);
    event IDPAddSignature(address indexed IDP, address indexed signer);
    event IDPAdded(address indexed IDP);
    event IDPRemoveSignature(address indexed IDP, address indexed signer);
    event IDPRemoved(address indexed IDP);


    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // set msg.sender as the first admin in all admin roles
        adminMint = new Admin(msg.sender);
        adminIDP = new AdminIDP(msg.sender);
    }


    function isVerified(address user) public view returns (bool) {
        return EnumerableMap.contains(verifiedUntil, user) && (EnumerableMap.get(verifiedUntil, user) > block.timestamp);
    }


    function mint(address account, uint256 amount) public {
        require(adminIDP.isAdmin(msg.sender), "mintingAdmin role required!");
        _mint(account, amount);
    }


    function verify(bytes32 _hashedMessage, uint8 v, bytes32 r, bytes32 s) public {
        // reconstruct hash of message (address of sender)
        bytes32 hashedMessage = keccak256(abi.encodePacked((msg.sender)));
        bytes32 expectedHashedMessage = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hashedMessage));

        // check if given hash is correct
        require(_hashedMessage == expectedHashedMessage, "Message hash is incorrect!");

        // get public key (address) of signer (IDP)
        address signer = ecrecover(_hashedMessage, v, r, s);
        require(adminIDP.isIDP(signer), "Message was not signed by a valid IDP!");

        // message is correct, signature is of valid IDP
        // if user is already verified, it will only extend its experiation
        EnumerableMap.set(verifiedUntil, msg.sender, block.timestamp + verifyExpiration);
        emit VerificationSuccessful(msg.sender, signer);
    }


    function getMintContractAddress() public view returns (Admin) {
        return adminMint;
    }


    function getIDPContractAddress() public view returns (Admin) {
        return adminIDP;
    }


    function signAddingMintingAdmin(address addr) public {
        require(adminMint.isAdmin(msg.sender), "Mint admin role required!");

        if (adminMint.signAddingAdmin(addr, msg.sender)) {
            emit MintAdminAddSignature(addr, msg.sender);
            emit MintAdminAdded(addr);
        } else {
            emit MintAdminAddSignature(addr, msg.sender);
        }
    }


    function signAddingIDPAdmin(address addr) public {
        require(adminIDP.isAdmin(msg.sender), "IDP admin role required!");

        if (adminIDP.signAddingAdmin(addr, msg.sender)) {
            emit IDPAdminAddSignature(addr, msg.sender);
            emit IDPAdminAdded(addr);
        } else {
            emit IDPAdminAddSignature(addr, msg.sender);
        }
    }


    function signRemovingMintingAdmin(address addr) public {
        require(adminMint.isAdmin(msg.sender), "Mint admin role required!");

        if (adminMint.signRemovingAdmin(addr, msg.sender)) {
            emit MintAdminRemoveSignature(addr, msg.sender);
            emit MintAdminRemoved(addr);
        } else {
            emit MintAdminRemoveSignature(addr, msg.sender);
        }
    }


    function signRemovingIDPAdmin(address addr) public {
        require(adminIDP.isAdmin(msg.sender), "IDP admin role required!");

        if (adminIDP.signRemovingAdmin(addr, msg.sender)) {
            emit IDPAdminRemoveSignature(addr, msg.sender);
            emit IDPAdminRemoved(addr);
        } else {
            emit IDPAdminRemoveSignature(addr, msg.sender);
        }
    }


    function getMintAdmins() public view returns (address[] memory) {
        return adminMint.getAdmins();
    }


    function getIDPAdmins() public view returns (address[] memory) {
        return adminIDP.getAdmins();
    }


    function isMintAdmin(address addr) public view returns (bool) {
        return adminMint.isAdmin(addr);
    }


    function isIDPAdmin(address addr) public view returns (bool) {
        return adminIDP.isAdmin(addr);
    }


    function isIDP(address addr) public view returns (bool) {
        return adminIDP.isIDP(addr);
    }


    function signAddingIDP(address addr) public {
        require(adminIDP.isAdmin(msg.sender), "IDP admin role required!");

        if (adminIDP.signAddingIDP(addr, msg.sender)) {
            emit IDPAddSignature(addr, msg.sender);
            emit IDPAdded(addr);
        } else {
            emit IDPAddSignature(addr, msg.sender);
        }
    }


    function signRemovingIDP(address addr) public {
        require(adminIDP.isAdmin(msg.sender), "IDP admin role required!");

        if (adminIDP.signRemovingIDP(addr, msg.sender)) {
            emit IDPRemoveSignature(addr, msg.sender);
            emit IDPRemoved(addr);
        } else {
            emit IDPRemoveSignature(addr, msg.sender);
        }
    }


    function getIDPs() public view returns(address[] memory){
        return adminIDP.getIDPs();
    }
}