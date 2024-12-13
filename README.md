# Secure Storage DApp

A decentralized application for secure file and data sharing using blockchain technology and advanced encryption.

## Features

- **File Sharing:** Securely share files using RSA and AES encryption.
- **Blockchain Storage:** Store encrypted data and file references on the Ethereum blockchain.
- **Transaction Auditing:** View transaction history for data sharing.
- **Web3 Integration:** Interact with Ethereum smart contracts seamlessly.
- **Advanced Encryption:** Utilize RSA for key exchange and AES-GCM for file encryption.

## Technology Stack

- **Blockchain:** Ethereum, Solidity ^0.8.17
- **Frontend:** HTML, CSS, JavaScript
- **Smart Contract Interaction:** Web3.js
- **Development Tools:** Hardhat, Node.js
- **Encryption:** RSA (Web Crypto API) and AES-GCM
- **File Storage:** IPFS (Go-based implementation)

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Hardhat](https://hardhat.org/)
- [IPFS](https://docs.ipfs.tech/install/command-line/#determining-which-node-to-use-with-the-command-line)

### Steps

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd SecureStorage
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Compile the smart contracts:**
    ```bash
    npx hardhat compile
    ```

4. **Deploy the smart contracts:**
    ```bash
    npx hardhat run interactive/deploy.js --network <network-name>
    ```

    > **Note:** Update the deployed contract address in `index.js` after deployment.

5. **Set up IPFS:**
    Install and configure IPFS for file storage. Refer to the [IPFS documentation](https://docs.ipfs.tech/) for installation and setup instructions.

6. **Start the development server:**
    ```bash
    python -m http.server
    ```

## Usage

1. **Open the application:**
   Open the application in your browser at `http://localhost:8000` (or the specified port).

2. **Login and Account Selection:**
   - Select an Ethereum account to log in.
   - Ensure the Ethereum wallet is configured for the desired network.

3. **File Sharing:**
   - Choose a file and enter the recipient's Ethereum address.
   - The file is encrypted and shared securely via the blockchain.

4. **Audit Transactions:**
   - View all data sharing transactions stored on the blockchain.

5. **File Retrieval:**
   - Fetch and decrypt shared files using your private key.

## Key Notes

- **Network Compatibility:** Currently supports intranet deployment; public wallet integration is planned for future versions.
- **IPFS Integration:** Ensure the IPFS daemon is running for file sharing features.

## Contribution Guidelines

1. **Fork the repository:**
   ```bash
   git fork <repository-url>
   ```

2. **Create a new branch:**
   ```bash
   git checkout -b feature/<feature-name>
   ```

3. **Commit changes:**
   ```bash
   git commit -am "Add new feature: <feature-name>"
   ```

4. **Push and submit PR:**
   ```bash
   git push origin feature/<feature-name>
   ```
   Submit a Pull Request for review.

## Learn More

- **Web3.js Documentation:** [https://web3js.readthedocs.io/](https://web3js.readthedocs.io/)
- **Hardhat Documentation:** [https://hardhat.org/docs](https://hardhat.org/docs)
- **IPFS Documentation:** [https://docs.ipfs.tech/](https://docs.ipfs.tech/)
- **RSA Encryption:** [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

