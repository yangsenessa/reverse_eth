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
            { gas: 30000000 }
        );

        let finAccounts = [
            "0x87d0F3a1b84C4C3754890721F792863347AEa5B2", //60 milion
            "0x3d7ad67A68916Ac338b84eE725df5555d307B87E", //40 milion
            "0x523a95cea54E47D1ab25F69eA07b84481723d3A5", //25 milion
            "0x2c8619c61b8A5c695C6F0510e9acf82CF0Ef030b", //5 milion
        ];
        
        const instance = await ReverseToken.deployed();
        console.log("Contract deployed at:", instance.address);
        // Get the total supply of tokens
        const totalSupply = await instance.totalSupply();
        console.log("Total supply:", totalSupply.toString());

        // Transfer all tokens to accounts[1]
        const recipient1 = finAccounts[0];
        const recipient2 = finAccounts[1];
        const recipient3 = finAccounts[2];
        const recipient4 = finAccounts[3];
        console.log("Transferring all tokens to:", recipient1);
        console.log("Transferring all tokens to:", recipient2);
        console.log("Transferring all tokens to:", recipient3);
        console.log("Transferring all tokens to:", recipient4);

        // Execute the transfer 1
        await instance.transfer(recipient1,  web3.utils.toWei('60000000', 'ether'));
        console.log("Successfully transferred all tokens to:", recipient1);

        // Verify the transfer
        const recipientBalance = await instance.balanceOf(recipient1);
        console.log("Recipient balance after transfer:", recipientBalance.toString());
        const deployerBalance = await instance.balanceOf(accounts[0]);
        console.log("Deployer balance after transfer:", deployerBalance.toString());

        // Execute the transfer 2
        await instance.transfer(recipient2,  web3.utils.toWei('40000000', 'ether'));
        console.log("Successfully transferred all tokens to:", recipient2); 
        
        // Verify the transfer
        const recipientBalance2 = await instance.balanceOf(recipient2);
        console.log("Recipient balance after transfer:", recipientBalance2.toString());
        const deployerBalance2 = await instance.balanceOf(accounts[0]);
        console.log("Deployer balance after transfer:", deployerBalance2.toString());

        // Execute the transfer 3
        await instance.transfer(recipient3,  web3.utils.toWei('25000000', 'ether'));
        console.log("Successfully transferred all tokens to:", recipient3);

        // Verify the transfer
        const recipientBalance3 = await instance.balanceOf(recipient3);
        console.log("Recipient balance after transfer:", recipientBalance3.toString());
        const deployerBalance3 = await instance.balanceOf(accounts[0]);
        console.log("Deployer balance after transfer:", deployerBalance3.toString());

        // Execute the transfer 4
        await instance.transfer(recipient4,  web3.utils.toWei('5000000', 'ether'));
        console.log("Successfully transferred all tokens to:", recipient4);

        // Verify the transfer
        const recipientBalance4 = await instance.balanceOf(recipient4);
        console.log("Recipient balance after transfer:", recipientBalance4.toString());
        const deployerBalance4 = await instance.balanceOf(accounts[0]);
        console.log("Deployer balance after transfer:", deployerBalance4.toString());
        
    } catch (error) {
        console.error("Deployment failed:", error);
        throw error;
    }
};