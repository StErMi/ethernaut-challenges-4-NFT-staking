//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 @title A contract to set a create a TokenReward Token used only to reward NFT staking. Can't be minted directly.
 @author Emanuele Ricci @StErMi
*/
contract TokenReward is ERC20, Ownable {
    constructor() ERC20("TokenReward", "TKR") {}

    /// @notice Can only be called by the NFT Staking contract to reward user afer staking an NFT
    function mintReward(address recipient, uint256 amount) external onlyOwner {
        _mint(recipient, amount);
    }
}
