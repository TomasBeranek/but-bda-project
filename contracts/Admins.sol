// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


contract Admin {
    EnumerableSet.AddressSet internal admins;
    address internal immutable tokenContract;
    mapping (address => EnumerableSet.AddressSet) internal addSignatures;
    mapping (address => EnumerableSet.AddressSet) internal removeSignatures;


    constructor(address tokenOwner) {
        tokenContract = msg.sender;
        EnumerableSet.add(admins, tokenOwner);
    }


    function isAdmin(address addr) public view returns (bool) {
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");
        return EnumerableSet.contains(admins, addr);
    }


    function signAddingAdmin(address addr, address signer) public returns (bool) {
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");
        require(isAdmin(signer), "Admin role required!");
        require(!isAdmin(addr), "The proposed address is already an admin!");
        require(!EnumerableSet.contains(addSignatures[addr], signer), "The signer has already confirmed the addition of the admin!");

        // add sender as a signer -- no need to check return value since sender cant be there
        EnumerableSet.add(addSignatures[addr], signer);

        if (EnumerableSet.length(addSignatures[addr]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to add the new admin
            // 1) we delete all the signatures
            while (EnumerableSet.remove(addSignatures[addr], EnumerableSet.at(addSignatures[addr], uint(0)))) {
                if (EnumerableSet.length(addSignatures[addr]) == 0) {
                    break;
                }
            }

            // 2) we add proposed address as admin
            EnumerableSet.add(admins, addr);

            return true;
        }
        return false;
    }


    function signRemovingAdmin(address addr, address signer) public returns (bool) {
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");
        require(isAdmin(signer), "Admin role required!");
        require(isAdmin(addr), "The proposed address isn't an admin!");
        require(!EnumerableSet.contains(removeSignatures[addr], signer), "The signer has already confirmed the removal of the admin!");

        // add signer -- no need to check return value since sender cant be there
        EnumerableSet.add(removeSignatures[addr], signer);

        if (EnumerableSet.length(removeSignatures[addr]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to add the new admin
            // 1) we delete all the signatures
            while (EnumerableSet.remove(removeSignatures[addr], EnumerableSet.at(removeSignatures[addr], uint(0)))) {
                if (EnumerableSet.length(removeSignatures[addr]) == 0) {
                    break;
                }
            }

            // 2) we remove proposed address as admin
            EnumerableSet.remove(admins, addr);

            return true;
        }
        return false;
    }


    function getAdmins() public view returns(address[] memory){
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");

        bytes32[] memory addrsByte = admins._inner._values;
        address[] memory addrs = new address[](addrsByte.length);

        for (uint256 i = 0; i < addrsByte.length; i++) {
            addrs[i] = address(uint160(uint256(addrsByte[i])));
        }

        return addrs;
    }
}


contract AdminIDP is Admin {
    EnumerableSet.AddressSet internal IDPs;
    mapping (address => EnumerableSet.AddressSet) internal addIDPSignatures;
    mapping (address => EnumerableSet.AddressSet) internal removeIDPSignatures;


    constructor(address tokenOwner) Admin(tokenOwner) {}


    function isIDP(address addr) public view returns (bool) {
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");
        return EnumerableSet.contains(IDPs, addr);
    }


    function signAddingIDP(address addr, address signer) public returns (bool) {
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");
        require(isAdmin(signer), "IDP admin role required!");
        require(!EnumerableSet.contains(IDPs, addr), "The proposed address is already an IDP!");
        require(!EnumerableSet.contains(addIDPSignatures[addr], signer), "The signer has already confirmed the addition of the IDP!");

        // add signer -- no need to check return value since sender cant be there
        EnumerableSet.add(addIDPSignatures[addr], signer);

        if (EnumerableSet.length(addIDPSignatures[addr]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to add the IDP
            // 1) we delete all the signatures
            while (EnumerableSet.remove(addIDPSignatures[addr], EnumerableSet.at(addIDPSignatures[addr], uint(0)))) {
                if (EnumerableSet.length(addIDPSignatures[addr]) == 0) {
                    break;
                }
            }

            // 2) we add proposed address as an IDP
            EnumerableSet.add(IDPs, addr);

            return true;
        }
        return false;
    }


    function signRemovingIDP(address addr, address signer) public returns (bool) {
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");
        require(isAdmin(signer), "IDP admin role required!");
        require(EnumerableSet.contains(IDPs, addr), "The proposed address isn't an IDP!");
        require(!EnumerableSet.contains(removeIDPSignatures[addr], signer), "The signer has already confirmed the removal of the IDP!");

        // add signer -- no need to check return value since sender cant be there
        EnumerableSet.add(removeIDPSignatures[addr], signer);

        if (EnumerableSet.length(removeIDPSignatures[addr]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to add the IDP
            // 1) we delete all the signatures
            while (EnumerableSet.remove(removeIDPSignatures[addr], EnumerableSet.at(removeIDPSignatures[addr], uint(0)))) {
                if (EnumerableSet.length(removeIDPSignatures[addr]) == 0) {
                    break;
                }
            }

            // 2) we remove proposed address as an IDP
            EnumerableSet.remove(IDPs, addr);

            return true;
        }
        return false;
    }


    function getIDPs() public view returns(address[] memory){
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");

        bytes32[] memory addrsByte = IDPs._inner._values;
        address[] memory addrs = new address[](addrsByte.length);

        for (uint256 i = 0; i < addrsByte.length; i++) {
            addrs[i] = address(uint160(uint256(addrsByte[i])));
        }

        return addrs;
    }
}


// contract AdminMint is Admin {

// }