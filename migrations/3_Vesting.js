const ReverseVesting = artifacts.require("ReverseVesting");
const ReverseToken = artifacts.require("Reverse");

module.exports = async function (deployer, network, accounts) {
    try {
        console.log(`Deploying to network: ${network}`);
        
        // Define beneficiaries - use accounts from Ganache or specify addresses for mainnet
        let beneficiaries = [];
        
        if (network === 'development' || network === 'ganache') {
            // Use local accounts for testing
            //beneficiaries = accounts.slice(1, 11); // Get 10 accounts, skip deployer
            beneficiaries = [
                //"0x31905Ee8D57C05EC7E413fa327a63490DCE0E4D6"// Replace with actual addresses
                accounts[1]
            ];
        } else if (network === 'mainnet') {
            // For mainnet, specify actual beneficiary addresses
            beneficiaries = [
                "0x31905Ee8D57C05EC7E413fa327a63490DCE0E4D6"// Replace with actual addresses
            ];
        }
        
        console.log(`Deploying vesting contracts for ${beneficiaries.length} beneficiaries`);
        
        // Common timestamps
        const startTimestamp = Math.floor(Date.now() / 1000); // Current time
        console.log(`Start timestamp: ${startTimestamp}`);
        
        // Deploy token first if it doesn't exist yet (only for testing)
        let tokenAddress;
        if (network === 'development' || network === 'ganache') {
            // Only deploy token on test networks if needed
            try {
                const deployedToken = await ReverseToken.deployed();
                tokenAddress = deployedToken.address;
                console.log(`Using existing token at: ${tokenAddress}`);
            } catch (e) {
                // Token doesn't exist, deploy it
                console.log("Token not found, deploying new token...");
                // Deploy token code here if needed
            }
        } else if (network === 'mainnet') {
            // Use the actual token address on mainnet
            // Get the token that was deployed in the previous migration
            const deployedToken = await ReverseToken.deployed();
            tokenAddress = deployedToken.address;
            console.log(`Using Reverse token at: ${tokenAddress}`);
        }
        
        // Track deployed vesting contracts
        const deployedContracts = [];
        
        // Deploy vesting contracts for each beneficiary
        for (let i = 0; i < beneficiaries.length; i++) {
            const beneficiaryAddress = beneficiaries[i];
            console.log(`Deploying vesting contract ${i+1}/10 for ${beneficiaryAddress}`);
            
            // Customize parameters per beneficiary
            let specificDuration;
            let specificStartTime = startTimestamp;
            
            if (i < 3) {
                // First 3 accounts: 2 year vesting
                specificDuration = 0; // Set duration to 0 for immediate release after 2-year wait period
                // Start time after 2 years (current time + 2 years)
                specificStartTime = startTimestamp + (2 * 365 * 24 * 60 * 60);
                console.log(`  - 2 year vesting (${specificDuration} seconds)`);
            } else if (i < 6) {
                // Next 3 accounts: 1 year vesting with 6 month cliff
                specificDuration = 365 * 24 * 60 * 60;
                specificStartTime = startTimestamp + (180 * 24 * 60 * 60); // 6 month cliff
                console.log(`  - 1 year vesting with 6 month cliff (${specificDuration} seconds)`);
            } else {
                // Remaining accounts: 6 month vesting
                specificDuration = 180 * 24 * 60 * 60;
                console.log(`  - 6 month vesting (${specificDuration} seconds)`);
            }
            
            // Set gas parameters based on network
            const gasOptions = network === 'mainnet' 
                ? { gas: 5000000, gasPrice: 30000000000 } // 30 gwei for mainnet
                : { gas: 5000000 }; // For local networks
            
            // Deploy the vesting contract
            await deployer.deploy(
                ReverseVesting,
                beneficiaryAddress,
                specificStartTime,
                specificDuration,
                gasOptions
            );
            
            const vestingContract = await ReverseVesting.deployed();
            deployedContracts.push({
                address: vestingContract.address,
                beneficiary: beneficiaryAddress
            });
            
            console.log(`  ✓ Deployed at ${vestingContract.address}`);
            
            // For test networks, fund the vesting contract with tokens
            if ((network === 'development' || network === 'ganache') && tokenAddress) {
                try {
                    const tokenInstance = await ReverseToken.at(tokenAddress);
                    console.log(`  - Token instance found at address: ${tokenInstance.address}`);
                    
                    // Calculate tokens based on vesting duration - just an example
                    const tokensToVest = specificDuration > 0 ? 70000000 * (specificDuration / (365 * 24 * 60 * 60)) : 70000000;
                    const tokenAmount = web3.utils.toWei(tokensToVest.toString(), 'ether');
                    
                    await tokenInstance.transfer(vestingContract.address, tokenAmount, { from: accounts[0] });
                    console.log(`  ✓ Funded with ${tokensToVest} tokens`);
                } catch (e) {
                    console.log(`  ✗ Could not fund with tokens: ${e.message}`);
                }
            }
        }
        
        // Print summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log(`Deployed ${deployedContracts.length} vesting contracts:`);
        deployedContracts.forEach((contract, i) => {
            console.log(`${i+1}. Address: ${contract.address} | Beneficiary: ${contract.beneficiary}`);
        });
        
    } catch (error) {
        console.error("Vesting deployment failed:", error);
        throw error;
    }
};