const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Reverse = artifacts.require('Reverse');

contract('Reverse', function (accounts) {
  const [deployer, recipient, spender] = accounts;
  
  beforeEach(async function () {
    const name = "Reverse";
    const symbol = "REV";
    const initialSupply = 200000000;
    const tokenDecimals = 18;
    this.token = await Reverse.new(name, symbol, initialSupply, tokenDecimals, { from: deployer });
  });
  
  describe('Token Info', function () {
    it('has correct name', async function () {
      expect(await this.token.name()).to.equal('Reverse');
    });

    it('has correct symbol', async function () {
      expect(await this.token.symbol()).to.equal('REV');
    });

    it('has correct decimals', async function () {
      expect(await this.token.decimals()).to.be.bignumber.equal('18');
    });

    it('has correct total supply', async function () {
      const expectedSupply = new BN('200000000').mul(new BN('10').pow(new BN('18')));
      expect(await this.token.totalSupply()).to.be.bignumber.equal(expectedSupply);
    });

    it('assigns the entire supply to the deployer', async function () {
      const balance = await this.token.balanceOf(deployer);
      const totalSupply = await this.token.totalSupply();
      expect(balance).to.be.bignumber.equal(totalSupply);
    });
  });
  
  describe('ERC20 functionality', function () {
    describe('transfer', function () {
      it('allows token transfers', async function () {
        const amount = new BN('1000');
        await this.token.transfer(recipient, amount, { from: deployer });
        
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
      });
    });
    
    describe('approve and transferFrom', function () {
      it('allows approval and transferFrom', async function () {
        const amount = new BN('1000');
        await this.token.approve(spender, amount, { from: deployer });
        await this.token.transferFrom(deployer, recipient, amount, { from: spender });
        
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
      });
    });
  });
  
  describe('ERC20Burnable', function () {
    it('allows token burning', async function () {
      const initialSupply = await this.token.totalSupply();
      const burnAmount = new BN('1000');
      
      await this.token.burn(burnAmount, { from: deployer });
      
      const finalSupply = await this.token.totalSupply();
      expect(finalSupply).to.be.bignumber.equal(initialSupply.sub(burnAmount));
    });
  });
});