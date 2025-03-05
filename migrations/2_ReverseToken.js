const ReverseToken = artifacts.require("Reverse");

module.exports = async function(deployer, network, accounts) {
    try {
        // Parameters required by Reverse constructor:
        // name, symbol, initialSupply, tokenDecimals
        const name = "Reverse";
        const symbol = "REV";
        const initialSupply = 200000000; // 1 million tokens 70000000
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
        // Get the total supply of tokens
        const totalSupply = await instance.totalSupply();
        console.log("Total supply:", totalSupply.toString());

        // Transfer all tokens to accounts[1]
        const recipient = accounts[1];
        console.log("Transferring all tokens to:", recipient);

        // Execute the transfer
        await instance.transfer(recipient,  web3.utils.toWei('20000000', 'ether'));
        console.log("Successfully transferred all tokens to:", recipient);

        // Verify the transfer
        const recipientBalance = await instance.balanceOf(recipient);
        console.log("Recipient balance after transfer:", recipientBalance.toString());
        const deployerBalance = await instance.balanceOf(accounts[0]);
        console.log("Deployer balance after transfer:", deployerBalance.toString());
        
    } catch (error) {
        console.error("Deployment failed:", error);
        throw error;
    }
};