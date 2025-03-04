const ReverseToken = artifacts.require("Reverse");

module.exports = async function(deployer, network, accounts) {
    try {
        // Parameters required by Reverse constructor:
        // name, symbol, initialSupply, tokenDecimals
        const name = "Reverse";
        const symbol = "REV";
        const initialSupply = 200000000; // 1 million tokens
        const tokenDecimals = 18;

        await deployer.deploy(
            ReverseToken, 
            name, 
            symbol, 
            initialSupply,
            tokenDecimals,
            { gas: 5000000 }
        );
        
        const instance = await ReverseToken.deployed();
        console.log("Contract deployed at:", instance.address);
    } catch (error) {
        console.error("Deployment failed:", error);
        throw error;
    }
};