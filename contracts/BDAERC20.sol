// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
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


    function getAdmins() public view returns(bytes32[] memory){
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");
        return admins._inner._values;
    }
}


// contract AdminIDP is Admin {

// }


// contract AdminMint is Admin {

// }


contract BDAERC20 is ERC20 {
    // Admin contracts
    Admin public immutable adminMint;
    Admin public immutable adminIDP;

    // list of IDPs
    EnumerableSet.AddressSet private IDPs;

    // we cannot use external database to store admin/user addresses so it must be stored in contract -- operations might be very gas expensive
    // TODO: Use EnumerableSet.AddressSet
    mapping (address => uint) public isVerifiedUntil;
    address[] public verifiedUsers;

    uint constant public verifyExpiration =  31536000; // 1 year in seconds


    // events
    event VerificationSuccessful(address indexed user, address indexed idp);
    event MintAdminAdded(address admin);
    event MintAdminRemoved(address admin);
    event IDPAdminAdded(address admin);
    event IDPAdminRemoved(address admin);
    event MintAdminAddSignature(address admin, address signer);
    event MintAdminRemoveSignature(address admin, address signer);
    event IDPAdminAddSignature(address admin, address signer);
    event IDPAdminRemoveSignature(address admin, address signer);


    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // set msg.sender as the first admin in all admin roles
        adminMint = new Admin(msg.sender);
        adminIDP = new Admin(msg.sender);
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
        require(EnumerableSet.contains(IDPs, signer), "Message was not signed by a valid IDP!");

        // message is correct, signature is of valid IDP
        // if user is already verified, it will only extend its experiation
        isVerifiedUntil[msg.sender] = block.timestamp + verifyExpiration;
        verifiedUsers.push(msg.sender);
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
        bytes32[] memory addrsByte = adminMint.getAdmins();
        address[] memory addrs = new address[](addrsByte.length);

        for (uint256 i = 0; i < addrsByte.length; i++) {
            addrs[i] = address(uint160(uint256(addrsByte[i])));
        }

        return addrs;
    }


    function getIDPAdmins() public view returns (address[] memory) {
        bytes32[] memory addrsByte = adminIDP.getAdmins();
        address[] memory addrs = new address[](addrsByte.length);

        for (uint256 i = 0; i < addrsByte.length; i++) {
            addrs[i] = address(uint160(uint256(addrsByte[i])));
        }

        return addrs;
    }


    function isMintAdmin(address addr) public view returns (bool) {
        return adminMint.isAdmin(addr);
    }


    function isIDPAdmin(address addr) public view returns (bool) {
        return adminIDP.isAdmin(addr);
    }
}