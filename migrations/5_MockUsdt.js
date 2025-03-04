const MockERC20 = artifacts.require("MockERC20");

module.exports = async function (deployer, network, accounts) {
    const name = "Tether USD";
    const symbol = "USDT";
    const decimals = 6; // USDT typically has 6 decimals

    // Deploy the MockERC20 contract as USDT
    await deployer.deploy(MockERC20, name, symbol, decimals);
    
    // Get the deployed instance
    const mockUSDT = await MockERC20.deployed();
    
    console.log(`MockERC20 deployed as USDT at: ${mockUSDT.address}`);

    // Optionally mint some initial tokens to the deployer address
    if (network !== "mainnet") {
        const initialSupply = "1000000000000"; // 1 million USDT (accounting for 6 decimals)
        await mockUSDT.mint(accounts[0], initialSupply);
        console.log(`Minted ${initialSupply} USDT tokens to ${accounts[0]}`);
    }
};