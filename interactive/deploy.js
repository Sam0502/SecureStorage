async function main() {
    try {
        // Get the deployer's signer account
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with the account:", deployer.address);

        // Get the contract factory
        const DataSharing = await ethers.getContractFactory("DataSharing");
        
        // Deploy the contract and wait for deployment
        console.log("Deploying DataSharing contract...");
        const dataSharing = await DataSharing.deploy();
        await dataSharing.waitForDeployment();
        
        const address = await dataSharing.getAddress();
        console.log("DataSharing contract deployed to:", address);
        
        // Verify the contract has code
        const code = await ethers.provider.getCode(address);
        if (code === "0x") {
            throw new Error("Contract deployment failed - no code at address");
        }
        
        return address;
    } catch (error) {
        console.error("Deployment failed:", error);
        throw error;
    }
}

main()
    .then((address) => {
        console.log("Deployment successful!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });