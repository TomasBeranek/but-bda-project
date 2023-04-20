// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BDAERC20 is ERC20, AccessControl {
    // why use hash function here?
    bytes32 public constant mintingAdmin = keccak256("mintingAdmin");
    bytes32 public constant idpAdmin = keccak256("idpAdmin");

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // _mint(msg.sender, initialSupply);
        _grantRole(mintingAdmin, msg.sender);
        _grantRole(idpAdmin, msg.sender);
    }

    function mint(address account, uint256 amount) public {
        require(hasRole(mintingAdmin, msg.sender), "mintingAdmin role required!");
        _mint(account, amount);
    }
}