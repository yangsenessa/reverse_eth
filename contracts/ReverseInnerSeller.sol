// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Reverse} from "./Reverse.sol";

/**
 * @title ReverseInnerSeller
 * @dev Contract for selling REV tokens in exchange for USDT with fixed pricing tiers
 */
contract ReverseInnerSeller is ReentrancyGuard, Ownable {
    // REV token contract
    Reverse public immutable revToken;

    // Address where USDT payments will be sent
    address public usdtReceiver;
    
    // USDT token contract - ETH Mainnet USDT address
    IERC20 public immutable usdtToken;
    
    // Price tiers mapping: USDT amount => REV amount
    mapping(uint256 => uint256) public priceTiers;
    
    // Valid payment amounts
    uint256[] public validPaymentAmounts;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 usdtAmount, uint256 revAmount);
    event PriceTierAdded(uint256 usdtAmount, uint256 revAmount);
    event PriceTierRemoved(uint256 usdtAmount);
    
    /**
     * @dev Constructor initializes the contract with REV and USDT token addresses
     * @param _revToken Address of the REV token contract
     * @param _usdtReceiver Address of the account which used to recieving payments
     */
    constructor(address _revToken, address _usdtReceiver) Ownable(msg.sender) {
        require(_revToken != address(0), "REV token address cannot be zero");
        require(_usdtReceiver != address(0), "USDT receiver address cannot be zero");
        usdtReceiver = _usdtReceiver;
        revToken = Reverse(_revToken);
        usdtToken = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7); // ETH mainnet USDT address
        
        // Initialize price tiers (USDT amount => REV amount)
        _addPriceTier(3000 * 10**6, 5000 * 10**18);     // 3,000 USDT = 5,000 REV
        _addPriceTier(10000 * 10**6, 18000 * 10**18);   // 10,000 USDT = 18,000 REV
        _addPriceTier(50000 * 10**6, 100000 * 10**18);  // 50,000 USDT = 100,000 REV
    }
    
    /**
     * @dev Internal function to add price tier
     * @param usdtAmount Amount of USDT for the tier (in USDT smallest unit - 6 decimals)
     * @param revAmount Amount of REV tokens to sell (in REV smallest unit - 18 decimals)
     */
    function _addPriceTier(uint256 usdtAmount, uint256 revAmount) internal {
        require(usdtAmount > 0, "USDT amount must be positive");
        require(revAmount > 0, "REV amount must be positive");
        require(priceTiers[usdtAmount] == 0, "Price tier already exists");
        
        priceTiers[usdtAmount] = revAmount;
        validPaymentAmounts.push(usdtAmount);
        
        emit PriceTierAdded(usdtAmount, revAmount);
    }
    
    /**
     * @dev Allows owner to add new price tiers
     * @param usdtAmount Amount of USDT for the tier (in USDT smallest unit)
     * @param revAmount Amount of REV tokens to sell (in REV smallest unit)
     */
    function addPriceTier(uint256 usdtAmount, uint256 revAmount) external onlyOwner {
        _addPriceTier(usdtAmount, revAmount);
    }
    
    /**
     * @dev Allows owner to remove price tiers
     * @param usdtAmount Amount of USDT for the tier to remove
     */
    function removePriceTier(uint256 usdtAmount) external onlyOwner {
        require(priceTiers[usdtAmount] > 0, "Price tier does not exist");
        
        // Remove from validPaymentAmounts array
        for (uint256 i = 0; i < validPaymentAmounts.length; i++) {
            if (validPaymentAmounts[i] == usdtAmount) {
                validPaymentAmounts[i] = validPaymentAmounts[validPaymentAmounts.length - 1];
                validPaymentAmounts.pop();
                break;
            }
        }
        
        delete priceTiers[usdtAmount];
        emit PriceTierRemoved(usdtAmount);
    }
    
    /**
     * @dev Validates if the USDT amount is an accepted payment amount
     * @param amount Amount to validate
     * @return bool indicating if the amount is valid
     */
    function isValidPaymentAmount(uint256 amount) public view returns (bool) {
        return priceTiers[amount] > 0;
    }
    
    /**
     * @dev Returns the number of valid payment amounts
     * @return uint256 Number of valid payment amounts
     */
    function getValidPaymentAmountsCount() external view returns (uint256) {
        return validPaymentAmounts.length;
    }
    
    /**
     * @dev Gets the REV amount for a given USDT payment amount
     * @param usdtAmount USDT payment amount
     * @return uint256 Corresponding REV amount
     */
    function getRevAmount(uint256 usdtAmount) public view returns (uint256) {
        uint256 revAmount = priceTiers[usdtAmount];
        require(revAmount > 0, "Invalid payment amount");
        return revAmount;
    }
    
    /**
     * @dev Buy REV tokens using USDT
     * @param usdtAmount Amount of USDT to spend (must match one of the price tiers)
     */
    function buyTokens(uint256 usdtAmount) external nonReentrant {
        // Validate payment amount
        uint256 revAmount = getRevAmount(usdtAmount);
        
        // Check if contract has enough REV tokens
        require(revToken.balanceOf(address(this)) >= revAmount, "Insufficient REV balance in contract");
        
        // Ensure the transaction is using the correct USDT token
        require(msg.sender != address(0), "Invalid sender address");
        require(msg.data.length >= 4, "Invalid transaction data");
       

        // Check that buyer has sufficient USDT balance
        require(usdtToken.balanceOf(msg.sender) >= usdtAmount, "Insufficient USDT balance");
        
        // Check that buyer has approved this contract to spend their USDT
        require(usdtToken.allowance(msg.sender, address(this)) >= usdtAmount, "Insufficient USDT allowance");
        
        // Transfer USDT from buyer to usdtReceiver
        bool success = usdtToken.transferFrom(msg.sender, usdtReceiver, usdtAmount);
        require(success, "USDT transfer failed");
        
        // Transfer REV tokens from this contract to buyer
        bool transferSuccess = revToken.transfer(msg.sender, revAmount);
        require(transferSuccess, "REV transfer to buyer failed");
        
        emit TokensPurchased(msg.sender, usdtAmount, revAmount);
    }
    
    /**
     * @dev Allows owner to withdraw USDT from contract
     * @param amount Amount of USDT to withdraw
     */
    function withdrawUSDT(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(usdtToken.balanceOf(address(this)) >= amount, "Insufficient USDT balance");
        
        require(usdtToken.transfer(owner(), amount), "USDT transfer failed");
    }
    
    /**
     * @dev Allows owner to withdraw REV tokens from contract
     * @param amount Amount of REV to withdraw
     */
    function withdrawREV(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(revToken.balanceOf(address(this)) >= amount, "Insufficient REV balance");
        
        require(revToken.transfer(owner(), amount), "REV transfer failed");
    }
    
    /**
     * @dev Rejects any ETH accidentally sent to this contract
     */
    receive() external payable {
        revert("ETH payments not accepted");
    }
    
    /**
     * @dev Rejects any ETH accidentally sent to this contract with data
     */
    fallback() external payable {
        revert("Invalid function call");
    }
}