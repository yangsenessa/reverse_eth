# Smart Contract API Documentation for Frontend Developers

This document provides detailed information about the smart contract ABIs, method descriptions, and JavaScript/TypeScript usage examples for the Reverse platform.

## Table of Contents

1. [Reverse Token](#1-reverse-token)
2. [ReverseInnerSeller](#2-reverseinnerseller)
3. [ReverseVesting](#3-reversevesting)

## 1. Reverse Token

The Reverse token is a standard ERC20 token with burning capabilities.

### Contract Methods

#### Standard ERC20 Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `balanceOf(address)` | Get token balance of an address | `address account`: Owner address | `uint256`: Balance amount |
| `transfer(address, uint256)` | Transfer tokens to a specified address | `address to`: Recipient address<br>`uint256 amount`: Token amount | `bool`: Success status |
| `allowance(address, address)` | Check how many tokens an address can spend on behalf of another | `address owner`: Token owner<br>`address spender`: Spender address | `uint256`: Allowance amount |
| `approve(address, uint256)` | Approve an address to spend tokens | `address spender`: Spender address<br>`uint256 amount`: Approval amount | `bool`: Success status |
| `transferFrom(address, address, uint256)` | Transfer tokens between addresses if allowed | `address from`: Sender address<br>`address to`: Recipient address<br>`uint256 amount`: Token amount | `bool`: Success status |

#### Burnable Extension

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `burn(uint256)` | Burn tokens from caller's address | `uint256 amount`: Amount to burn | None |
| `burnFrom(address, uint256)` | Burn tokens from an address (requires allowance) | `address account`: Account to burn from<br>`uint256 amount`: Amount to burn | None |

### Example Usage (TypeScript/JavaScript)

```typescript
import { ethers } from 'ethers';

// Setup provider and signer
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Contract address and ABI
const reverseAddress = '0xYourReverseTokenContractAddress';
const reverseABI = [
    // ERC20 functions
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address, uint256) returns (bool)',
    'function allowance(address, address) view returns (uint256)',
    'function approve(address, uint256) returns (bool)',
    'function transferFrom(address, address, uint256) returns (bool)',
    // Burnable functions
    'function burn(uint256)',
    'function burnFrom(address, uint256)'
];

// Create contract instance
const reverseToken = new ethers.Contract(reverseAddress, reverseABI, signer);

// Get token balance
async function getBalance(address) {
    const balance = await reverseToken.balanceOf(address);
    console.log(`Balance: ${ethers.utils.formatUnits(balance, 18)} REV`);
    return balance;
}

// Transfer tokens
async function transferTokens(toAddress, amount) {
    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
    const tx = await reverseToken.transfer(toAddress, amountWei);
    await tx.wait();
    console.log(`${amount} REV transferred to ${toAddress}`);
}

// Approve spending
async function approveSpending(spenderAddress, amount) {
    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
    const tx = await reverseToken.approve(spenderAddress, amountWei);
    await tx.wait();
    console.log(`Approved ${spenderAddress} to spend ${amount} REV`);
}
```

## 2. ReverseInnerSeller

A contract for selling REV tokens in exchange for USDT with fixed pricing tiers.

### Contract Methods

#### View Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `revToken()` | Get the REV token contract address | None | `address`: REV token address |
| `usdtReceiver()` | Get the address that receives USDT payments | None | `address`: USDT receiver address |
| `usdtToken()` | Get the USDT token contract address | None | `address`: USDT token address |
| `priceTiers(uint256)` | Get REV amount for a USDT amount | `uint256`: USDT amount | `uint256`: REV amount |
| `validPaymentAmounts(uint256)` | Get a valid payment amount at index | `uint256`: Index | `uint256`: USDT amount |
| `isValidPaymentAmount(uint256)` | Check if a USDT amount is a valid payment | `uint256 amount`: USDT amount | `bool`: Valid status |
| `getValidPaymentAmountsCount()` | Get count of valid payment amounts | None | `uint256`: Count |
| `getRevAmount(uint256)` | Get REV amount for a USDT amount | `uint256 usdtAmount`: USDT amount | `uint256`: REV amount |

#### Transaction Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `buyTokens(uint256)` | Buy REV tokens with USDT | `uint256 usdtAmount`: Amount of USDT to spend | None |
| `addPriceTier(uint256, uint256)` | Add a new price tier (owner only) | `uint256 usdtAmount`: USDT amount<br>`uint256 revAmount`: REV amount | None |
| `removePriceTier(uint256)` | Remove a price tier (owner only) | `uint256 usdtAmount`: USDT amount to remove | None |
| `withdrawUSDT(uint256)` | Withdraw USDT from contract (owner only) | `uint256 amount`: Amount to withdraw | None |
| `withdrawREV(uint256)` | Withdraw REV from contract (owner only) | `uint256 amount`: Amount to withdraw | None |
| `setUsdtToken(address)` | Set USDT token address (owner only) | `address _usdtToken`: New USDT token address | None |
| `setUsdtReceiver(address)` | Set USDT receiver address (owner only) | `address _usdtReceiver`: New receiver address | None |

### Example Usage (TypeScript/JavaScript)

```typescript
import { ethers } from 'ethers';

// Setup provider and signer
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Contract addresses and ABIs
const sellerAddress = '0xYourReverseInnerSellerContractAddress';
const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // ETH mainnet USDT

const sellerABI = [
    // View functions
    'function revToken() view returns (address)',
    'function usdtReceiver() view returns (address)',
    'function usdtToken() view returns (address)',
    'function priceTiers(uint256) view returns (uint256)',
    'function validPaymentAmounts(uint256) view returns (uint256)',
    'function isValidPaymentAmount(uint256) view returns (bool)',
    'function getValidPaymentAmountsCount() view returns (uint256)',
    'function getRevAmount(uint256) view returns (uint256)',
    // Transaction functions
    'function buyTokens(uint256)',
    'function addPriceTier(uint256, uint256)',
    'function removePriceTier(uint256)',
    'function withdrawUSDT(uint256)',
    'function withdrawREV(uint256)',
    'function setUsdtToken(address)',
    'function setUsdtReceiver(address)'
];

const erc20ABI = [
    'function approve(address, uint256) returns (bool)',
    'function allowance(address, address) view returns (uint256)'
];

// Create contract instances
const sellerContract = new ethers.Contract(sellerAddress, sellerABI, signer);
const usdtContract = new ethers.Contract(usdtAddress, erc20ABI, signer);

// Get valid payment tiers
async function getValidPaymentTiers() {
    const count = await sellerContract.getValidPaymentAmountsCount();
    const tiers = [];
    
    for (let i = 0; i < count; i++) {
        const usdtAmount = await sellerContract.validPaymentAmounts(i);
        const revAmount = await sellerContract.priceTiers(usdtAmount);
        tiers.push({
            usdt: ethers.utils.formatUnits(usdtAmount, 6), // USDT uses 6 decimals
            rev: ethers.utils.formatUnits(revAmount, 18)   // REV uses 18 decimals
        });
    }
    
    return tiers;
}

// Buy REV tokens with USDT
async function buyRevTokens(usdtAmount) {
    // First, approve the seller contract to spend your USDT
    const amountUSDT = ethers.utils.parseUnits(usdtAmount.toString(), 6); // USDT has 6 decimals
    
    // Check if payment amount is valid
    const isValid = await sellerContract.isValidPaymentAmount(amountUSDT);
    if (!isValid) {
        console.error('Invalid payment amount. Must be one of the predefined tiers.');
        return;
    }
    
    // Approve USDT spending
    const approveTx = await usdtContract.approve(sellerAddress, amountUSDT);
    await approveTx.wait();
    console.log(`Approved ${usdtAmount} USDT for spending`);
    
    // Buy REV tokens
    const buyTx = await sellerContract.buyTokens(amountUSDT);
    await buyTx.wait();
    
    const revAmount = await sellerContract.getRevAmount(amountUSDT);
    console.log(`Purchased ${ethers.utils.formatUnits(revAmount, 18)} REV for ${usdtAmount} USDT`);
}
```

## 3. ReverseVesting

A vesting contract for the Reverse (REV) token based on OpenZeppelin's VestingWallet.

### Contract Methods

#### View Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `beneficiary()` | Get the beneficiary address | None | `address`: Beneficiary address |
| `start()` | Get the vesting start timestamp | None | `uint256`: Start timestamp |
| `duration()` | Get the vesting duration in seconds | None | `uint256`: Duration in seconds |
| `released(address)` | Get the released amount for a token | `address token`: Token address | `uint256`: Released amount |
| `vestedAmount(address, uint64)` | Calculate vested amount at timestamp | `address token`: Token address<br>`uint64 timestamp`: Target timestamp | `uint256`: Vested amount |

#### Transaction Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `release(address)` | Release vested tokens to the beneficiary | `address token`: Token address | None |
| `forceRelease(address)` | Force release tokens (owner only) | `address token`: Token address | None |
| `recoverERC20(address, uint256)` | Recover accidentally sent tokens (owner only) | `address token`: Token address<br>`uint256 amount`: Amount to recover | None |

### Example Usage (TypeScript/JavaScript)

```typescript
import { ethers } from 'ethers';

// Setup provider and signer
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Contract address and ABI
const vestingAddress = '0xYourReverseVestingContractAddress';
const reverseTokenAddress = '0xYourReverseTokenAddress';

const vestingABI = [
    // View functions
    'function beneficiary() view returns (address)',
    'function start() view returns (uint256)',
    'function duration() view returns (uint256)',
    'function released(address) view returns (uint256)',
    'function vestedAmount(address, uint64) view returns (uint256)',
    // Transaction functions
    'function release(address)',
    'function forceRelease(address)',
    'function recoverERC20(address, uint256)'
];

// Create contract instance
const vestingContract = new ethers.Contract(vestingAddress, vestingABI, signer);

// Get vesting information
async function getVestingInfo() {
    const beneficiary = await vestingContract.beneficiary();
    const startTime = await vestingContract.start();
    const durationSecs = await vestingContract.duration();
    const releasedAmount = await vestingContract.released(reverseTokenAddress);
    
    // Calculate current vested amount
    const currentTime = Math.floor(Date.now() / 1000);
    const vestedAmount = await vestingContract.vestedAmount(
        reverseTokenAddress, 
        currentTime
    );
    
    return {
        beneficiary,
        startDate: new Date(startTime * 1000).toLocaleString(),
        duration: `${durationSecs / 86400} days`,
        released: ethers.utils.formatUnits(releasedAmount, 18),
        vested: ethers.utils.formatUnits(vestedAmount, 18),
        available: ethers.utils.formatUnits(vestedAmount.sub(releasedAmount), 18)
    };
}

// Release vested tokens
async function releaseVestedTokens() {
    const tx = await vestingContract.release(reverseTokenAddress);
    await tx.wait();
    console.log('Vested tokens released to beneficiary');
}

// Force release tokens (owner only)
async function forceReleaseTokens() {
    const tx = await vestingContract.forceRelease(reverseTokenAddress);
    await tx.wait();
    console.log('Tokens force-released by owner');
}

// Recover accidentally sent tokens (owner only)
async function recoverTokens(tokenAddress, amount) {
    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
    const tx = await vestingContract.recoverERC20(tokenAddress, amountWei);
    await tx.wait();
    console.log(`${amount} tokens recovered to owner`);
}
```

---

## Notes

- All token amounts should be converted to their smallest unit (wei) when sending to the contract:
    - REV token uses 18 decimals (`parseUnits(amount, 18)`)
    - USDT uses 6 decimals (`parseUnits(amount, 6)`)
- Always ensure you have sufficient gas for transactions
- For the ReverseInnerSeller contract, you must approve USDT spending before buying REV tokens

# Smart Contract API Documentation for Frontend Developers
## Token Approval Guide for USDT Transactions

Before interacting with contracts that require USDT transfers on your behalf (like the ReverseInnerSeller contract), you must first approve the contract to spend your USDT tokens. This is a standard ERC-20 security mechanism.

### Understanding Token Approvals

Token approval is a two-step process:
1. **Approve**: User grants permission to a contract to transfer specific tokens
2. **Transfer**: The approved contract can then transfer tokens on behalf of the user

### How to Implement USDT Approval

#### Using ethers.js v5

```javascript
async function approveUSDT(spenderContractAddress, amount) {
    try {
        // Initialize provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // USDT contract address (Ethereum Mainnet)
        const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        
        // USDT uses 6 decimal places
        const amountToApprove = ethers.utils.parseUnits(amount.toString(), 6);
        
        // Create USDT contract instance
        const usdtContract = new ethers.Contract(
            usdtAddress,
            ['function approve(address spender, uint256 amount) returns (bool)'],
            signer
        );
        
        // Send approval transaction
        const tx = await usdtContract.approve(spenderContractAddress, amountToApprove);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log('Approval successful:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Approval failed:', error.message);
        throw error;
    }
}
```

#### Using ethers.js v6

```typescript
import { ethers } from 'ethers';

async function approveUSDT(
    provider: ethers.BrowserProvider,
    spenderAddress: string,
    amount: number
): Promise<ethers.TransactionReceipt> {
    // Get the signer
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    
    // USDT contract address (Ethereum Mainnet)
    const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    
    // Parse amount with 6 decimals (USDT standard)
    const amountToApprove = ethers.parseUnits(amount.toString(), 6);
    
    // Create contract instance
    const usdtContract = new ethers.Contract(
        usdtAddress,
        ['function approve(address, uint256) returns (bool)', 
         'function allowance(address, address) view returns (uint256)'],
        signer
    );
    
    // Check current allowance
    const currentAllowance = await usdtContract.allowance(signerAddress, spenderAddress);
    console.log(`Current allowance: ${ethers.formatUnits(currentAllowance, 6)} USDT`);
    
    // If current allowance is sufficient, no need for a new approval
    if (currentAllowance >= amountToApprove) {
        console.log('Current allowance is sufficient');
        return null;
    }
    
    // Send approval transaction
    const tx = await usdtContract.approve(spenderAddress, amountToApprove);
    console.log('Approval transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Approval confirmed in block:', receipt.blockNumber);
    
    return receipt;
}
```

### Best Practices

1. **Check existing allowance** before sending a new approval transaction
2. **Set exact amounts** rather than unlimited approvals (max uint256) for better security
3. **Handle transaction rejection** by the user or network errors
4. **Provide feedback** to users during the approval process
5. **Reset allowance** to zero before setting a new value to prevent certain smart contract vulnerabilities

### Implementation in a React Component

```jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';

function USDTApprovalButton({ spenderAddress, amount, onSuccess }) {
    const [isApproving, setIsApproving] = useState(false);
    const [error, setError] = useState(null);
    
    async function handleApproval() {
        setIsApproving(true);
        setError(null);
        
        try {
            // Request connection to wallet
            if (!window.ethereum) throw new Error("No Ethereum wallet found");
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            
            // USDT contract
            const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const usdtContract = new ethers.Contract(
                usdtAddress,
                ['function approve(address, uint256) returns (bool)'],
                signer
            );
            
            // Approve USDT spending
            const amountInWei = ethers.utils.parseUnits(amount.toString(), 6);
            const tx = await usdtContract.approve(spenderAddress, amountInWei);
            
            // Wait for transaction to be mined
            const receipt = await tx.wait();
            
            onSuccess?.(receipt);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to approve USDT");
        } finally {
            setIsApproving(false);
        }
    }
    
    return (
        <div>
            <button 
                onClick={handleApproval} 
                disabled={isApproving}
            >
                {isApproving ? 'Approving...' : `Approve ${amount} USDT`}
            </button>
            
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default USDTApprovalButton;
```

### Checking Allowance

Before initiating a purchase or transaction, check if the user has already approved enough USDT:

```javascript
async function checkUsdtAllowance(userAddress, spenderAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const usdtContract = new ethers.Contract(
        usdtAddress,
        ['function allowance(address, address) view returns (uint256)'],
        provider
    );
    
    const allowance = await usdtContract.allowance(userAddress, spenderAddress);
    return ethers.utils.formatUnits(allowance, 6); // USDT uses 6 decimals
}
```
