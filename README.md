# Secure Storage DApp

A decentralized application for secure data sharing using blockchain and encryption.

## Features

- Encrypt and share data securely
- Store encrypted data on Ethereum blockchain
- Audit transaction history
- Web3 integration
- RSA encryption implementation

## Technology Stack

- Solidity ^0.8.17
- Web3.js
- Hardhat
- Node.js
- HTML/CSS/JavaScript
- RSA Encryption (Web Crypto API)

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd SecureStorage
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Compile the smart contracts:
    ```bash
    npx hardhat compile
    ```
4. Deploy the smart contracts:
    ```bash
    npx hardhat run interactive/deploy.js --network <network-name>
    ```
5. Always rember to update the contact address in index.js
6. Remember to setup IPFS(Go-based) web database in order to use the share file function
   Learn more: https://docs.ipfs.tech/install/command-line/#determining-which-node-to-use-with-the-command-line

8. Start the development server:
    ```bash
    python -m http.server
    ```

## Usage

1. Open the application in your browser.
2. Connect your Ethereum wallet.(will be available in the future)(only be able to be done in intranet)
3. Use the interface to encrypt and share data securely.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License.
