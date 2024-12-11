// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract DataSharing {
    struct Transaction {
        address sender;
        address receiver;
        string encryptedData;
        uint256 timestamp;
    }

    Transaction[] public transactions;
    mapping(address => string) public publicKeys;

    event DataShared(address indexed sender, address indexed receiver, uint256 timestamp);
    event PublicKeyRegistered(address indexed user);

    function shareData(address receiver, string memory encryptedData) public {
        transactions.push(Transaction(msg.sender, receiver, encryptedData, block.timestamp));
        emit DataShared(msg.sender, receiver, block.timestamp);
    }

    function registerPublicKey(string memory publicKey) public {
    require(bytes(publicKey).length > 0, "Invalid public key");
    publicKeys[msg.sender] = publicKey;
    emit PublicKeyRegistered(msg.sender);
    }

    function storePublicKey(string memory publicKey) public {
        publicKeys[msg.sender] = publicKey;
        emit PublicKeyRegistered(msg.sender);
    }


    function getPublicKey(address user) public view returns (string memory) {
        return publicKeys[user];
    }

    function getTransactions() public view returns (Transaction[] memory){
        return transactions;
    }
}
