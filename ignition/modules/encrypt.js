const crypto = require("crypto");
const Web3 = require("web3");

// Generate key pairs (for demonstration)
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
});

// Encrypt data
function encryptData(data, publicKey) {
    return crypto.publicEncrypt(publicKey, Buffer.from(data)).toString("base64");
}

// Decrypt data
function decryptData(encryptedData, privateKey) {
    return crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, "base64")).toString();
}

// Example usage
const data = "This is a secret message.";
const encryptedData = encryptData(data, publicKey);
console.log("Encrypted:", encryptedData);

// Web3 setup
const web3 = new Web3("http://localhost:8545"); // Replace with your Ethereum node URL
const contractAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // Replace with your contract address
const contractABI = [ /* ABI from your compiled contract */ ];
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to share encrypted data
async function shareEncryptedData(receiver, encryptedData) {
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    await contract.methods.shareData(receiver, encryptedData).send({ from: sender });
    console.log("Data shared successfully.");
}

// Function to audit transactions
async function auditTransactions() {
    const transactions = await contract.methods.getTransactions().call();

    transactions.forEach((tx) => {
        console.log(`Sender: ${tx.sender}`);
        console.log(`Receiver: ${tx.receiver}`);
        console.log(`Timestamp: ${new Date(tx.timestamp * 1000).toLocaleString()}`);
        console.log(`Encrypted Data: ${tx.encryptedData}`);
        console.log("-----------------------------");
    });
}

// Example usage of sharing and auditing
(async () => {
    const receiver = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0s"; // Replace with the receiver's address
    await shareEncryptedData(receiver, encryptedData);
    await auditTransactions();
})();