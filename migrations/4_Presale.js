const Reverse = artifacts.require("Reverse");
const ReverseInnerSeller = artifacts.require("ReverseInnerSeller");

module.exports = async function(deployer, network, accounts) {
    try {
        // 1. Get the deployed Reverse token instance
        const reverseInstance = await Reverse.deployed();
        console.log("Found Reverse token at:", reverseInstance.address);
        
        // 2. Deploy ReverseInnerSeller with manually specified USDT address
        // Note: Replace this address with the actual USDT receiver address before deployment
        const usdtReceiverAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; 
        
        console.log("Deploying ReverseInnerSeller...");
        await deployer.deploy(
            ReverseInnerSeller, 
            reverseInstance.address, 
            usdtReceiverAddress,
            { from: accounts[0] }
        );
        
        const sellerInstance = await ReverseInnerSeller.deployed();
        console.log("ReverseInnerSeller deployed at:", sellerInstance.address);
        
        // 3. Transfer 1,000,000 REV tokens to the ReverseInnerSeller contract
        const transferAmount = web3.utils.toWei("1000000", "ether");
        console.log(`Transferring ${web3.utils.fromWei(transferAmount, "ether")} REV to ReverseInnerSeller...`);
        
        await reverseInstance.transfer(sellerInstance.address, transferAmount, { from: accounts[0] });
        
        // Check the balance to confirm transfer
        const balance = await reverseInstance.balanceOf(sellerInstance.address);
        console.log(`ReverseInnerSeller contract balance: ${web3.utils.fromWei(balance, "ether")} REV`);
        
        console.log("Deployment and setup completed successfully!");
    } catch (error) {
        console.error("Deployment failed:", error);
        throw error;
    }
};