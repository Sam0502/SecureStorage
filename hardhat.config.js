require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Default Hardhat Network URL
      chainId: 31337,              // Hardhat Network chain ID
    },
  },
  defaultNetwork: "localhost",      // Ensures you're targeting localhost by default
};
