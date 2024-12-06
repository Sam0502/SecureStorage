async function auditTransactions(contract) {
    const transactions = await contract.getTransactions();

    transactions.forEach((tx) => {
        console.log(`Sender: ${tx.sender}`);
        console.log(`Receiver: ${tx.receiver}`);
        console.log(`Timestamp: ${new Date(tx.timestamp * 1000).toLocaleString()}`);
        console.log(`Encrypted Data: ${tx.encryptedData}`);
        console.log("-----------------------------");
    });
}
