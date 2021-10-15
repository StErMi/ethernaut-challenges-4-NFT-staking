import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import NFTStakingArtifact from '../artifacts/contracts/NFTStaking.sol/NFTStaking.json';
import {NFTStaking} from '../typechain/NFTStaking';
import TokenRewardArtifact from '../artifacts/contracts/TokenReward.sol/TokenReward.json';
import {TokenReward} from '../typechain/TokenReward';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

const {deployContract} = waffle;
const {expect} = chai;

// Utilities methods
const increaseWorldTimeInSeconds = async (seconds: number, mine = false) => {
  await ethers.provider.send('evm_increaseTime', [seconds]);
  if (mine) {
    await ethers.provider.send('evm_mine', []);
  }
};

const SECOND_IN_MONTH = 60 * 60 * 24 * 31;
const TOKEN_PER_MONTH = ethers.utils.parseEther('100');

describe('NFTStake Contract', () => {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let addrs: SignerWithAddress[];

  let nftStaking: NFTStaking;
  let tokenReward: TokenReward;

  beforeEach(async () => {
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    tokenReward = (await deployContract(owner, TokenRewardArtifact)) as TokenReward;
    nftStaking = (await deployContract(owner, NFTStakingArtifact, [tokenReward.address])) as NFTStaking;
    await tokenReward.transferOwnership(nftStaking.address);
  });

  describe('Test stake', () => {
    it('Stake unexisting token', async () => {
      const stakePeriodInMonth = 2;
      const stakeTx = nftStaking.connect(addr1).stake(1, stakePeriodInMonth);
      await expect(stakeTx).to.be.revertedWith('token does not exist');
    });

    it("Stake token you don't own", async () => {
      const stakePeriodInMonth = 2;
      await nftStaking.connect(addr2).mint();
      const stakeTx = nftStaking.connect(addr1).stake(1, stakePeriodInMonth);
      await expect(stakeTx).to.be.revertedWith('you are not the owner of the NFT');
    });

    it('Stake token you already staked', async () => {
      const stakePeriodInMonth = 2;
      await nftStaking.connect(addr1).mint();

      // stake nft 1 for 1 month
      await nftStaking.connect(addr1).stake(1, stakePeriodInMonth);
      const stakeTx = nftStaking.connect(addr1).stake(1, stakePeriodInMonth);
      await expect(stakeTx).to.be.revertedWith('nft is still locked');
    });

    it('Create a stake successfully', async () => {
      const stakePeriodInMonth = 2;
      await nftStaking.connect(addr1).mint();

      // stake nft 1 for 1 month
      await nftStaking.connect(addr1).stake(1, stakePeriodInMonth);

      // check owner
      const nftOwner = await nftStaking.ownerOf(1);
      expect(nftOwner).to.equal(addr1.address);

      // check token balance
      const balance = await tokenReward.balanceOf(addr1.address);
      expect(balance).to.equal(TOKEN_PER_MONTH.mul(stakePeriodInMonth));
    });

    it('Create a stake after time unlocked', async () => {
      const stakePeriodInMonth = 2;
      await nftStaking.connect(addr1).mint();

      // stake nft 1 for 1 month
      await nftStaking.connect(addr1).stake(1, stakePeriodInMonth);

      await increaseWorldTimeInSeconds(SECOND_IN_MONTH * stakePeriodInMonth, true);

      const secondPeriodInMonths = 3;
      await nftStaking.connect(addr1).stake(1, secondPeriodInMonths);

      // check owner
      const nftOwner = await nftStaking.ownerOf(1);
      expect(nftOwner).to.equal(addr1.address);

      // check token balance
      const balance = await tokenReward.balanceOf(addr1.address);
      expect(balance).to.equal(TOKEN_PER_MONTH.mul(stakePeriodInMonth).add(TOKEN_PER_MONTH.mul(secondPeriodInMonths)));
    });
  });

  describe('Test NFT transfer', () => {
    it('transfer if not exist', async () => {
      const stakeTx = nftStaking.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      await expect(stakeTx).to.be.revertedWith('ERC721: operator query for nonexistent token');
    });
    it('transfer if not owned', async () => {
      await nftStaking.connect(addr3).mint();
      const stakeTx = nftStaking.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      await expect(stakeTx).to.be.revertedWith('ERC721: transfer caller is not owner nor approved');
    });
    it('transfer if staked', async () => {
      const stakePeriodInMonth = 2;
      await nftStaking.connect(addr1).mint();

      // stake nft 1 for 1 month
      await nftStaking.connect(addr1).stake(1, stakePeriodInMonth);

      const stakeTx = nftStaking.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      await expect(stakeTx).to.be.revertedWith('nft is still locked');
    });

    it('transfer ok after lock period', async () => {
      const stakePeriodInMonth = 2;
      await nftStaking.connect(addr1).mint();

      // stake nft 1 for 1 month
      await nftStaking.connect(addr1).stake(1, stakePeriodInMonth);

      await increaseWorldTimeInSeconds(SECOND_IN_MONTH * stakePeriodInMonth, true);

      await nftStaking.connect(addr1).transferFrom(addr1.address, addr2.address, 1);

      const nftOwner = await nftStaking.ownerOf(1);
      expect(nftOwner).to.equal(addr2.address);
    });
  });
});
