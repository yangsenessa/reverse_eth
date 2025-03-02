// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ReverseAirdrop
 * @dev Contract for distributing Reverse tokens to multiple addresses at once
 */
contract ReverseAirdrop is Ownable, ReentrancyGuard {
    IERC20 public reverseToken;
    
    event AirdropProcessed(address indexed sender, uint256 totalAmount, uint256 recipientCount);
    event TokenAddressUpdated(address indexed oldToken, address indexed newToken);
    
    /**
     * @dev Constructor sets the Reverse token address and owner
     * @param _tokenAddress Address of the Reverse token contract
     * @param _initialOwner Address to be set as the contract owner
     */
    constructor(address _tokenAddress, address _initialOwner) Ownable(_initialOwner) {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        reverseToken = IERC20(_tokenAddress);
    }
    
    /**
     * @dev Transfers tokens to multiple addresses in a single transaction
     * @param _recipients Array of recipient addresses
     * @param _amounts Array of token amounts to send to each recipient
     */
    function multiSend(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external nonReentrant {
        require(_recipients.length == _amounts.length, "Recipients and amounts length mismatch");
        require(_recipients.length > 0 && _recipients.length <= 200, "Invalid batch size");
        
        uint256 totalAmount = getSum(_amounts);
        require(
            reverseToken.allowance(msg.sender, address(this)) >= totalAmount,
            "Insufficient allowance"
        );
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Cannot send to zero address");
            reverseToken.transferFrom(msg.sender, _recipients[i], _amounts[i]);
        }
        
        emit AirdropProcessed(msg.sender, totalAmount, _recipients.length);
    }
    
    /**
     * @dev Owner can update the Reverse token address if needed
     * @param _newTokenAddress The new token contract address
     */
    function setTokenAddress(address _newTokenAddress) external onlyOwner {
        require(_newTokenAddress != address(0), "Token address cannot be zero");
        address oldToken = address(reverseToken);
        reverseToken = IERC20(_newTokenAddress);
        emit TokenAddressUpdated(oldToken, _newTokenAddress);
    }
    
    /**
     * @dev Calculate the sum of an array of uint256 values
     * @param _arr Array of uint256 values
     * @return sum The sum of all values in the array
     */
    function getSum(uint256[] calldata _arr) public pure returns (uint256 sum) {
        for (uint256 i = 0; i < _arr.length; i++) {
            sum += _arr[i];
        }
    }
    
    /**
     * @dev Allows the owner to recover any ERC20 tokens sent to this contract by mistake
     * @param _token The token contract address
     * @param _amount The amount to recover
     */
    function recoverERC20(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}