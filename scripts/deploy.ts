// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import {ethers} from 'hardhat';

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const TokenReward = await ethers.getContractFactory('TokenReward');
  const tokenReward = await TokenReward.deploy();
  await tokenReward.deployed();
  console.log('TokenReward deployed to:', tokenReward.address);

  const NFTStaking = await ethers.getContractFactory('NFTStaking');
  const nftStaking = await NFTStaking.deploy(tokenReward.address);
  await nftStaking.deployed();
  console.log('NFTStaking deployed to:', nftStaking.address);

  // Transfer ownership
  await tokenReward.transferOwnership(nftStaking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
