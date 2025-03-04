// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Reverse is ERC20, ERC20Burnable {
    event DebugConstructor(uint256 totalSupply, uint8 decimals);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 tokenDecimals
    ) ERC20(name, symbol) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be positive");
        require(tokenDecimals <= 18, "Decimals cannot exceed 18");
        
        uint256 totalSupply = initialSupply * 10**tokenDecimals;
        require(totalSupply / 10**tokenDecimals == initialSupply, "Supply calculation overflow");
        
        // Emit debug event
        emit DebugConstructor(totalSupply, tokenDecimals);

        _mint(msg.sender, totalSupply);
    }

    function decimals() public pure virtual override returns (uint8) {
        return 18;
    }
}