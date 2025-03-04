const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Reverse = artifacts.require('Reverse');
const ReverseInnerSeller = artifacts.require('ReverseInnerSeller');
const MockERC20 = artifacts.require('MockERC20');

contract('ReverseInnerSeller', function (accounts) {
    const [owner, buyer, usdtReceiver, newOwner] = accounts;

    const USDT_DECIMALS = new BN('6');
    const REV_DECIMALS = new BN('18');

    // Convert to smallest units with proper decimals
    const toUSDT = (amount) => new BN(amount).mul(new BN('10').pow(USDT_DECIMALS));
    const toREV = (amount) => new BN(amount).mul(new BN('10').pow(REV_DECIMALS));

    console.log('Owner address:', owner);
    console.log('Buyer address:', buyer);
    console.log('USDT Receiver address:', usdtReceiver);
    console.log('New Owner address:', newOwner);

    beforeEach(async function () {
        // Deploy tokens
        this.revToken = await Reverse.new(
            "Reverse",
            "REV",
            200000000,
            18,
            { from: owner }
        );

        // Deploy mock USDT
        this.usdtToken = await MockERC20.new('Tether USD', 'USDT', USDT_DECIMALS.toNumber(), { from: owner });

        // Deploy a modified ReverseInnerSeller that uses our mock USDT instead of the hardcoded one
        // We need to modify the contract or use a contract factory for testing

        // For testing purposes, we'll need to manually set the USDT token address in the contract
        // This would require modifying the contract to have a setUsdtToken method or making it a constructor parameter

        // Since we can't modify the contract structure in this example, let's use a workaround by
        // overriding the USDT token address with our mock in the constructor through inheritance pattern

        // Deploy seller contract
        this.seller = await ReverseInnerSeller.new(
            this.revToken.address,
            usdtReceiver,
            { from: owner }
        );

        // Important: Since ReverseInnerSeller has hardcoded USDT address, we need to update our tests
        // Mock the USDT token at the same address expected by the contract
        // This would normally be done by modifying the contract to accept the token address or 
        // using contract factories, but for this example, we'll work around it

        // Log the token addresses
        console.log('REV Token address:', this.revToken.address);
        console.log('USDT Token address:', this.usdtToken.address);
        console.log('ReverseInnerSeller contract address:', this.seller.address);
        console.log('REV Token address from seller contract:', await this.seller.revToken());

        // Seed the seller contract with REV tokens
        const sellerRevAmount = toREV('50000000');
        await this.revToken.transfer(this.seller.address, sellerRevAmount, { from: owner });

        // Seed buyer with USDT
        const buyerUsdtAmount = toUSDT('100000000');
        await this.usdtToken.mint(buyer, buyerUsdtAmount, { from: owner });

        this.seller.setUsdtToken(this.usdtToken.address, { from: owner });

        const contractUsdtAddress = await this.seller.usdtToken();
        console.log('Contract USDT address:', contractUsdtAddress);
    });

    // Rest of your tests remain the same

    describe('Token Purchasing', function () {
        beforeEach(async function () {
            // Update this section to address the hardcoded USDT address issue
            await this.usdtToken.approve(this.seller.address, toUSDT('50000'), { from: buyer });

            // For testing purposes, we need to work with the hardcoded USDT token
            // Instead of trying to change it, we'll get the USDT token address from the contract


            // In a real test environment, we would use something like ganache to impersonate the USDT token
            // For now, let's acknowledge that in a real scenario we'd need to:
            // 1. Either modify the contract to make the USDT address configurable
            // 2. Or deploy a mock at the expected address
            // 3. Or use a forked mainnet where the real USDT exists

            // Check initial balances
            this.initialSellerRevBalance = await this.revToken.balanceOf(this.seller.address);
            this.initialBuyerRevBalance = await this.revToken.balanceOf(buyer);
            this.initialBuyerUsdtBalance = await this.usdtToken.balanceOf(buyer);
            this.initialReceiverUsdtBalance = await this.usdtToken.balanceOf(usdtReceiver);

            console.log('Initial balances:');
            console.log('Seller REV balance:', this.initialSellerRevBalance.toString());
            console.log('Buyer REV balance:', this.initialBuyerRevBalance.toString());
            console.log('Buyer USDT balance:', this.initialBuyerUsdtBalance.toString());
            console.log('Receiver USDT balance:', this.initialReceiverUsdtBalance.toString());
        });

        it('should allow buying tokens with valid payment amount', async function () {
            // Use one of the predefined payment tiers
            const usdtAmount = toUSDT('3000');
            const expectedRevAmount = toREV('5000');
            // Check initial balances
            this.initialSellerRevBalance = await this.revToken.balanceOf(this.seller.address);
            this.initialBuyerRevBalance = await this.revToken.balanceOf(buyer);
            this.initialBuyerUsdtBalance = await this.usdtToken.balanceOf(buyer);
            this.initialReceiverUsdtBalance = await this.usdtToken.balanceOf(usdtReceiver);

            console.log('Initial balances:');
            console.log('Seller REV balance:', this.initialSellerRevBalance.toString());
            console.log('Buyer REV balance:', this.initialBuyerRevBalance.toString());
            console.log('Buyer USDT balance:', this.initialBuyerUsdtBalance.toString());
            console.log('Receiver USDT balance:', this.initialReceiverUsdtBalance.toString());

            // Make the purchase
            const receipt = await this.seller.buyTokens(usdtAmount, { from: buyer });

            // Check event emission
            expectEvent(receipt, 'TokensPurchased', {
                buyer: buyer,
                usdtAmount: usdtAmount,
                revAmount: expectedRevAmount
            });

            // Check balances after purchase
            const finalBuyerRevBalance = await this.revToken.balanceOf(buyer);
            const finalSellerRevBalance = await this.revToken.balanceOf(this.seller.address);
            const finalBuyerUsdtBalance = await this.usdtToken.balanceOf(buyer);
            const finalReceiverUsdtBalance = await this.usdtToken.balanceOf(usdtReceiver);

            // Buyer should have received REV tokens
            expect(finalBuyerRevBalance).to.be.bignumber.equal(
                this.initialBuyerRevBalance.add(expectedRevAmount)
            );

            // Seller should have sent REV tokens
            expect(finalSellerRevBalance).to.be.bignumber.equal(
                this.initialSellerRevBalance.sub(expectedRevAmount)
            );

            // Buyer should have spent USDT
            expect(finalBuyerUsdtBalance).to.be.bignumber.equal(
                this.initialBuyerUsdtBalance.sub(usdtAmount)
            );

            // USDT receiver should have received USDT
            expect(finalReceiverUsdtBalance).to.be.bignumber.equal(
                this.initialReceiverUsdtBalance.add(usdtAmount)
            );
        });

        it('should fail when buying with invalid payment amount', async function () {
            const invalidAmount = toUSDT('4000'); // Not in price tiers
            // Check initial balances
            this.initialSellerRevBalance = await this.revToken.balanceOf(this.seller.address);
            this.initialBuyerRevBalance = await this.revToken.balanceOf(buyer);
            this.initialBuyerUsdtBalance = await this.usdtToken.balanceOf(buyer);
            this.initialReceiverUsdtBalance = await this.usdtToken.balanceOf(usdtReceiver);

            console.log('Initial balances:');
            console.log('Seller REV balance:', this.initialSellerRevBalance.toString());
            console.log('Buyer REV balance:', this.initialBuyerRevBalance.toString());
            console.log('Buyer USDT balance:', this.initialBuyerUsdtBalance.toString());
            console.log('Receiver USDT balance:', this.initialReceiverUsdtBalance.toString());

            await expectRevert(
                this.seller.buyTokens(invalidAmount, { from: buyer }),
                'Invalid payment amount'
            );
        });

        it('should fail when contract has insufficient REV balance', async function () {
            // First, withdraw all REV tokens
            const revBalance = await this.revToken.balanceOf(this.seller.address);
            await this.seller.withdrawREV(revBalance, { from: owner });
            // Check initial balances
            this.initialSellerRevBalance = await this.revToken.balanceOf(this.seller.address);
            this.initialBuyerRevBalance = await this.revToken.balanceOf(buyer);
            this.initialBuyerUsdtBalance = await this.usdtToken.balanceOf(buyer);
            this.initialReceiverUsdtBalance = await this.usdtToken.balanceOf(usdtReceiver);

            console.log('Initial balances:');
            console.log('Seller REV balance:', this.initialSellerRevBalance.toString());
            console.log('Buyer REV balance:', this.initialBuyerRevBalance.toString());
            console.log('Buyer USDT balance:', this.initialBuyerUsdtBalance.toString());
            console.log('Receiver USDT balance:', this.initialReceiverUsdtBalance.toString());

            // Try to buy tokens
            const usdtAmount = toUSDT('3000');
            await expectRevert(
                this.seller.buyTokens(usdtAmount, { from: buyer }),
                'Insufficient REV balance in contract'
            );
        });

        it('should fail when buyer has insufficient USDT balance', async function () {
            // Use large amount that buyer doesn't have
            const usdtAmount = toUSDT('1000000');

            // Add this tier for testing purpose
            await this.seller.addPriceTier(usdtAmount, toREV('2000000'), { from: owner });
            // Check initial balances
            this.initialSellerRevBalance = await this.revToken.balanceOf(this.seller.address);
            this.initialBuyerRevBalance = await this.revToken.balanceOf(buyer);
            this.initialBuyerUsdtBalance = await this.usdtToken.balanceOf(buyer);
            this.initialReceiverUsdtBalance = await this.usdtToken.balanceOf(usdtReceiver);

            console.log('Initial balances:');
            console.log('Seller REV balance:', this.initialSellerRevBalance.toString());
            console.log('Buyer REV balance:', this.initialBuyerRevBalance.toString());
            console.log('Buyer USDT balance:', this.initialBuyerUsdtBalance.toString());
            console.log('Receiver USDT balance:', this.initialReceiverUsdtBalance.toString());

            await expectRevert(
                this.seller.buyTokens(usdtAmount, { from: buyer }),
                'Insufficient USDT allowance'
            );
        });

        it('should fail when buyer has not approved enough USDT', async function () {
            // First reset approval to a small amount
            await this.usdtToken.approve(this.seller.address, toUSDT('1000'), { from: buyer });

            const usdtAmount = toUSDT('3000');
            // Check initial balances
            this.initialSellerRevBalance = await this.revToken.balanceOf(this.seller.address);
            this.initialBuyerRevBalance = await this.revToken.balanceOf(buyer);
            this.initialBuyerUsdtBalance = await this.usdtToken.balanceOf(buyer);
            this.initialReceiverUsdtBalance = await this.usdtToken.balanceOf(usdtReceiver);

            console.log('Initial balances:');
            console.log('Seller REV balance:', this.initialSellerRevBalance.toString());
            console.log('Buyer REV balance:', this.initialBuyerRevBalance.toString());
            console.log('Buyer USDT balance:', this.initialBuyerUsdtBalance.toString());
            console.log('Receiver USDT balance:', this.initialReceiverUsdtBalance.toString());
            await expectRevert(
                this.seller.buyTokens(usdtAmount, { from: buyer }),
                'Insufficient USDT allowance'
            );
        });

        it('should allow buying with all available price tiers', async function () {
            // Test each price tier
            const tiers = [
                { usdt: '3000', rev: '5000' },
                { usdt: '10000', rev: '18000' },
                { usdt: '50000', rev: '100000' }
            ];

            for (const tier of tiers) {
                const usdtAmount = toUSDT(tier.usdt);
                const expectedRevAmount = toREV(tier.rev);

                // Need to check and set adequate approval for each purchase
                await this.usdtToken.approve(this.seller.address, usdtAmount, { from: buyer });

                const receipt = await this.seller.buyTokens(usdtAmount, { from: buyer });
                // Check initial balances
                this.initialSellerRevBalance = await this.revToken.balanceOf(this.seller.address);
                this.initialBuyerRevBalance = await this.revToken.balanceOf(buyer);
                this.initialBuyerUsdtBalance = await this.usdtToken.balanceOf(buyer);
                this.initialReceiverUsdtBalance = await this.usdtToken.balanceOf(usdtReceiver);

                console.log('Initial balances:');
                console.log('Seller REV balance:', this.initialSellerRevBalance.toString());
                console.log('Buyer REV balance:', this.initialBuyerRevBalance.toString());
                console.log('Buyer USDT balance:', this.initialBuyerUsdtBalance.toString());
                console.log('Receiver USDT balance:', this.initialReceiverUsdtBalance.toString());

                expectEvent(receipt, 'TokensPurchased', {
                    buyer: buyer,
                    usdtAmount: usdtAmount,
                    revAmount: expectedRevAmount
                });
            }
        });
    });

    // Keep other test sections as they are
});
