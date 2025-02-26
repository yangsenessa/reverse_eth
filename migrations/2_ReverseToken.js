const ReverseToken = artifacts.require("Reverse");

module.exports = async function(deployer, network, accounts) {
    try {
        await deployer.deploy(ReverseToken, { gas: 5000000 });
        const instance = await ReverseToken.deployed();
        console.log("Contract deployed at:", instance.address);
    } catch (error) {
        console.error("Deployment failed:", error);
        throw error;
    }
};