    let activeAccount;
    let privateKey;

    const web3 = new Web3("http://localhost:8545"); // Replace with your Ethereum node URL
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
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
    function toggleTransaction(index) {
        const transaction = document.querySelector(`.transaction[data-index="${index}"]`);
        if (!transaction) return;
    
        const content = transaction.querySelector('.transaction-content');
        const icon = transaction.querySelector('.toggle-icon');
        
        // Close all other open transactions
        document.querySelectorAll('.transaction').forEach(tx => {
            if (tx !== transaction && tx.classList.contains('active')) {
                tx.classList.remove('active');
                tx.querySelector('.transaction-content').style.maxHeight = '0px';
                tx.querySelector('.toggle-icon').textContent = '▼';
            }
        });
    
        // Toggle current transaction
        transaction.classList.toggle('active');
        if (transaction.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + 'px';
            icon.textContent = '▲';
        } else {
            content.style.maxHeight = '0px';
            icon.textContent = '▼';
        }
    }
    
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
                transactionElement.setAttribute('data-index', index);
    
                transactionElement.innerHTML = `
                    <div class="transaction-header">
                        <span>Transaction ${index + 1} - ${date}</span>
                        <span class="toggle-icon">▼</span>
                    </div>
                    <div class="transaction-content">
                        <div>Sender: ${tx.sender}</div>
                        <div>Receiver: ${tx.receiver}</div>
                        <div>Timestamp: ${date}</div>
                    </div>
                `;
    
                transactionElement.querySelector('.transaction-header').addEventListener('click', () => {
                    toggleTransaction(index);
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

            const transactions = await contract.methods.getTransactions().call();
            const myMessages = transactions.filter(
                (tx) => tx.receiver.toLowerCase() === activeAccount.toLowerCase()
            );
    
            if (myMessages.length === 0) {
                alert("No messages found for your account.");
                return;
            }
                
            for (const tx of myMessages) {
                if (!tx.encryptedData.startsWith("Qm") && !tx.encryptedData.startsWith("bafy")) {
                    const decryptedData = await decryptMessage(tx.encryptedData);
                    console.log("Decrypted Message:", decryptedData);

                    // Display the message
                    const resultsContainer = document.getElementById("decrypted-data");
                    resultsContainer.innerHTML += `<p>Decrypted Message: ${decryptedData}</p>
                                                    <p>Sender: ${tx.sender}</p>`;
                } else {
                    console.log("Skipping CID:", tx.encryptedData);
                    continue;
                }
            }
        } catch (error) {
            console.error("Error viewing messages:", error);
            alert("Failed to view messages. See console for details.");
        }
    }

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

    async function encryptAndUploadFile(file, publicKey) {

        try {
            const aesKey = await window.crypto.subtle.generateKey(
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );
    
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const fileData = await file.arrayBuffer();
    
            const encryptedFile = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                aesKey,
                fileData
            );
    
            const exportedKey = await window.crypto.subtle.exportKey("raw", aesKey);
            const encryptedKey = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                publicKey,
                exportedKey
            );
    
            const metadata = {
                fileName: file.name,
                type: file.type,
                iv: Array.from(iv),
                encryptedKey: Array.from(new Uint8Array(encryptedKey))
            };
    
            const metadataBlob = new Blob([JSON.stringify(metadata)]);
            const encryptedFileBlob = new Blob([new Uint8Array(encryptedFile)]);
            const finalBlob = new Blob([metadataBlob, encryptedFileBlob]);
    
            console.log("Metadata Size:", metadataBlob.size);
            console.log("Encrypted File Size:", encryptedFileBlob.size);
            console.log("Final Blob Size:", finalBlob.size);
    
            const formData = new FormData();
            formData.append("file", finalBlob);
    
            const response = await fetch("http://localhost:5001/api/v0/add", {
                method: "POST",
                body: formData
            });
    
            const data = await response.json();
            console.log("IPFS Data:", data.Hash);
            return data.Hash;
        } catch (error) {
            console.error("Encryption error:", error);
            throw error;
        }
    }
    
    
    async function downloadAndDecryptFile(cid) {
        try {
            console.log ("CID:", cid);
            const response = await fetch(`http://localhost:5001/api/v0/cat?arg=${cid}`, { method: "POST" });
            if (!response.ok) throw new Error("Failed to fetch file from IPFS");
    
            const encryptedData = await response.arrayBuffer();
            const dataView = new Uint8Array(encryptedData);
    
            console.log("Total Data Size (from IPFS):", dataView.length);
            console.log("DataView Slice (0 to 100):", dataView.slice(0, 100));
    
            let metadataEndIndex = -1;
            for (let i = 0; i < dataView.length; i++) {
                if (dataView[i] === 125) { // '}'
                    try {
                        const testMetadata = new TextDecoder().decode(dataView.slice(0, i + 1));
                        JSON.parse(testMetadata);
                        metadataEndIndex = i + 1;
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            }
    
            if (metadataEndIndex === -1) throw new Error("Invalid file format: Metadata not found.");
    
            const metadataText = new TextDecoder().decode(dataView.slice(0, metadataEndIndex));
            const metadata = JSON.parse(metadataText);
            console.log("Parsed Metadata:", metadata);
    
            const encryptedContent = dataView.slice(metadataEndIndex);
            console.log("Encrypted Content Size:", encryptedContent.length);
    
            if (encryptedContent.length === 0) throw new Error("Encrypted content is too small.");
    
            // Decrypt AES key
            const privateKeyBase64 = localStorage.getItem(`privateKey_${activeAccount}`);
            const privateKeyBuffer = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
            const privateKey = await window.crypto.subtle.importKey(
                "pkcs8",
                privateKeyBuffer.buffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["decrypt"]
            );
    
            const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                privateKey,
                new Uint8Array(metadata.encryptedKey).buffer
            );
    
            const aesKey = await window.crypto.subtle.importKey(
                "raw",
                decryptedKeyBuffer,
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );
    
            const decryptedContent = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: new Uint8Array(metadata.iv) },
                aesKey,
                encryptedContent
            );
    
            const blob = new Blob([decryptedContent], { type: metadata.type || "application/octet-stream" });
            const url = URL.createObjectURL(blob);
    
            const a = document.createElement("a");
            a.href = url;
            a.download = metadata.fileName || "downloaded_file";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download and decrypt error:", error);
            throw error;
        }
    }
    
    async function shareFile() {
        const fileInput = document.getElementById("file");
        const receiver = document.getElementById("receiver").value;
    
        if (!fileInput || !fileInput.files.length) {
            alert("Please select a file.");
            return;
        }
    
        if (!receiver) {
            alert("Please enter the receiver's address.");
            return;
        }
    
        try {
            const file = fileInput.files[0];
            const publicKeyBase64 = await contract.methods.getPublicKey(receiver).call();
            const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0));
            const publicKey = await window.crypto.subtle.importKey(
                "spki",
                publicKeyBuffer.buffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["encrypt"]
            );
    
            const cid = await encryptAndUploadFile(file, publicKey);
            await contract.methods.shareData(receiver, cid).send({ from: activeAccount });
            alert("File shared successfully.");
        } catch (error) {
            console.error("Error sharing file:", error);
            alert(`Failed to share file: ${error.message}`);
        }
    }
    

    async function receiveFile() {
        try {
            // Fetch all transactions
            const transactions = await contract.methods.getTransactions().call();
            console.log("All Transactions:", transactions);
    
            // Filter transactions where the receiver is the active account
            const myTransactions = transactions.filter(
                (tx) => tx.receiver.toLowerCase() === activeAccount.toLowerCase()
            );
    
            if (myTransactions.length === 0) {
                alert("No files shared with your account.");
                return;
            }
    
            // Process each transaction (example: download the first file)
            for (const tx of myTransactions) {
                console.log("Processing Transaction:", tx);
    
                const cid = tx.encryptedData; // CID from the transaction
                console.log("Encrypted CID:", cid);
    
                // Decrypt and download the file
                await downloadAndDecryptFile(cid, privateKey);
            }
        } catch (error) {
            console.error("Error receiving file:", error);
            alert("Failed to receive file. See console for details.");
        }
    }

    
    function getMimeType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const mimeTypes = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain'
        };
        return mimeTypes[extension] || 'application/octet-stream';
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
