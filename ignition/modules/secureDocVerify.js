const web3 = new Web3(window.ethereum || "http://localhost:8545");
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Document verification functions
async function hashDocument(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function signDocument(hash, privateKey) {
    try {
        const signature = await web3.eth.accounts.sign(hash, privateKey);
        return signature.signature;
    } catch (error) {
        console.error("Error signing document:", error);
        throw error;
    }
}

async function verifyDocument(file, signature, address) {
    try {
        const hash = await hashDocument(file);
        const recoveredAddress = web3.eth.accounts.recover(hash, signature);
        return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
        console.error("Error verifying document:", error);
        return false;
    }
}

async function storeDocumentHash(hash, signature) {
    try {
        await contract.methods.storeDocument(hash, signature)
            .send({ from: currentAccount });
        return true;
    } catch (error) {
        console.error("Error storing document:", error);
        return false;
    }
}

async function verifyStoredDocument(hash) {
    try {
        const result = await contract.methods.verifyDocument(hash).call();
        return {
            isVerified: result.isVerified,
            timestamp: new Date(result.timestamp * 1000),
            signer: result.signer
        };
    } catch (error) {
        console.error("Error verifying stored document:", error);
        return null;
    }
}

// UI Event Handlers
document.getElementById('documentInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const hash = await hashDocument(file);
        document.getElementById('documentHash').value = hash;
    }
});

document.getElementById('verifyButton').addEventListener('click', async () => {
    const file = document.getElementById('documentInput').files[0];
    const signature = document.getElementById('signatureInput').value;
    const address = document.getElementById('signerAddress').value;
    
    if (file && signature && address) {
        const isValid = await verifyDocument(file, signature, address);
        document.getElementById('verificationResult').textContent = 
            isValid ? "Document Verified ✓" : "Verification Failed ✗";
    }
});

// Status tracking
async function getDocumentStatus(hash) {
    try {
        const status = await contract.methods.getDocumentStatus(hash).call();
        return {
            isVerified: status.isVerified,
            verificationCount: status.verificationCount,
            lastVerified: new Date(status.lastVerified * 1000)
        };
    } catch (error) {
        console.error("Error getting document status:", error);
        return null;
    }
}

// Update existing functions
async function checkContract() {
    try {
        const code = await web3.eth.getCode(contractAddress);
        if (code === '0x' || code === '0x0') {
            alert("Contract not deployed at specified address");
        } else {
            console.log("Contract deployed correctly");
            await loadVerifications();
        }
    } catch (error) {
        console.error("Error checking contract:", error);
        alert("Failed to check contract deployment");
    }
}

async function loadVerifications() {
    try {
        const events = await contract.getPastEvents('DocumentVerified', {
            fromBlock: 0,
            toBlock: 'latest'
        });
        
        const verificationsList = document.getElementById('verificationsList');
        verificationsList.innerHTML = '';
        
        events.forEach((event, index) => {
            const verification = document.createElement('div');
            verification.className = 'verification';
            verification.innerHTML = `
                <div class="verification-header">
                    <span>Verification ${index + 1}</span>
                    <span class="timestamp">${new Date(event.returnValues.timestamp * 1000).toLocaleString()}</span>
                </div>
                <div class="verification-details">
                    <p>Document Hash: ${event.returnValues.documentHash}</p>
                    <p>Verified By: ${event.returnValues.verifier}</p>
                    <p>Status: ${event.returnValues.status}</p>
                </div>
            `;
            verificationsList.appendChild(verification);
        });
    } catch (error) {
        console.error("Error loading verifications:", error);
    }
}

// Initialize
window.onload = checkContract;