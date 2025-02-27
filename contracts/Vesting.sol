// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReverseVesting
 * @dev A vesting contract for the Reverse (REV) token based on OpenZeppelin's VestingWallet
 */
contract ReverseVesting is Ownable, VestingWallet {
    // Events
    event BeneficiaryChanged(address indexed previousBeneficiary, address indexed newBeneficiary);
    
    /**
     * @dev Constructor for the ReverseVesting contract
     */
    constructor(
        address beneficiaryAddress,
        uint64 startTimestamp,
        uint64 durationSeconds
    ) 
        VestingWallet(beneficiaryAddress, startTimestamp, durationSeconds)
    {
        require(beneficiaryAddress != address(0), "Beneficiary cannot be zero address");
        require(durationSeconds > 0, "Vesting duration must be greater than 0");
    }

    /**
     * @dev Force releases tokens to the beneficiary (restricted to owner)
     * @param token The ERC20 token to release (for Reverse token)
     */
    function forceRelease(address token) external onlyOwner {
        release(token);
    }

    /**
     * @dev Recovers any ERC20 tokens accidentally sent to the contract (excluding vested tokens)
     * @param token The ERC20 token to recover
     * @param amount The amount of tokens to recover
     */
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        uint256 vestedAmount = vestedAmount(token, uint64(block.timestamp));
        uint256 releasedAmount = released(token);
        uint256 vestedUnreleasedAmount = vestedAmount - releasedAmount;
        
        require(
            IERC20(token).balanceOf(address(this)) >= vestedUnreleasedAmount + amount,
            "Cannot recover vested tokens"
        );
        
        IERC20(token).transfer(owner(), amount);
    }
}