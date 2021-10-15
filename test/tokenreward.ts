import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import TokenRewardArtifact from '../artifacts/contracts/TokenReward.sol/TokenReward.json';
import {TokenReward} from '../typechain/TokenReward';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

const {deployContract} = waffle;
const {expect} = chai;

const TOKEN_PER_MONTH = ethers.utils.parseEther('100');

describe('TokenReward Contract', () => {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let addrs: SignerWithAddress[];

  let tokenReward: TokenReward;

  beforeEach(async () => {
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    tokenReward = (await deployContract(owner, TokenRewardArtifact)) as TokenReward;
  });

  describe('Test mintReward', () => {
    it('Try to mint directly', async () => {
      const stakePeriodInMonth = 2;
      const mintTx = tokenReward.connect(addr1).mintReward(addr1.address, TOKEN_PER_MONTH.mul(stakePeriodInMonth));

      await expect(mintTx).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});
