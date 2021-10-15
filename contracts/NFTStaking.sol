//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./TokenReward.sol";
import "base64-sol/base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/// @notice Struct to track NFT lock mechanism
struct NFTLock {
    address owner;
    uint256 unlockTimestamp;
}

/**
 @title A contract to set a World Purpose
 @author Emanuele Ricci @StErMi
*/
contract NFTStaking is ERC721, ERC721Enumerable {
    /// @notice utility
    using Strings for uint256;

    /// @notice utility
    using Counters for Counters.Counter;

    /// @notice utility to track NFT IDs
    Counters.Counter private _tokenId;

    /// @notice TokenReward contract
    TokenReward public token;

    /// @notice Amount of tokens to reward the user for each month of lock
    uint256 constant TOKEN_REWARD_PER_PERIOD = 100 ether;

    uint256 constant STAKE_BASE_PERIOD = 31 days;

    /// @notice Mapping to track nft locks
    mapping(uint256 => NFTLock) private locks;

    /// @notice NFTLocked event
    event NFTLocked(address indexed sender, uint256 tokenID, uint256 unlockTimestamp, uint256 tokenAmount);

    constructor(address tokenRewardAddress) ERC721("NFTStaking", "NFTSTK") {
        token = TokenReward(tokenRewardAddress);
    }

    /**
     @notice Mint a new NFT
     @return the NFT tokenId
    */
    function mint() public returns (uint256) {
        _tokenId.increment();

        uint256 current = _tokenId.current();

        _mint(msg.sender, current);
        return current;
    }

    /**
     @notice Stake an NFT to get X amount of TokenReward
     @param tokenId The NFT tokenId
     @param months Number of months the NFT will be locked. Y months -> X reward * Y
    */
    function stake(uint256 tokenId, uint256 months) public {
        require(_exists(tokenId), "token does not exist");
        require(ownerOf(tokenId) == msg.sender, "you are not the owner of the NFT");

        // Check if the NFT is already straked
        NFTLock storage nftLock = locks[tokenId];
        require(nftLock.unlockTimestamp < block.timestamp, "nft is still locked");

        // Create a stake of the NFT and lock it
        uint256 unlockTimestamp = block.timestamp + (STAKE_BASE_PERIOD * months);
        nftLock.owner = msg.sender;
        nftLock.unlockTimestamp = unlockTimestamp;

        //  = NFTLock(msg.sender, unlockTimestamp);

        // Mint the reward
        uint256 tokenAmount = TOKEN_REWARD_PER_PERIOD * months;
        token.mintReward(msg.sender, TOKEN_REWARD_PER_PERIOD * months);

        // emit event
        emit NFTLocked(msg.sender, tokenId, unlockTimestamp, tokenAmount);
    }

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "token does not exist");

        NFTLock memory nftLock = locks[tokenId];

        string[5] memory parts;
        parts[
            0
        ] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        if (nftLock.unlockTimestamp == 0 || nftLock.unlockTimestamp < block.timestamp) {
            parts[1] = "NFT not staked yet";
            // parts[2] = "";
        } else {
            parts[1] = string(abi.encodePacked("Owner: ", toAsciiString(nftLock.owner)));
            parts[2] = '</text><text x="10" y="60" class="base">';
            parts[3] = string(abi.encodePacked("Locked until: ", nftLock.unlockTimestamp.toString()));
        }

        parts[4] = "</text></svg>";

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4]));

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Item #',
                        tokenId.toString(),
                        '", "description": "NFTStaking allow you to stake your NFT for X months to get a TokenReward amount.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(output)),
                        '"}'
                    )
                )
            )
        );
        output = string(abi.encodePacked("data:application/json;base64,", json));

        return output;
    }

    /**
     * @dev Hook that is called before any token transfer. Check if the user has the NFT locked
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        require(locks[tokenId].unlockTimestamp < block.timestamp, "nft is still locked");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Util to convert an address to a string
     */
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    /**
     * @dev Util to convert an address to a string
     */
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
