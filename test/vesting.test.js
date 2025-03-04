const { BN, expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const ReverseVesting = artifacts.require('ReverseVesting');
const Reverse = artifacts.require('Reverse');

contract('ReverseVesting', function (accounts) {
    const [deployer, beneficiary, otherAccount] = accounts;
    const startTime = Math.floor(Date.now() / 1000) + 60; // starts 1 minute from now
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
        
        // Fund the vesting contract
        this.vestingAmount = new BN('1000000').mul(new BN('10').pow(new BN('18')));
        await this.token.transfer(this.vesting.address, this.vestingAmount, { from: deployer });
    });
    
    describe('Constructor', function () {
        it('sets the beneficiary correctly', async function () {
            expect(await this.vesting.beneficiary()).to.equal(beneficiary);
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
        
        it('rejects zero duration', async function () {
            await expectRevert(
                ReverseVesting.new(beneficiary, startTime, 0),
                'Vesting duration must be greater than 0'
            );
        });
    });
    
    describe('Vesting Schedule', function () {
                it('returns zero vested amount before start time', async function () {
                    const vestedAmount = await this.vesting.vestedAmount(
                        this.token.address, 
                        startTime - 10
                    );
                    expect(vestedAmount).to.be.bignumber.equal(new BN('0'));
                });
        
                it('returns partial vested amount during vesting period', async function () {
                    const halfTime = startTime + duration / 2;
                    await time.increaseTo(halfTime);
                    
                    const vestedAmount = await this.vesting.vestedAmount(
                        this.token.address, 
                        halfTime
                    );
                    
                    // Should be approximately half of the vesting amount
                    const expectedVestedAmount = this.vestingAmount.div(new BN('2'));
                    expect(vestedAmount).to.be.bignumber.closeTo(expectedVestedAmount, expectedVestedAmount.div(new BN('100')));
                });
                
                it('returns full vested amount after vesting period', async function () {
                    const endTime = startTime + duration + 10; // some time after the end
                    await time.increaseTo(endTime);
                    
                    const vestedAmount = await this.vesting.vestedAmount(
                        this.token.address, 
                        endTime
                    );
                    
                    expect(vestedAmount).to.be.bignumber.equal(this.vestingAmount);
                });
            });
        });
