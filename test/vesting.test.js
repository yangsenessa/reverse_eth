const { BN, expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const ReverseVesting = artifacts.require('ReverseVesting');
const Reverse = artifacts.require('Reverse');

contract('ReverseVesting', function (accounts) {
    const [deployer, beneficiary, otherAccount] = accounts;
    const startTime = Math.floor(Date.now() / 1000)  + 60; // starts 1 minute from now
    const duration = 1000; // 1000 seconds

    beforeEach(async function () {
        this.token = await Reverse.new(
            "Reverse",
            "REV",
            200000000,
            18,
            { from: deployer }
        );
        this.vesting = await ReverseVesting.new(
            beneficiary,
            startTime,
            duration,
            { from: deployer }
        );
        console.log("Reverse token address:", this.token.address);
        console.log("ReverseVesting contract address:", this.vesting.address);

        // Fund the vesting contract
        this.vestingAmount = new BN('1000000').mul(new BN('10').pow(new BN('18')));
        await this.token.transfer(this.vesting.address, this.vestingAmount, { from: deployer });
    });

    describe('Constructor', function () {
        it('sets the beneficiary correctly', async function () {
            expect(await this.vesting.owner()).to.equal(beneficiary);
        });

        it('sets the start timestamp correctly', async function () {
            expect(await this.vesting.start()).to.be.bignumber.equal(new BN(startTime));
        });

        it('sets the duration correctly', async function () {
            expect(await this.vesting.duration()).to.be.bignumber.equal(new BN(duration));
        });

        it('rejects zero address beneficiary', async function () {
            await expectRevert(
                ReverseVesting.new('0x0000000000000000000000000000000000000000', startTime, duration),
                'Beneficiary cannot be zero address'
            );
        });
    });
    

    describe('Token Release', function () {
        it('should not release tokens before start time', async function () {
            await expectRevert(
                this.vesting.release(this.token.address, { from: beneficiary }),
                'SafeERC20: low-level call failed'
            );
        });

        it('should release tokens after vesting has started', async function () {
            const midPoint = startTime + duration / 2;
            //await time.increaseTo(new BN(midPoint.toString()));

            const initialBalance = await this.token.balanceOf(beneficiary);
            await this.vesting.release(this.token.address, { from: beneficiary });
            const finalBalance = await this.token.balanceOf(beneficiary);

            const expectedReleased = this.vestingAmount.div(new BN('2'));
            expect(finalBalance.sub(initialBalance)).to.be.bignumber.closeTo(
                expectedReleased,
                expectedReleased.div(new BN('100'))
            );
        });

        it('should release remaining tokens after vesting period', async function () {
            // Release half first
            const midPoint = startTime + duration / 2;
            //await time.increaseTo(midPoint);
            await this.vesting.release(this.token.address, { from: beneficiary });

            // Now go to end and release remainder
            const endTime = startTime + duration + 10;
            await time.increaseTo(endTime);

            const balanceBeforeFinalRelease = await this.token.balanceOf(beneficiary);
            await this.vesting.release(this.token.address, { from: beneficiary });
            const finalBalance = await this.token.balanceOf(beneficiary);

            const expectedRemainder = this.vestingAmount.div(new BN('2'));
            expect(finalBalance.sub(balanceBeforeFinalRelease)).to.be.bignumber.closeTo(
                expectedRemainder,
                expectedRemainder.div(new BN('100'))
            );
        });
    });
    describe('Vesting Schedule', function () {
        it('should vest tokens linearly', async function () {
            // Check at 25%, 50%, and 75% of vesting period
            const checkpoints = [0.25, 0.5, 0.75];
            
            for (const checkpoint of checkpoints) {
                const checkpointTime = startTime + Math.floor(duration * checkpoint);
                //await time.increaseTo(checkpointTime);
                
                const vestedAmount = await this.vesting.vestedAmount(
                    this.token.address, 
                    //Math.floor(checkpoint * duration) + startTime
                    checkpointTime
                );
                
                const expectedVested = this.vestingAmount.mul(new BN(Math.floor(checkpoint * 100))).div(new BN('100'));
                expect(vestedAmount).to.be.bignumber.closeTo(
                    expectedVested,
                    expectedVested.div(new BN('100'))
                );
            }
        });
        
        it('should vest all tokens after duration', async function () {
            const endTime = startTime + duration + 1;
            //await time.increaseTo(endTime);
            
            const vestedAmount = await this.vesting.vestedAmount(this.token.address, endTime);
            expect(vestedAmount).to.be.bignumber.equal(this.vestingAmount);
        });
        
        it('should not vest any tokens before start time', async function () {
            const beforeStartTime = startTime - 100;
            //await time.increaseTo(beforeStartTime);
            
            const vestedAmount = await this.vesting.vestedAmount(this.token.address, beforeStartTime);
            expect(vestedAmount).to.be.bignumber.equal(new BN('0'));
        });
        
        it('should track remaining vesting amount correctly', async function () {
            // Go to middle of vesting period and release
            const midPoint = startTime + Math.floor(duration / 2);
            //await time.increaseTo(midPoint);
            
            await this.vesting.release(this.token.address, { from: beneficiary });
            
            // Check remaining vestable amount
            const released = await this.vesting.released(this.token.address);
            const vestedAmount = await this.vesting.vestedAmount(this.token.address, midPoint);
            
            expect(released).to.be.bignumber.equal(vestedAmount);
            expect(this.vestingAmount.sub(released)).to.be.bignumber.closeTo(
                this.vestingAmount.div(new BN('2')),
                this.vestingAmount.div(new BN('100'))
            );
        });
    });
    
    describe('Force Release', function () {
        it('only owner can force release', async function () {
            await time.increaseTo(startTime + duration / 2);

            await expectRevert(
                this.vesting.forceRelease(this.token.address, { from: otherAccount }),
                'Ownable: caller is not the owner'
            );
        });

        it('owner can force release tokens', async function () {
            //await time.increaseTo(startTime + duration / 2);

            const initialBalance = await this.token.balanceOf(beneficiary);
            await this.vesting.forceRelease(this.token.address, { from: deployer });
            const finalBalance = await this.token.balanceOf(beneficiary);

            const expectedReleased = this.vestingAmount.div(new BN('2'));
            expect(finalBalance.sub(initialBalance)).to.be.bignumber.closeTo(
                expectedReleased,
                expectedReleased.div(new BN('100'))
            );
        });
    });

    describe('Recover ERC20', function () {
        it('only owner can recover tokens', async function () {
            // Send other tokens to the vesting contract
            const extraTokens = new BN('10000').mul(new BN('10').pow(new BN('18')));
            await this.token.transfer(this.vesting.address, extraTokens, { from: deployer });

            await expectRevert(
                this.vesting.recoverERC20(this.token.address, extraTokens, { from: otherAccount }),
                'Ownable: caller is not the owner'
            );
        });

        it('cannot recover vested tokens', async function () {
            await expectRevert(
                this.vesting.recoverERC20(this.token.address, this.vestingAmount, { from: deployer }),
                'Cannot recover vested tokens'
            );
        });

        it('can recover non-vested tokens', async function () {
            // Send extra tokens to the vesting contract
            const extraTokens = new BN('10000').mul(new BN('10').pow(new BN('18')));
            await this.token.transfer(this.vesting.address, extraTokens, { from: deployer });

            const initialBalance = await this.token.balanceOf(deployer);
            console.log("can recover non-vested tokens-Initial balance:", initialBalance.toString());
            await this.vesting.recoverERC20(this.token.address, extraTokens, { from: deployer });
            const finalBalance = await this.token.balanceOf(deployer);
            
            expect(finalBalance.sub(initialBalance)).to.be.bignumber.equal(extraTokens);
        });

        it('can recover tokens after partial vesting', async function () {
            // Go to middle of vesting period
            //await time.increaseTo(startTime + duration / 2);

            // Send extra tokens
            const extraTokens = new BN('10000').mul(new BN('10').pow(new BN('18')));
            await this.token.transfer(this.vesting.address, extraTokens, { from: deployer });

            const initialBalance = await this.token.balanceOf(deployer);
            await this.vesting.recoverERC20(this.token.address, extraTokens, { from: deployer });
            const finalBalance = await this.token.balanceOf(deployer);

            expect(finalBalance.sub(initialBalance)).to.be.bignumber.equal(extraTokens);
        });
    });
});
