const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Reverse = artifacts.require('Reverse');
const ReverseInnerSeller = artifacts.require('ReverseInnerSeller');
const MockERC20 = artifacts.require('MockERC20'); // Assuming you have a mock for USDT

contract('ReverseInnerSeller', function (accounts) {
    const [owner, buyer, usdtReceiver, newOwner] = accounts;
    
    const USDT_DECIMALS = new BN('6');
    const REV_DECIMALS = new BN('18');
    
    // Convert to smallest units with proper decimals
    const toUSDT = (amount) => new BN(amount).mul(new BN('10').pow(USDT_DECIMALS));
    const toREV = (amount) => new BN(amount).mul(new BN('10').pow(REV_DECIMALS));
    // Log the account addresses
    console.log('Owner address:', owner);
    console.log('Buyer address:', buyer);
    console.log('USDT Receiver address:', usdtReceiver);
    console.log('New Owner address:', newOwner);
    
    beforeEach(async function () {
        // Deploy tokens
        this.revToken = await Reverse.new({ from: owner });
        this.usdtToken = await MockERC20.new('Tether USD', 'USDT', USDT_DECIMALS.toNumber(), { from: owner });
        
        // Deploy seller contract
        this.seller = await ReverseInnerSeller.new(
            this.revToken.address,
            usdtReceiver, // Corrected parameter
            { from: owner }
        );
        // Log the token addresses
        console.log('REV Token address:', this.revToken.address);
        console.log('USDT Token address:', this.usdtToken.address);
        console.log('ReverseInnerSeller contract address:', this.seller.address);
        console.log('REV Token address from seller contract:', await this.seller.revToken());
        
        // Seed the seller contract with REV tokens
        const sellerRevAmount = toREV('500000');
        await this.revToken.transfer(this.seller.address, sellerRevAmount, { from: owner });
        
        // Seed buyer with USDT
        const buyerUsdtAmount = toUSDT('100000');
        await this.usdtToken.transfer(buyer, buyerUsdtAmount, { from: owner });
    });
    
    describe('Initialization', function () {

        it('has correct USDT receiver address', async function () {
            expect(await this.seller.usdtReceiver()).to.equal(usdtReceiver);
        });

        it('has correct REV token address!!', async function () {
            expect(await this.seller.revToken.address).to.equal(this.revToken.address);
        });
  
        it('has correct initial price tiers', async function () {
            // Check price tier 1: 3,000 USDT = 5,000 REV
            expect(await this.seller.priceTiers(toUSDT('3000'))).to.be.bignumber.equal(toREV('5000'));
            
            // Check price tier 2: 10,000 USDT = 18,000 REV
            expect(await this.seller.priceTiers(toUSDT('10000'))).to.be.bignumber.equal(toREV('18000'));
            
            // Check price tier 3: 50,000 USDT = 100,000 REV
            expect(await this.seller.priceTiers(toUSDT('50000'))).to.be.bignumber.equal(toREV('100000'));
            
            // Check valid payment amounts count
            expect(await this.seller.getValidPaymentAmountsCount()).to.be.bignumber.equal('3');
        });
    });
    
    describe('Price Tier Management', function () {
        it('allows owner to add price tiers', async function () {
            await this.seller.addPriceTier(toUSDT('5000'), toREV('9000'), { from: owner });
            
            expect(await this.seller.priceTiers(toUSDT('5000'))).to.be.bignumber.equal(toREV('9000'));
            expect(await this.seller.getValidPaymentAmountsCount()).to.be.bignumber.equal('4');
            
            const receipt = await this.seller.addPriceTier(toUSDT('20000'), toREV('40000'), { from: owner });
            expectEvent(receipt, 'PriceTierAdded', {
                usdtAmount: toUSDT('20000'),
                revAmount: toREV('40000')
            });
        });
        
        it('prevents non-owners from adding price tiers', async function () {
            await expectRevert(
                this.seller.addPriceTier(toUSDT('5000'), toREV('9000'), { from: buyer }),
                'Ownable: caller is not the owner'
            );
        });
        
        it('prevents adding duplicate price tiers', async function () {
            await expectRevert(
                this.seller.addPriceTier(toUSDT('3000'), toREV('6000'), { from: owner }),
                'Price tier already exists'
            );
        });
        
        it('allows owner to remove price tiers', async function () {
            const receipt = await this.seller.removePriceTier(toUSDT('3000'), { from: owner });
            expectEvent(receipt, 'PriceTierRemoved', { usdtAmount: toUSDT('3000') });
            
            expect(await this.seller.getValidPaymentAmountsCount()).to.be.bignumber.equal('2');
            expect(await this.seller.priceTiers(toUSDT('3000'))).to.be.bignumber.equal('0');
        });
        
        it('prevents removing non-existent price tiers', async function () {
            await expectRevert(
                this.seller.removePriceTier(toUSDT('7000'), { from: owner }),
                'Price tier does not exist'
            );
        });
    });
    
    describe('Token Purchasing', function () {
        beforeEach(async function () {
            // Approve seller to spend buyer's USDT
            await this.usdtToken.approve(this.seller.address, toUSDT('50000'), { from: buyer });
        });
        
        it('allows buying tokens with a valid payment amount', async function () {
            const usdtAmount = toUSDT('3000');
            const expectedRevAmount = toREV('5000');
            
            const initialBuyerRevBalance = await this.revToken.balanceOf(buyer);
            const initialUsdtReceiverBalance = await this.usdtToken.balanceOf(usdtReceiver);
            
            const receipt = await this.seller.buyTokens(usdtAmount, { from: buyer });
            
            // Check event was emitted
            expectEvent(receipt, 'TokensPurchased', {
                buyer: buyer,
                usdtAmount: usdtAmount,
                revAmount: expectedRevAmount
            });
            
            // Check REV tokens were transferred to buyer
            const finalBuyerRevBalance = await this.revToken.balanceOf(buyer);
            expect(finalBuyerRevBalance.sub(initialBuyerRevBalance)).to.be.bignumber.equal(expectedRevAmount);
            
            // Check USDT was transferred to receiver
            const finalUsdtReceiverBalance = await this.usdtToken.balanceOf(usdtReceiver);
            expect(finalUsdtReceiverBalance.sub(initialUsdtReceiverBalance)).to.be.bignumber.equal(usdtAmount);
        });
        
        it('reverts when trying to buy with invalid payment amount', async function () {
            await expectRevert(
                this.seller.buyTokens(toUSDT('2000'), { from: buyer }),
                'Invalid payment amount'
            );
        });
        
        it('reverts when buyer has insufficient USDT balance', async function () {
            // Transfer all USDT from buyer
            const buyerBalance = await this.usdtToken.balanceOf(buyer);
            await this.usdtToken.transfer(owner, buyerBalance, { from: buyer });
            
            await expectRevert(
                this.seller.buyTokens(toUSDT('3000'), { from: buyer }),
                'Insufficient USDT balance'
            );
        });
        
        it('reverts when buyer has insufficient USDT allowance', async function () {
            // Reset allowance
            await this.usdtToken.approve(this.seller.address, 0, { from: buyer });
            
            await expectRevert(
                this.seller.buyTokens(toUSDT('3000'), { from: buyer }),
                'Insufficient USDT allowance'
            );
        });
        
        it('reverts when contract has insufficient REV balance', async function () {
            // Withdraw all REV from seller contract
            const sellerBalance = await this.revToken.balanceOf(this.seller.address);
            await this.seller.withdrawREV(sellerBalance, { from: owner });
            
            await expectRevert(
                this.seller.buyTokens(toUSDT('3000'), { from: buyer }),
                'Insufficient REV balance in contract'
            );
        });
    });
    
    describe('Withdrawals', function () {
        it('allows owner to withdraw REV tokens', async function () {
            const withdrawAmount = toREV('1000');
            const initialOwnerBalance = await this.revToken.balanceOf(owner);
            
            await this.seller.withdrawREV(withdrawAmount, { from: owner });
            
            const finalOwnerBalance = await this.revToken.balanceOf(owner);
            expect(finalOwnerBalance.sub(initialOwnerBalance)).to.be.bignumber.equal(withdrawAmount);
        });
        
        it('allows owner to withdraw USDT tokens', async function () {
            // First, send some USDT to the contract
            const usdtAmount = toUSDT('500');
            await this.usdtToken.transfer(this.seller.address, usdtAmount, { from: owner });
            
            const initialOwnerBalance = await this.usdtToken.balanceOf(owner);
            
            await this.seller.withdrawUSDT(usdtAmount, { from: owner });
            
            const finalOwnerBalance = await this.usdtToken.balanceOf(owner);
            expect(finalOwnerBalance.sub(initialOwnerBalance)).to.be.bignumber.equal(usdtAmount);
        });
        
        it('prevents non-owners from withdrawing', async function () {
            await expectRevert(
                this.seller.withdrawREV(toREV('1000'), { from: buyer }),
                'Ownable: caller is not the owner'
            );
            
            await expectRevert(
                this.seller.withdrawUSDT(toUSDT('100'), { from: buyer }),
                'Ownable: caller is not the owner'
            );
        });
    });
    
    describe('Utility functions', function () {
        it('correctly validates payment amounts', async function () {
            expect(await this.seller.isValidPaymentAmount(toUSDT('3000'))).to.equal(true);
            expect(await this.seller.isValidPaymentAmount(toUSDT('4000'))).to.equal(false);
        });
        
        it('correctly returns REV amount for USDT payment', async function () {
            expect(await this.seller.getRevAmount(toUSDT('10000'))).to.be.bignumber.equal(toREV('18000'));
            
            await expectRevert(
                this.seller.getRevAmount(toUSDT('1234')),
                'Invalid payment amount'
            );
        });
        
        it('rejects ETH sent to the contract', async function () {
            await expectRevert.unspecified(
                web3.eth.sendTransaction({ from: buyer, to: this.seller.address, value: web3.utils.toWei('1', 'ether') })
            );
        });
    });
});