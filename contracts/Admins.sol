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

    modifier onlyTokenContract {
        require(msg.sender == tokenContract, "This contract can be called only from BDAERC20 contract!");
        _;
    }

    function isAdmin(address addr) public view onlyTokenContract returns (bool) {
        return EnumerableSet.contains(admins, addr);
    }

    function signAddingAdmin(address addr, address signer) public onlyTokenContract returns (bool) {
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

    function signRemovingAdmin(address addr, address signer) public onlyTokenContract returns (bool) {
        require(isAdmin(signer), "Admin role required!");
        require(isAdmin(addr), "The proposed address isn't an admin!");
        require(!EnumerableSet.contains(removeSignatures[addr], signer), "The signer has already confirmed the removal of the admin!");
        require(EnumerableSet.length(admins) > 1, "Cannot remove the last admin!");

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

    function getAdmins() public view onlyTokenContract returns(address[] memory){
        bytes32[] memory addrsByte = admins._inner._values;
        address[] memory addrs = new address[](addrsByte.length);

        for (uint256 i = 0; i < addrsByte.length; i++) {
            addrs[i] = address(uint160(uint256(addrsByte[i])));
        }

        return addrs;
    }
}

contract AdminRestr is Admin {
    mapping (bytes32 => EnumerableSet.AddressSet) internal changeTransferLimitSignatures;

    constructor(address tokenOwner) Admin(tokenOwner) {}

    function signTransferLimitChange(bytes32 changeID, address signer) public onlyTokenContract returns(bool){
        require(isAdmin(signer), "Mint admin role required!");
        require(!EnumerableSet.contains(changeTransferLimitSignatures[changeID], signer), "The signer has already confirmed the trasnfer limit change!");

        // add signer -- no need to check return value since sender cant be there
        EnumerableSet.add(changeTransferLimitSignatures[changeID], signer);

        if (EnumerableSet.length(changeTransferLimitSignatures[changeID]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to do the minting
            // 1) we delete all the signatures
            while (EnumerableSet.remove(changeTransferLimitSignatures[changeID], EnumerableSet.at(changeTransferLimitSignatures[changeID], uint(0)))) {
                if (EnumerableSet.length(changeTransferLimitSignatures[changeID]) == 0) {
                    break;
                }
            }
            // 2) we return true
            return true;
        }
        return false;
    }
}

contract AdminMint is Admin {
    uint public TMAX = 1000;
    mapping (address => uint) mintedToday;
    mapping (address => uint) lastMintDay;
    mapping (bytes32 => EnumerableSet.AddressSet) internal mintSignatures;
    mapping (uint => EnumerableSet.AddressSet) internal changeTMAXSignatures;

    constructor(address tokenOwner) Admin(tokenOwner) {}

    function mintToday(address admin) public view onlyTokenContract returns(uint) {
        return mintedToday[admin];
    }

    function checkMintLimit(address admin, uint256 amount) public onlyTokenContract {
        require(isAdmin(admin), "Mint admin role required!");

        uint transactionDay =  block.timestamp / (24*3600);

        if (transactionDay > lastMintDay[admin]) {
            require(amount <= TMAX, "Admin can't mint more than TMAX in a single day!");
            // its a new day and we need to reset mintedToday for this admin and register current minting
            mintedToday[admin] = amount;
            lastMintDay[admin] = transactionDay;
        } else {
            // its not the first minting today
            require((amount + mintedToday[admin]) <= TMAX, "Admin can't mint more than TMAX in a single day!");

            mintedToday[admin] += amount;
        }
    }

    function signMint(bytes32 mintID, address signer) public onlyTokenContract returns(bool){
        require(isAdmin(signer), "Mint admin role required!");
        require(!EnumerableSet.contains(mintSignatures[mintID], signer), "The signer has already confirmed the minting!");

        // add signer -- no need to check return value since sender cant be there
        EnumerableSet.add(mintSignatures[mintID], signer);

        if (EnumerableSet.length(mintSignatures[mintID]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to do the minting
            // 1) we delete all the signatures
            while (EnumerableSet.remove(mintSignatures[mintID], EnumerableSet.at(mintSignatures[mintID], uint(0)))) {
                if (EnumerableSet.length(mintSignatures[mintID]) == 0) {
                    break;
                }
            }
            // 2) we return true
            return true;
        }
        return false;
    }

    function signTMAXChange(uint newTMAX, address signer) public onlyTokenContract returns (bool) {
        require(isAdmin(signer), "Mint admin role required!");
        require(!EnumerableSet.contains(changeTMAXSignatures[newTMAX], signer), "The signer has already confirmed the addition of the IDP!");

        // add signer -- no need to check return value since sender cant be there
        EnumerableSet.add(changeTMAXSignatures[newTMAX], signer);

        if (EnumerableSet.length(changeTMAXSignatures[newTMAX]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to add the IDP
            // 1) we delete all the signatures
            while (EnumerableSet.remove(changeTMAXSignatures[newTMAX], EnumerableSet.at(changeTMAXSignatures[newTMAX], uint(0)))) {
                if (EnumerableSet.length(changeTMAXSignatures[newTMAX]) == 0) {
                    break;
                }
            }

            // 2) we change TMAX
            TMAX = newTMAX;

            return true;
        }
        return false;
    }
}

contract AdminIDP is Admin {
    EnumerableSet.AddressSet internal IDPs;
    mapping (address => bool) internal isRevoked;
    mapping (address => EnumerableSet.AddressSet) internal addIDPSignatures;
    mapping (address => EnumerableSet.AddressSet) internal removeIDPSignatures;
    mapping (address => EnumerableSet.AddressSet) internal revokeSignatures;
    mapping (address => EnumerableSet.AddressSet) internal approveSignatures;

    constructor(address tokenOwner) Admin(tokenOwner) {}

    function isIDP(address addr) public view onlyTokenContract returns (bool) {
        return EnumerableSet.contains(IDPs, addr);
    }

    function signAddingIDP(address addr, address signer) public onlyTokenContract returns (bool) {
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

    function signRemovingIDP(address addr, address signer) public onlyTokenContract returns (bool) {
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

    function signRevoke(address addr, address signer) public onlyTokenContract returns (bool) {
        require(isAdmin(signer), "IDP admin role required!");
        require(!isRevoked[addr], "The proposed address is already revoked!");
        require(!EnumerableSet.contains(revokeSignatures[addr], signer), "The signer has already confirmed the revocation!");

        // add signer -- no need to check return value since sender cant be there
        EnumerableSet.add(revokeSignatures[addr], signer);

        if (EnumerableSet.length(revokeSignatures[addr]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to add the IDP
            // 1) we delete all the signatures
            while (EnumerableSet.remove(revokeSignatures[addr], EnumerableSet.at(revokeSignatures[addr], uint(0)))) {
                if (EnumerableSet.length(revokeSignatures[addr]) == 0) {
                    break;
                }
            }

            // 2) we revoke the user
            isRevoked[addr] = true;

            return true;
        }
        return false;
    }

    function signApprove(address addr, address signer) public onlyTokenContract returns (bool) {
        require(isAdmin(signer), "IDP admin role required!");
        require(isRevoked[addr], "The proposed address is not revoked!");
        require(!EnumerableSet.contains(approveSignatures[addr], signer), "The signer has already confirmed the approval!");

        // add signer -- no need to check return value since sender cant be there
        EnumerableSet.add(approveSignatures[addr], signer);

        if (EnumerableSet.length(approveSignatures[addr]) > (EnumerableSet.length(admins) / 2)) {
            // we have enough signatures to add the IDP
            // 1) we delete all the signatures
            while (EnumerableSet.remove(approveSignatures[addr], EnumerableSet.at(approveSignatures[addr], uint(0)))) {
                if (EnumerableSet.length(approveSignatures[addr]) == 0) {
                    break;
                }
            }

            // 2) we approve the user
            isRevoked[addr] = false;

            return true;
        }
        return false;
    }

    function userIsRevoked(address user) public view onlyTokenContract returns(bool){
        return isRevoked[user];
    }

    function getIDPs() public view onlyTokenContract returns(address[] memory){
        bytes32[] memory addrsByte = IDPs._inner._values;
        address[] memory addrs = new address[](addrsByte.length);

        for (uint256 i = 0; i < addrsByte.length; i++) {
            addrs[i] = address(uint160(uint256(addrsByte[i])));
        }

        return addrs;
    }
}