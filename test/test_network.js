async function testNetwork() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", (await deployer.getBalance()).toString());
}

testNetwork()
    .catch(console.error);
