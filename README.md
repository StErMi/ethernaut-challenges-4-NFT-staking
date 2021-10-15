# Ethernaut challenges

![amir-zand-thumb1](https://user-images.githubusercontent.com/550409/136199654-67467daa-fd9a-4f6a-9c07-969626d5ae53.jpg)
Image by [Amir Zand](https://www.artstation.com/amirzand)

This repository contains the solution of the [Ethernaut Challenge 4 - NFT staking](https://github.com/ethernautdao/challenges).

- OpenSea Collection: https://testnets.opensea.io/collection/nftstaking-v2
- NFTStaking contract on Rinkeby: [0x2A03470305d7b9870879aA54C7dDfba5285B947f](https://rinkeby.etherscan.io/address/0x2A03470305d7b9870879aA54C7dDfba5285B947f)
- TokenReward contract on Rinkeby: [0xaA5c15b03D9c0Ba30be66D1A2B3e980bFBF5AC60](https://rinkeby.etherscan.io/address/0xaA5c15b03D9c0Ba30be66D1A2B3e980bFBF5AC60#code)

## Challenge 4 - NFT staking

_Difficulty_

- Solidity: Easy
- dApp: n/a

_Objectives_

- Build an NFT Staking contract that will reward the users with a custom ERC20 token based on their staking period that they choose
- Example: I can stake my NFT for 1 month and I get a reward of X%, I stake it for 6 months and i get a reward of 2X% and so on.
- The NFTs that are used for the staking must be also present into a custom OpenSea collection
- Full unit test coverage

_Hints_

- Use hardhat for unit testing
- Use Rinkeby for OpenSea testnet
