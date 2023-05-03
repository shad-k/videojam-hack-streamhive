// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StreamHiveCreatorToken is ERC20, ERC20Burnable, Ownable {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _totalSupply,
        address _owner
    ) ERC20(name_, symbol_) {
        uint256 TOTAL_SUPPLY = _totalSupply * 10 ** decimals(); // Total supply of 1 million tokens
        uint256 MINT_AMOUNT = TOTAL_SUPPLY / 1000; // Mint 0.1% of total supply

        _mint(msg.sender, MINT_AMOUNT);
        _mint(_owner, TOTAL_SUPPLY - MINT_AMOUNT);
    }
}
