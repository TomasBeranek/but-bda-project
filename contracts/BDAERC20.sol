// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import "./Admins.sol";

contract BDAERC20 is ERC20 {
    // Admin contracts
    AdminMint public immutable adminMint;
    AdminIDP public immutable adminIDP;
    AdminRestr public immutable adminRestr;

    // we cannot use external database to store admin/user addresses so it must be stored in contract -- operations might be very gas expensive
    EnumerableMap.AddressToUintMap private verifiedUntil;
    address[] private verifiedUsersAddrs;

    uint constant public verifyExpiration =  31536000; // 1 year in seconds
    uint public immutable TOTAL_SUPPLY_CAP;

    // transfer restrictions for user
    uint public immutable TRANSFERLIMIT;
    EnumerableMap.AddressToUintMap private transferLimit;
    mapping (address => uint) sentToday;
    mapping (address => uint) lastSentDay;

    // events
    event VerificationSuccessful(address indexed user, address indexed IDP);
    event MintAdminAdded(address indexed admin);
    event MintAdminRemoved(address indexed admin);
    event IDPAdminAdded(address indexed admin);
    event IDPAdminRemoved(address indexed admin);
    event RestrAdminAdded(address indexed admin);
    event RestrAdminRemoved(address indexed admin);
    // event MintAdminAddSignature(address indexed admin, address indexed signer);
    // event MintAdminRemoveSignature(address indexed admin, address indexed signer);
    // event IDPAdminAddSignature(address indexed admin, address indexed signer);
    // event IDPAdminRemoveSignature(address indexed admin, address indexed signer);
    // event RestrAdminAddSignature(address indexed admin, address indexed signer);
    // event RestrAdminRemoveSignature(address indexed admin, address indexed signer);
    // event IDPAddSignature(address indexed IDP, address indexed signer);
    event IDPAdded(address indexed IDP);
    // event IDPRemoveSignature(address indexed IDP, address indexed signer);
    event IDPRemoved(address indexed IDP);
    // event RevokeSignature(address indexed user, address indexed signer);
    event UserRevoked(address indexed user);
    // event ApproveSignature(address indexed user, address indexed signer);
    event UserApproved(address indexed user);
    event Mint(address indexed account, address indexed admin, uint amount);
    event MintConsensus(address indexed account, uint amount);
    // event MintConsensusSignature(address indexed account, address indexed admin, uint amount);
    event TMAXChanged(uint newTMAX);
    // event TMAXChangeSignature(uint newTMAX, address indexed signer);
    event TransferLimitChanged(address user, uint newValue);
    // event ChangeTransferLimitSignature(address user, uint newValue, address signer);

    constructor(string memory name, string memory symbol, uint _totalSupplyCap, uint _transferlimit) ERC20(name, symbol) {
        // set msg.sender as the first admin in all admin roles
        adminMint = new AdminMint(msg.sender);
        adminIDP = new AdminIDP(msg.sender);
        adminRestr = new AdminRestr(msg.sender);
        TOTAL_SUPPLY_CAP = _totalSupplyCap;
        TRANSFERLIMIT = _transferlimit;
    }

    modifier onlyMintAdmin {
        require(adminMint.isAdmin(msg.sender), "mintingAdmin role required!");
        _;
    }

    modifier onlyIDPAdmin {
        require(adminIDP.isAdmin(msg.sender), "IDP admin role required!");
        _;
    }

    modifier onlyRestrAdmin {
        require(adminRestr.isAdmin(msg.sender), "restrAdmin role required!");
        _;
    }

    function decimals() public override pure returns (uint8) {
        return 0;
    }

    function isVerified(address user) public view returns (bool) {
        return EnumerableMap.contains(verifiedUntil, user) && (EnumerableMap.get(verifiedUntil, user) > block.timestamp) && !isRevoked(user);
    }

    function isRevoked(address user) public view returns (bool) {
        return adminIDP.userIsRevoked(user);
    }

    function isVerifiedUntil(address user) public view returns (uint) {
        if (EnumerableMap.contains(verifiedUntil, user) && !adminIDP.userIsRevoked(user)) {
            return EnumerableMap.get(verifiedUntil, user);
        }
        return 0;
    }

    function getVerifiedUsers() public view returns (address[] memory){
        address[] memory verifiedAddrs = new address[](verifiedUsersAddrs.length);

        for (uint256 i = 0; i < verifiedUsersAddrs.length; i++) {
            if (isVerified(verifiedUsersAddrs[i])) {
                verifiedAddrs[i] = verifiedUsersAddrs[i];
            }
        }

        return verifiedAddrs;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(isVerified(msg.sender), 'Sender is not verified!');
        require(isVerified(to), 'Reciever is not verified!');

        updateTransferLimit(msg.sender, amount);

        _transfer(msg.sender, to, amount);
        return true;
    }

    function updateTransferLimit(address sender, uint256 amount) private {
        uint transactionDay =  block.timestamp / (24*3600);
        uint usersTransferLimit = TRANSFERLIMIT; // default
        if (EnumerableMap.contains(transferLimit, sender)) {
            usersTransferLimit = EnumerableMap.get(transferLimit, sender);
        }

        if (transactionDay > lastSentDay[sender]) {
            // its a new day and we need to reset sentToday for this user and register current transfer
            require(amount <= usersTransferLimit, 'Daily transfer limit reached!');
            sentToday[sender] = amount;
            lastSentDay[sender] = transactionDay;
        } else {
            // its not the first transfer today
            require((amount + sentToday[sender]) <= usersTransferLimit, 'Daily transfer limit reached!');
            sentToday[sender] += amount;
        }
    }

    function transferedToday(address user) public view returns (uint) {
        return sentToday[user];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        require(isVerified(msg.sender), 'Sender is not verified!');
        require(isVerified(spender), 'Spender is not verified!');

        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(isVerified(msg.sender), 'Spender is not verified!');
        require(isVerified(from), 'Sender is not verified!');
        require(isVerified(to), 'Reciever is not verified!');

        updateTransferLimit(from, amount);

        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address /* spender */, uint256 /* addedValue*/) public override pure returns (bool) {
        revert("Not part of ERC20!");
    }

    function decreaseAllowance(address /* spender */, uint256 /* subtractedValue */) public override pure returns (bool) {
        revert("Not part of ERC20!");
    }

    function mint(address[] memory accounts, uint256[] memory amounts) public onlyMintAdmin {
        require(accounts.length == amounts.length, 'Number of accounts and amounts is not the same!');

        uint amountSum = 0;
        for (uint i = 0; i < accounts.length; i++) {
            amountSum += amounts[i];
            require(isVerified(accounts[i]), 'Cannot mint to non verified account!');
        }

        require((totalSupply() + amountSum) <= TOTAL_SUPPLY_CAP, 'Token supply cap reached!');
        adminMint.checkMintLimit(msg.sender, amountSum);

        for (uint i = 0; i < accounts.length; i++) {
            _mint(accounts[i], amounts[i]);
            emit Mint(accounts[i], msg.sender, amounts[i]);
        }
    }

    // this minting doesnt count into TMAX, but require mint admin consensus
    // the order of accounts must be the same!
    function signMint(address[] memory accounts, uint256[] memory amounts) public onlyMintAdmin {
        require(accounts.length == amounts.length, 'Number of accounts and amounts is not the same!');

        uint amountSum = 0;
        for (uint i = 0; i < accounts.length; i++) {
            amountSum += amounts[i];
            require(isVerified(accounts[i]), 'Cannot mint to non verified account!');
        }

        require((totalSupply() + amountSum) <= TOTAL_SUPPLY_CAP, 'Token supply cap reached!');

        bytes32 signMintID = keccak256(abi.encodePacked(keccak256(abi.encode(accounts)), keccak256(abi.encode(amounts))));

        // we only sign
        // for (uint i = 0; i < accounts.length; i++) {
        //     emit MintConsensusSignature(accounts[i], msg.sender, amounts[i]);
        // }

        if (adminMint.signMint(signMintID, msg.sender)) {
            // we have enough signatures --> mint
            for (uint i = 0; i < accounts.length; i++) {
                _mint(accounts[i], amounts[i]);
                emit MintConsensus(accounts[i], amounts[i]);
            }
        }
    }

    function signTransferLimitChange(address user, uint256 newValue) public onlyRestrAdmin {
        require(isVerified(user), 'Transfer limit can be changed on for verified users!');

        bytes32 changeID = keccak256(abi.encodePacked(user, newValue));

        // emit ChangeTransferLimitSignature(user, newValue, msg.sender);

        if (adminRestr.signTransferLimitChange(changeID, msg.sender)) {
            // we have enough signatures --> change transfer limit
            EnumerableMap.set(transferLimit, user, newValue);

            emit TransferLimitChanged(user, newValue);
        }
    }

    function getTransferLimit(address user) public view returns (uint) {
        uint usersTransferLimit = TRANSFERLIMIT; // default
        if (EnumerableMap.contains(transferLimit, user)) {
            usersTransferLimit = EnumerableMap.get(transferLimit, user);
        }

        return usersTransferLimit;
    }

    function signTMAXChange(uint newTMAX) public onlyMintAdmin {
        // emit TMAXChangeSignature(newTMAX, msg.sender);

        if (adminMint.signTMAXChange(newTMAX, msg.sender)) {
            emit TMAXChanged(newTMAX);
        }
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

        // add address to array to easily enumerate verified users
        if (!EnumerableMap.contains(verifiedUntil, msg.sender)) {
            verifiedUsersAddrs.push(msg.sender);
        }

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

    function signAddingMintingAdmin(address addr) public onlyMintAdmin {
        // emit MintAdminAddSignature(addr, msg.sender);

        if (adminMint.signAddingAdmin(addr, msg.sender)) {
            emit MintAdminAdded(addr);
        }
    }

    function signAddingIDPAdmin(address addr) public onlyIDPAdmin {
        // emit IDPAdminAddSignature(addr, msg.sender);

        if (adminIDP.signAddingAdmin(addr, msg.sender)) {
            emit IDPAdminAdded(addr);
        }
    }

    function signAddingRestrAdmin(address addr) public onlyRestrAdmin {
        // emit RestrAdminAddSignature(addr, msg.sender);

        if (adminRestr.signAddingAdmin(addr, msg.sender)) {
            emit RestrAdminAdded(addr);
        }
    }

    function signRemovingMintingAdmin(address addr) public onlyMintAdmin {
        // emit MintAdminRemoveSignature(addr, msg.sender);

        if (adminMint.signRemovingAdmin(addr, msg.sender)) {
            emit MintAdminRemoved(addr);
        }
    }

    function signRemovingIDPAdmin(address addr) public onlyIDPAdmin {
        // emit IDPAdminRemoveSignature(addr, msg.sender);

        if (adminIDP.signRemovingAdmin(addr, msg.sender)) {
            emit IDPAdminRemoved(addr);
        }
    }

    function signRemovingRestrAdmin(address addr) public onlyRestrAdmin {
        // emit RestrAdminRemoveSignature(addr, msg.sender);

        if (adminRestr.signRemovingAdmin(addr, msg.sender)) {
            emit RestrAdminRemoved(addr);
        }
    }

    function getMintAdmins() public view returns (address[] memory) {
        return adminMint.getAdmins();
    }

    function getIDPAdmins() public view returns (address[] memory) {
        return adminIDP.getAdmins();
    }

    function getRestrAdmins() public view returns (address[] memory) {
        return adminRestr.getAdmins();
    }

    function isMintAdmin(address addr) public view returns (bool) {
        return adminMint.isAdmin(addr);
    }

    function isIDPAdmin(address addr) public view returns (bool) {
        return adminIDP.isAdmin(addr);
    }

    function isRestrAdmin(address addr) public view returns (bool) {
        return adminRestr.isAdmin(addr);
    }

    function isIDP(address addr) public view returns (bool) {
        return adminIDP.isIDP(addr);
    }

    function signAddingIDP(address addr) public onlyIDPAdmin {
        // emit IDPAddSignature(addr, msg.sender);

        if (adminIDP.signAddingIDP(addr, msg.sender)) {
            emit IDPAdded(addr);
        }
    }

    function signRemovingIDP(address addr) public onlyIDPAdmin {
        // emit IDPRemoveSignature(addr, msg.sender);

        if (adminIDP.signRemovingIDP(addr, msg.sender)) {
            emit IDPRemoved(addr);
        }
    }

    function signRevoke(address addr) public onlyIDPAdmin {
        require(EnumerableMap.contains(verifiedUntil, addr), "User is not verified!");

        // emit RevokeSignature(addr, msg.sender);

        if (adminIDP.signRevoke(addr, msg.sender)) {
            emit UserRevoked(addr);
        }
    }

    function signApprove(address addr) public onlyIDPAdmin {
        // emit ApproveSignature(addr, msg.sender);

        if (adminIDP.signApprove(addr, msg.sender)) {
            emit UserApproved(addr);
        }
    }

    function getIDPs() public view returns(address[] memory){
        return adminIDP.getIDPs();
    }

    function mintedToday(address addr) public view returns(uint) {
        return adminMint.mintToday(addr);
    }

    function getTMAX() public view returns(uint) {
        return adminMint.TMAX();
    }
}