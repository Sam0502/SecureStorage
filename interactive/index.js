
    const web3 = new Web3("http://localhost:8545"); // Replace with your Ethereum node URL
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with your deployed contract address
    const contractABI = [ 
        {
            "inputs": [],
            "name": "getTransactions",
            "outputs": [
                {
                    "components": [
                        { "internalType": "address", "name": "sender", "type": "address" },
                        { "internalType": "address", "name": "receiver", "type": "address" },
                        { "internalType": "string", "name": "encryptedData", "type": "string" },
                        { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
                    ],
                    "internalType": "struct DataSharing.Transaction[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
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
            "inputs": [{"name": "publicKey","type": "string"}],
            "name": "storePublicKey",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"name": "user","type": "address"}],
            "name": "getPublicKey",
            "outputs": [{"name": "","type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"name":"recipient","type":"address"},
                {"name":"encryptedData","type":"string"}],
            
            "name": "shareData",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"


        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "publicKey",
                    "type": "string"
                }
            ],
            "name": "registerPublicKey",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                }
            ],
            "name": "getPublicKey",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
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
    
        const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    
        return { publicKey, privateKey };
    }

    async function encryptData(data, publicKey) {
        try {
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(data);
            const encryptedData = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP"
                },
                publicKey,
                encodedData
            );
            return btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedData)));
        } catch (error) {
            console.error("Encryption error:", error);
            throw error;
        }
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
    
        try {
            const publicKeyBase64 = await contract.methods.getPublicKey(receiver).call();
            if (!publicKeyBase64) {
                console.log("The receiver has not registered a public key.");
                alert("The receiver has not registered a public key.");
                return;
            }
    
            console.log("Public Key Base64:", publicKeyBase64);
    
            const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0));
            const publicKey = await window.crypto.subtle.importKey(
                "spki",
                publicKeyBuffer.buffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["encrypt"]
            );
    
            const encryptedData = await encryptData(data, publicKey);
            console.log("Encrypted Data:", encryptedData);
    
            await contract.methods.shareData(receiver, encryptedData).send({ from: activeAccount });
            alert("Data shared successfully.");
        } catch (error) {
            console.error("Error encrypting or sharing data:", error);
            alert("Failed to encrypt or share data.");
        }
    }    

    async function storePublicKey(publicKey) {
        try {
            const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
            await contract.methods.storePublicKey(publicKeyBase64).send({ from: activeAccount });
            alert('Public key stored successfully.');
        }catch(error){
            console.error("Error storing public key:", error);
            alert('Failed to store public key.');   
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

    async function decryptMessage(encryptedData) {
        try {
            if (!activeAccount) {
                alert("Please log in first.");
                return;
            }
    
            // Retrieve the private key from localStorage
            if (!(privateKey instanceof CryptoKey)) {
                const privateKeyBuffer = Uint8Array.from(
                    atob(localStorage.getItem(`privateKey_${activeAccount}`)),
                    (c) => c.charCodeAt(0)
                );
                privateKey = await window.crypto.subtle.importKey(
                    "pkcs8",
                    privateKeyBuffer.buffer,
                    { name: "RSA-OAEP", hash: "SHA-256" },
                    true,
                    ["decrypt"]
                );
            }
    
            // Decode the encrypted data
            const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
            const decryptedData = await window.crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                privateKey,
                encryptedBytes
            );
    
            return new TextDecoder().decode(decryptedData);
        } catch (error) {
            console.error("Error decrypting message:", error);
            alert("Failed to decrypt message.");
        }
    }
    
        

        function isValidBase64(str) {
            try {
                atob(str);
                return true;
            } catch (error) {
                return false;
            }
        }
        
        async function viewMessage() {
            try {
                if (!activeAccount) {
                    alert("Please log in first.");
                    return;
                }
        
                // Retrieve transactions
                const transactions = await contract.methods.getTransactions().call();
                const myMessages = transactions.filter(
                    (tx) => tx.receiver.toLowerCase() === activeAccount.toLowerCase()
                );
        
                if (myMessages.length === 0) {
                    alert("No messages found for your account.");
                    return;
                }
        
                for (const tx of myMessages) {
                    const decryptedData = await decryptMessage(tx.encryptedData);
                    console.log("Decrypted Message:", decryptedData);
        
                    // Display the message
                    const resultsContainer = document.getElementById("decrypted-data");
                    resultsContainer.innerHTML += `<p>Decrypted Message: ${decryptedData}</p>`;
                }
            } catch (error) {
                console.error("Error viewing messages:", error);
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
    let privateKey;

    async function login() {
        const accountDropdown = document.getElementById("account");
        activeAccount = accountDropdown.value;
    
        if (!activeAccount) {
            alert("Please select an account to log in.");
            return;
        }
    
        const storedPublicKey = await contract.methods.getPublicKey(activeAccount).call();
        if (storedPublicKey === "") {
            const keyPair = await generateKeyPair();
            privateKey = keyPair.privateKey;
    
            // Store private key locally
            localStorage.setItem(
                `privateKey_${activeAccount}`,
                btoa(String.fromCharCode(...new Uint8Array(keyPair.privateKey)))
            );
    
            // Register public key on-chain
            await storePublicKey(keyPair.publicKey);
            console.log("Public key registered on-chain.");
        } else {
            console.log("Public key already registered.");
            // Retrieve private key from localStorage
            const privateKeyBuffer = Uint8Array.from(
                atob(localStorage.getItem(`privateKey_${activeAccount}`)),
                (c) => c.charCodeAt(0)
            );
            privateKey = await window.crypto.subtle.importKey(
                "pkcs8",
                privateKeyBuffer.buffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["decrypt"]
            );
        }
    
        console.log(`Logged in as: ${activeAccount}`);
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
    window.decryptMessage = decryptMessage; 


    // Call the checkContract function on page load
    window.onload = async () => {
        await checkContract();
        await fetchAccount();
    }
