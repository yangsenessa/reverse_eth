// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Reverse is ERC20, ERC20Burnable {
    event DebugConstructor(uint256 totalSupply, uint8 decimals);
    
    constructor() ERC20("Reverse", "REV") {
        require(bytes("Reverse").length > 0, "Name cannot be empty");
        require(bytes("REV").length > 0, "Symbol cannot be empty");
        
        uint256 initialSupply = 200_000_000;
        require(initialSupply > 0, "Initial supply must be positive");
        
        uint8 dec = decimals();
        require(dec <= 18, "Decimals cannot exceed 18");
        
        uint256 totalSupply = initialSupply * 10**dec;
        require(totalSupply / 10**dec == initialSupply, "Supply calculation overflow");
        
        // Emit debug event
        emit DebugConstructor(totalSupply, dec);

        _mint(msg.sender, totalSupply);
    }

    function decimals() public pure virtual override returns (uint8) {
        return 18;
    }
}