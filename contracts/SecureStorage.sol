// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract DataSharing {
    struct Transaction {
        address sender;
        address receiver;
        string encryptedData; // Encrypted message
        uint256 timestamp;
    }

    Transaction[] public transactions;

    event DataShared(address indexed sender, address indexed receiver, uint256 timestamp);

    function shareData(address receiver, string memory encryptedData) public {
        transactions.push(Transaction(msg.sender, receiver, encryptedData, block.timestamp));
        emit DataShared(msg.sender, receiver, block.timestamp);
    }

    function getTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }
}
