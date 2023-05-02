// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


contract Admin {
    EnumerableSet.AddressSet private admins;
    address private immutable tokenContract;
    mapping (address => EnumerableSet.AddressSet) addSignatures;
    mapping (address => EnumerableSet.AddressSet) removeSignatures;


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
        require(isAdmin(addr), "The proposed address isn't an admin!");
        require(!EnumerableSet.contains(removeSignatures[addr], signer), "The signer has already confirmed the removal of the admin!");

        // add sender as a signer -- no need to check return value since sender cant be there
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


// contract AdminIDP is Admin {

// }


// contract AdminMint is Admin {

// }