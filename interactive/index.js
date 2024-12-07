    const web3 = new Web3("http://localhost:8545"); // Replace with your Ethereum node URL
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "encryptedData",
                    "type": "string"
                }
            ],
            "name": "shareData",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getTransactions",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "receiver",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "encryptedData",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct DataSharing.Transaction[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    async function generateKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );
        return keyPair;
    }

    async function encryptData(data, publicKey) {
        const encodedData = new TextEncoder().encode(data);
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            encodedData
        );
        return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
    }

    async function encryptAndShareData() {
        const data = document.getElementById('data').value;
        const receiver = document.getElementById('receiver').value;
    
        if (!data || !receiver) {
            alert('Please enter both data and receiver address.');
            return;
        }
    
        if (!activeAccount) {
            alert('Please log in first.');
            return;
        }
    
        // Generate key pairs (for demonstration)
        const { publicKey, privateKey } = await generateKeyPair();
    
        // Encrypt data
        const encryptedData = await encryptData(data, publicKey);
        console.log("Encrypted:", encryptedData);
    
        // Share encrypted data
        try {
            await contract.methods.shareData(receiver, encryptedData).send({ from: activeAccount });
            alert('Data shared successfully.');
        } catch (error) {
            console.error("Error sharing data:", error);
            alert('Failed to share data.');
        }
    }
    

            // Update auditTransactions function to include proper event handling
    async function auditTransactions() {
        try {
            const transactions = await contract.methods.getTransactions().call();
            const resultsContainer = document.getElementById('audit-results');
            resultsContainer.innerHTML = '';
    
            if (transactions.length === 0) {
                resultsContainer.innerHTML = "<p>No transactions found.</p>";
                return;
            }
    
            transactions.forEach((tx, index) => {
                const timestamp = Number(tx.timestamp);
                const date = new Date(timestamp * 1000).toLocaleString();
    
                const transactionElement = document.createElement('div');
                transactionElement.className = 'transaction';
    
                transactionElement.innerHTML = `
                    <div class="transaction-header">
                        <span>Transaction ${index + 1} - ${date}</span>
                        <span class="toggle-icon">▼</span>
                    </div>
                    <div class="transaction-content">
                        <div>Sender: ${tx.sender}</div>
                        <div>Receiver: ${tx.receiver}</div>
                        <div>Timestamp: ${date}</div>
                        <div>Encrypted Data: ${tx.encryptedData}</div>
                    </div>
                `;
    
                const header = transactionElement.querySelector('.transaction-header');
                header.addEventListener('click', () => {
                    transactionElement.classList.toggle('active');
                });
    
                resultsContainer.appendChild(transactionElement);
            });
        } catch (error) {
            console.error("Error auditing transactions:", error);
            alert('Failed to audit transactions. See console for details.');
        }
    }
            

    // Debugging: Check if the contract is deployed correctly
    async function checkContract() {
        try {
            const code = await web3.eth.getCode(contractAddress);
            console.log("Contract code:", code);
            if (code === "0x") {
                console.error("The contract is not deployed at the given address.");
                alert("The contract is not deployed at the given address.");
            } else {
                console.log("The contract is deployed correctly.");
            }
        } catch (error) {
            console.error("Error checking contract:", error);
            alert("Failed to check contract deployment.");
        }
    }
    // Fix the toggleTransaction function
    function toggleTransaction(index) {
        const transactions = document.querySelectorAll('.transaction');
        if (transactions[index]) {
            transactions[index].classList.toggle('active');
        }
    }

    async function fetchAccount() {
        const accounts = await web3.eth.getAccounts();
        const accountDropdown = document.getElementById('account');

        accounts.forEach((account) =>{
            const option = document.createElement('option');
            option.value = account;
            option.textContent = account;
            accountDropdown.appendChild(option);
        })
    }
    
    let activeAccount;

    async function login() {
        const accountDropdown = document.getElementById("account");
        activeAccount = accountDropdown.value;

        if (!activeAccount) {
            alert("Please select an account to log in.");
            return;
        }

        console.log(`Logged in as: ${activeAccount}`);
        alert(`Logged in as: ${activeAccount}`);
    }
    async function sendTransaction(method) {
        try {
            const tx = await method.send({ from: activeAccount });
            alert("Transaction sent successfully!");
            console.log("Transaction Hash:", tx.transactionHash);
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("Transaction failed. See console for details.");
        }
    }

    

    // Expose functions globally
    // window.login = login;
    // window.encryptAndShareData = encryptAndShareData;
    // window.auditTransactions = auditTransactions;


    // Call the checkContract function on page load
    window.onload = async () => {
        await checkContract();
        await fetchAccount();
    }
