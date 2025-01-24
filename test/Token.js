const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { signERC2612Permit, signERC3009TWA, signForward} = require('../utils/signer');

const OWNER = "0x0000000000000000000000000000000000000000000000000000000000000000";
const ADMIN = ethers.keccak256(ethers.toUtf8Bytes('ADMIN'));
const MASTER_MINTER = ethers.keccak256(ethers.toUtf8Bytes('MASTER_MINTER'));
const MINTER = ethers.keccak256(ethers.toUtf8Bytes('MINTER_ROLE'));
const CONTROLLER = ethers.keccak256(ethers.toUtf8Bytes('CONTROLLER'));
const FEE_RATIO = 10000n;


describe('EURFToken', function () {
    let eurftoken;
    let forwarder;

    let owner;
    let newOwner;

    let admin;
    let newAdmin;

    let masterMinter;
    let newMasterMinter;
    let minter;

    let controler1;
    let controler2;

    let feesFaucet;

    let bob;
    let alice;
    let malory;

    let forwardOperator;

    let provider;
    let interface;

    beforeEach(async function () {
        [
            owner,
            newOwner,
            admin,
            newAdmin,
            masterMinter,
            newMasterMinter,
            minter,
            controler1,
            controler2,
            feesFaucet,
            bob,
            alice,
            malory,
            forwardOperator
        ] = await ethers.getSigners();

        provider = await ethers.provider;
    
        const EURFToken = await ethers.getContractFactory('EURFToken');
        interface = EURFToken.interface;

        eurftoken = await upgrades.deployProxy(EURFToken, [], { kind: 'uups', initializer: 'initialize'});

        await eurftoken.connect(owner).setAdministrator(admin.address);
    });

    describe('DEPLOYMENT', function () {
        it('should have a name', async function () {
            expect(await eurftoken.name()).to.equal('EURF');
        });
    
        it('should have a symbol', async function () {
            expect(await eurftoken.symbol()).to.equal('EURF');
        });
    });

    describe('ROLES', function () {
        describe('OWNER', function () {
            it('sets new Owner', async function () {
                expect(await eurftoken.hasRole(OWNER, owner)).to.be.true;
                await eurftoken.connect(owner).setOwner(newOwner.address);
                expect(await eurftoken.hasRole(OWNER, newOwner)).to.be.true;
                expect(await eurftoken.hasRole(OWNER, owner)).to.be.false;
                await expect(eurftoken.connect(owner).setOwner(bob.address)).to.be.reverted;
                //await expect(eurftoken.connect(newOwner).setOwner(ethers.constants.AddressZero)).to.be.reverted;
                await eurftoken.connect(newOwner).setOwner(owner.address);
                expect(await eurftoken.hasRole(OWNER, owner)).to.be.true;
                expect(await eurftoken.hasRole(OWNER, newOwner)).to.be.false;
            });

            it('sets Administrator', async function () {
                await eurftoken.connect(owner).setAdministrator(newAdmin.address);
                expect(await eurftoken.hasRole(ADMIN, newAdmin)).to.be.true;
                expect(await eurftoken.hasRole(ADMIN, admin)).to.be.false;
            });

            it('should set master_minter', async function () {
                await eurftoken.connect(owner).setMasterMinter(masterMinter.address);
                expect(await eurftoken.hasRole(MASTER_MINTER, masterMinter.address)).to.be.true;
                //masterMinter tries to mint 1000 to alice
                await eurftoken.connect(masterMinter).mint(alice.address, 1000);
                expect(await eurftoken.balanceOf(alice.address)).to.equal(1000);
                //set newMasterMinter
                expect(await eurftoken.connect(owner).setMasterMinter(newMasterMinter.address)).to.emit(eurftoken, 'MinterAllowanceUpdated').withArgs(masterMinter.address, 0);
                expect(await eurftoken.hasRole(MASTER_MINTER, newMasterMinter.address)).to.be.true;
                expect(await eurftoken.hasRole(MASTER_MINTER, masterMinter.address)).to.be.false;
                //newMasterMinter tries to mint 1000 to bob
                await eurftoken.connect(newMasterMinter).mint(bob.address, 1000);
                expect(await eurftoken.balanceOf(bob.address)).to.equal(1000);
                //masterMinter tries to mint 1000 to alice
                await expect(eurftoken.connect(masterMinter).mint(alice.address, 1000)).to.be.reverted;
            });

            it('should add/remove controlers', async function () {
                await eurftoken.connect(owner).grantRole(CONTROLLER, controler1.address);
                expect(await eurftoken.hasRole(CONTROLLER, controler1.address)).to.be.true;
                await eurftoken.connect(owner).revokeRole(CONTROLLER, controler1.address);
                expect(await eurftoken.hasRole(CONTROLLER, controler1.address)).to.be.false;
            });

            it('allows upgrade', async function () {

            });

            it('should revert if the owner is not the caller', async function () {
                await expect(eurftoken.connect(bob).setOwner(newOwner.address)).to.be.reverted;
                await expect(eurftoken.connect(bob).setAdministrator(newAdmin.address)).to.be.reverted;
    
                await expect(eurftoken.connect(admin).setOwner(newOwner.address)).to.be.reverted;
                await expect(eurftoken.connect(admin).setAdministrator(newAdmin.address)).to.be.reverted;
            });
        });

        describe('ADMINISTRATOR', function () {
            beforeEach(async function () {
                await eurftoken.connect(owner).setMasterMinter(masterMinter.address);
                await eurftoken.connect(masterMinter).mint(bob.address, 1000);
                await eurftoken.connect(masterMinter).mint(alice.address, 1000);
            });

            it('should blacklist/unblacklist user', async function () {
                await eurftoken.connect(admin).blacklist(bob.address);
                expect(await eurftoken.isBlacklisted(bob.address)).to.be.true;
                //bob tries to transfer 50 to alice
                await expect(eurftoken.connect(bob).transfer(alice.address, 50)).to.be.reverted;
                //unblacklist bob
                await eurftoken.connect(admin).unblacklist(bob.address);
                expect(await eurftoken.isBlacklisted(bob.address)).to.be.false;
                //bob transfers 50 to alice
                await eurftoken.connect(bob).transfer(alice.address, 50);
                expect(await eurftoken.balanceOf(alice.address)).to.equal(1050);
            });

            it('should pause/unpause', async function () {
                await eurftoken.connect(admin).pause();
                expect(await eurftoken.paused()).to.be.true;
                await expect(eurftoken.connect(bob).transfer(alice.address, 50)).to.be.reverted;
                await eurftoken.connect(admin).unpause();
                expect(await eurftoken.paused()).to.be.false;
                await eurftoken.connect(bob).transfer(alice.address, 50);
                expect(await eurftoken.balanceOf(alice.address)).to.equal(1050);
            });

            it('should be able to force a transfer', async function () {
                await eurftoken.connect(admin).forceTransfer(bob.address, alice.address, 50);
                expect(await eurftoken.balanceOf(alice.address)).to.equal(1050);
            });

            it('should revert if the admin is not the caller', async function () {
                await expect(eurftoken.connect(bob).blacklist(bob.address)).to.be.reverted;
                await expect(eurftoken.connect(bob).unblacklist(bob.address)).to.be.reverted;
                await expect(eurftoken.connect(bob).pause()).to.be.reverted;
                await expect(eurftoken.connect(bob).unpause()).to.be.reverted;
                await expect(eurftoken.connect(bob).forceTransfer(bob.address, alice.address, 50)).to.be.reverted;
                await expect(eurftoken.connect(bob).setFeeFaucet(feesFaucet.address)).to.be.reverted;
                await expect(eurftoken.connect(bob).setTxFeeRate(1000)).to.be.reverted;
    
                await expect(eurftoken.connect(owner).blacklist(bob.address)).to.be.reverted;
                await expect(eurftoken.connect(owner).unblacklist(bob.address)).to.be.reverted;
                await expect(eurftoken.connect(owner).pause()).to.be.reverted;
                await expect(eurftoken.connect(owner).unpause()).to.be.reverted;
                await expect(eurftoken.connect(owner).forceTransfer(bob.address, alice.address, 50)).to.be.reverted;
                await expect(eurftoken.connect(owner).setFeeFaucet(feesFaucet.address)).to.be.reverted;
                await expect(eurftoken.connect(owner).setTxFeeRate(1000)).to.be.reverted;
            });

            describe('FEES', function () {
                it('should set fee Faucet', async function () {
                    expect(await eurftoken.connect(admin).setFeeFaucet(feesFaucet.address))
                        .to.emit(eurftoken, 'FeesFaucetUpdated')
                        .withArgs(feesFaucet.address);
                });

                it('should update tx fee rate', async function () {
                    await eurftoken.connect(admin).setFeeFaucet(feesFaucet.address)
                    var rate =  BigInt(1000);
                    await eurftoken.connect(admin).setTxFeeRate(rate);
                    expect(await eurftoken.getTxFeeRate()).to.equal(rate);
                    await eurftoken.connect(bob).transfer(alice.address, 100);
                    expect(await eurftoken.balanceOf(alice.address)).to.equal(1100);
                    expect(await eurftoken.balanceOf(feesFaucet.address)).to.equal(10);
                    expect(await eurftoken.balanceOf(bob.address)).to.equal(890);
                });
            });

            describe('FORWARDER', function () {
                it('should update gaseless basefee', async function () {
                    expect(await eurftoken.connect(admin).setGaslessBasefee(1000))
                    .to.emit(eurftoken, 'GaslessBaseFeeUpdated')
                    .withArgs(1000);
                });

                it('should set trusted forwarder', async function () {
                    const FORWARDER = await ethers.getContractFactory('Forwarder');
                    forwarder = await upgrades.deployProxy(FORWARDER, [eurftoken.target], { initializer: 'initialize'});
                    expect(await eurftoken.connect(admin).setTrustedForwarder(forwarder.target))
                    .to.emit(eurftoken, 'TrustedForwarderUpdated')
                    .withArgs(forwarder.target);
                    expect(await eurftoken.isTrustedForwarder(forwarder.target)).to.be.true;
                });
            });
        });

        describe('CONTROLLER', function () {
            beforeEach(async function () {
                await eurftoken.connect(owner).grantRole(CONTROLLER, controler1.address);
                await eurftoken.connect(owner).setMasterMinter(masterMinter.address);
            });

            it('should be able to switch _operating on and off', async function () {
                expect(await eurftoken.hasRole(CONTROLLER, controler1.address)).to.be.true;
                await eurftoken.connect(controler1).safetySwitch();
                var [operating, operator] = await eurftoken.isOperating();
                expect(operating).to.be.false;
                await eurftoken.connect(owner).safetySwitch();
                [operating, operator] = await eurftoken.isOperating();
                expect(operating).to.be.true;
            });

            it('should revert if caller is not a controler', async function () {
                await expect(eurftoken.connect(bob).safetySwitch()).to.be.reverted;
            });

            it('should revert if the controler is not the current operator', async function () {
                await eurftoken.connect(controler1).safetySwitch();
                await expect(eurftoken.connect(controler2).safetySwitch()).to.be.reverted;
            });

            it('owner should be able to switch back on the operations', async function () {
                await eurftoken.connect(controler1).safetySwitch();
                await eurftoken.connect(owner).safetySwitch();
                var [operating, operator] = await eurftoken.isOperating();
                expect(operating).to.be.true;
            });

            it('should allow minting if _operating is off', async function () {
                await eurftoken.connect(controler1).safetySwitch();
                await expect(eurftoken.connect(masterMinter).mint(bob.address, 1000)).to.be.reverted;
                await eurftoken.connect(controler1).safetySwitch();
                await eurftoken.connect(masterMinter).mint(bob.address, 1000);
                expect(await eurftoken.balanceOf(bob.address)).to.equal(1000);
            });

            it('should allow burning if _operating is off', async function () {
                await eurftoken.connect(masterMinter).addMinter(minter.address, 1000000);
                await eurftoken.connect(minter).mint(minter.address, 1000);
                await eurftoken.connect(controler1).safetySwitch();
                await expect(eurftoken.connect(minter).burn(1000)).to.be.reverted;
                await eurftoken.connect(controler1).safetySwitch();
                await eurftoken.connect(minter).burn(1000);
                expect(await eurftoken.balanceOf(minter.address)).to.equal(0);
            });
        });

        describe('MASTER MINTER', function () {
            beforeEach(async function () {
                await eurftoken.connect(owner).setMasterMinter(masterMinter.address);         
            });

            it('should add/remove minter', async function () {
                await eurftoken.connect(masterMinter).addMinter(minter.address, 1000000);
                expect(await eurftoken.hasRole(MINTER, minter.address)).to.be.true;

                await eurftoken.connect(masterMinter).removeMinter(minter.address);
                expect(await eurftoken.hasRole(MINTER, minter.address)).to.be.false;

            });

            it('should update minting allowance', async function () {
                await eurftoken.connect(masterMinter).addMinter(minter.address, 1000000);
                expect(await eurftoken.getMinterAllowance(minter.address)).to.equal(1000000);
                await eurftoken.connect(masterMinter).updateMintingAllowance(minter.address, 2000000);
                expect(await eurftoken.getMinterAllowance(minter.address)).to.equal(2000000);
            });

            it('should revert if the master_minter is not the caller', async function () {
                await expect(eurftoken.connect(bob).mint(bob.address, 1000)).to.be.reverted;
                await expect(eurftoken.connect(bob).burn(1000)).to.be.reverted;
                await expect(eurftoken.connect(bob).addMinter(bob.address, 1000)).to.be.reverted;
                await expect(eurftoken.connect(bob).removeMinter(bob.address)).to.be.reverted;
                await expect(eurftoken.connect(bob).updateMintingAllowance(bob.address, 1000)).to.be.reverted;
    
                await expect(eurftoken.connect(admin).mint(bob.address, 1000)).to.be.reverted;
                await expect(eurftoken.connect(admin).burn(1000)).to.be.reverted;
                await expect(eurftoken.connect(admin).addMinter(bob.address, 1000)).to.be.reverted;
                await expect(eurftoken.connect(admin).removeMinter(bob.address)).to.be.reverted;
                await expect(eurftoken.connect(admin).updateMintingAllowance(bob.address, 1000)).to.be.reverted;
    
                await expect(eurftoken.connect(owner).mint(bob.address, 1000)).to.be.reverted;
                await expect(eurftoken.connect(owner).burn(1000)).to.be.reverted;
                await expect(eurftoken.connect(owner).addMinter(bob.address, 1000)).to.be.reverted;
                await expect(eurftoken.connect(owner).removeMinter(bob.address)).to.be.reverted;
                await expect(eurftoken.connect(owner).updateMintingAllowance(bob.address, 1000)).to.be.reverted;
            });

            describe('MINTER', function () {
                beforeEach(async function () {
                    await eurftoken.connect(masterMinter).addMinter(minter.address, 1000000);
                });

                it('should mint within allowance', async function () {
                    var supply = await eurftoken.totalSupply();
                    await eurftoken.connect(minter).mint(bob.address, 1000);
                    expect(await eurftoken.balanceOf(bob.address)).to.equal(1000);
                    expect(await eurftoken.getMinterAllowance(minter.address)).to.equal(999000);
                    expect(await eurftoken.totalSupply()).to.equal(supply + 1000n);
                });

                it('should not mint above allowance', async function () {
                    await expect(eurftoken.connect(minter).mint(bob.address, 2000000)).to.be.reverted;
                });

                it('should burn within allowance', async function () {
                    await eurftoken.connect(minter).mint(minter, 1000);
                    expect(await eurftoken.getMinterAllowance(minter.address)).to.equal(999000);
                    expect(await eurftoken.balanceOf(minter.address)).to.equal(1000);
                    var supply = await eurftoken.totalSupply();
                    await eurftoken.connect(minter).burn(1000);
                    expect(await eurftoken.balanceOf(minter.address)).to.equal(0);
                    expect(await eurftoken.totalSupply()).to.equal(supply - 1000n);
                });

                it('should not burn above allowance', async function () {
                    await expect(eurftoken.connect(minter).burn(2000000)).to.be.reverted;
                });
            });
        });

        describe('REGULAR ACCOUNT', function () {
            beforeEach(async function () {
                await eurftoken.connect(owner).setMasterMinter(masterMinter.address);
                await eurftoken.connect(masterMinter).mint(bob.address, 1000);
                await eurftoken.connect(masterMinter).mint(alice.address, 1000);
            });

            describe('REGULAR TX', function () {
                it('should transfer with sufficient balance', async function () {
                    await eurftoken.connect(alice).transfer(bob.address, 500);
                    expect(await eurftoken.balanceOf(bob.address)).to.equal(1500);
                    expect(await eurftoken.balanceOf(alice.address)).to.equal(500);
                });
    
                it('should not transfer with unsufficient balance', async function () {
                    await expect(eurftoken.connect(alice).transfer(bob.address, 1500)).to.be.reverted;
                });
    
                it('should approve', async function () {
                    await eurftoken.connect(alice).approve(bob.address, 500);
                    expect(await eurftoken.allowance(alice.address, bob.address)).to.equal(500);
                });
    
                it('should transfer from with sufficient balance', async function () {
                    await eurftoken.connect(alice).approve(bob.address, 500);
                    await eurftoken.connect(bob).transferFrom(alice.address, bob.address, 500);
                    expect(await eurftoken.balanceOf(alice.address)).to.equal(500);
                    expect(await eurftoken.balanceOf(bob.address)).to.equal(1500);
                    expect(await eurftoken.allowance(alice.address, bob.address)).to.equal(0);
                });
    
                it('should not transfer from with unsufficient balance', async function () {
                    await eurftoken.connect(alice).approve(bob.address, 500);
                    await expect(eurftoken.connect(bob).transferFrom(alice.address, bob.address, 1000)).to.be.reverted;
                });

                it('should not transfer if blacklisted', async function () {
                    await eurftoken.connect(admin).blacklist(bob.address);
                    await expect(eurftoken.connect(bob).transfer(alice.address, 500)).to.be.reverted;
                    await expect(eurftoken.connect(alice).transfer(bob.address, 500)).to.be.reverted;
                });
            });

            describe('META TX', function () {
                it('should approve with valid permit', async function () {
                    const result = await signERC2612Permit(provider, eurftoken.target, alice, bob, 500);
                    await eurftoken.connect(bob).permit(alice.address, bob.address, 500, result.deadline, result.v, result.r, result.s);
                    expect(await eurftoken.allowance(alice.address, bob.address)).to.equal(500);
                });

                it('should not approve with already used valid permit', async function () {
                    const result = await signERC2612Permit(provider, eurftoken.target, alice, bob, 500);
                    await eurftoken.connect(bob).permit(alice.address, bob.address, 500, result.deadline, result.v, result.r, result.s);
                    await expect(eurftoken.connect(bob).permit(alice.address, bob.address, 500, result.deadline, result.v, result.r, result.s)).to.be.reverted;
                });
    
                it('should not approve with unvalid permit', async function () {
                    const result = await signERC2612Permit(provider, eurftoken.target, alice, bob, 500);
                    await expect(eurftoken.connect(malory).permit(alice.address, malory.address, 500, result.deadline, result.v, result.r, result.s)).to.be.reverted;
                });
    
                it('should transfer with valid transferWithAuthorization', async function () {
                    const result = await signERC3009TWA(provider, eurftoken.target, alice, bob, 500);
                    await eurftoken.connect(bob).transferWithAuthorization(alice.address, bob.address, 500, result.deadline, result.v, result.r, result.s);
                    expect(await eurftoken.balanceOf(bob.address)).to.equal(1500);
                    expect(await eurftoken.balanceOf(alice.address)).to.equal(500);
                });

                it('should not transfer with already used valid transferWithAuthorization', async function () {
                    const result = await signERC3009TWA(provider, eurftoken.target, alice, bob, 500);
                    await eurftoken.connect(bob).transferWithAuthorization(alice.address, bob.address, 500, result.deadline, result.v, result.r, result.s);
                    await expect(eurftoken.connect(bob).transferWithAuthorization(alice.address, bob.address, 500, result.deadline, result.v, result.r, result.s)).to.be.reverted;
                });
    
                it('should not transfer with unvalid transferWithAuthorization', async function () {
                    const result = await signERC3009TWA(provider, eurftoken.target, alice, bob, 500);
                    await expect(eurftoken.connect(malory).transferWithAuthorization(alice.address, malory.address, 500, result.deadline, result.v, result.r, result.s)).to.be.reverted;
                });
    
                it('should not transferWithAuthorization if blacklisted', async function () {
                    await eurftoken.connect(admin).blacklist(bob.address);
                    const result = await signERC3009TWA(provider, eurftoken.target, alice, bob, 500);
                    await expect(eurftoken.connect(owner).transferWithAuthorization(alice.address, bob.address, 500, result.deadline, result.v, result.r, result.s)).to.be.reverted;
                });
            });
        });
    });

    describe('FORWARDER', function () {
        beforeEach(async function () {
            await eurftoken.connect(owner).setAdministrator(admin.address);
            await eurftoken.connect(owner).setMasterMinter(masterMinter.address);
            await eurftoken.connect(masterMinter).mint(bob.address, 1000);
            await eurftoken.connect(masterMinter).mint(alice.address, 1000);
            const FORWARDER = await ethers.getContractFactory('Forwarder');
            forwarder = await upgrades.deployProxy(FORWARDER, [eurftoken.target], { initializer: 'initialize'});
            await eurftoken.connect(admin).setTrustedForwarder(forwarder.target);
        });

        describe('TRANSFER', function () {
            it('should forward transfer', async function () {
                var data = interface.encodeFunctionData('transfer', [alice.address, 50]);
                var result = await signForward(provider, eurftoken.target, forwarder.target, bob, 1000000000000, data);
                expect(
                    await forwarder.connect(forwardOperator).execute(
                        result.request,
                        result.domainSeparator,
                        result.TypeHash,
                        result.suffixData,
                        result.signature,
                    )
                ).to.emit(eurftoken, 'Transfer').withArgs(bob.address, alice.address, 50);
                expect(await eurftoken.balanceOf(bob.address)).to.equal(950);
                expect(await eurftoken.balanceOf(alice.address)).to.equal(1050);
            });

            it('should forward transfer with gasslessBasefee', async function () {
                await eurftoken.connect(admin).setGaslessBasefee(10);
                var data = interface.encodeFunctionData('transfer', [alice.address, 50]);
                var result = await signForward(provider, eurftoken.target, forwarder.target, bob, 1000000000000, data);
                expect(
                    await forwarder.connect(forwardOperator).execute(
                        result.request,
                        result.domainSeparator,
                        result.TypeHash,
                        result.suffixData,
                        result.signature,
                    )
                ).to.emit(eurftoken, 'Transfer').withArgs(bob.address, alice.address, 50);
                expect(await eurftoken.balanceOf(bob.address)).to.equal(940);
                expect(await eurftoken.balanceOf(alice.address)).to.equal(1050);
                expect(await eurftoken.balanceOf(forwardOperator.address)).to.equal(10);
            });

            it('should not transfer with unvalid signature', async function () {
                var data = interface.encodeFunctionData('transfer', [alice.address, 50]);
                var result = await signForward(provider, eurftoken.target, forwarder.target, bob, 1000000000000, data);
                result.signature = '0x' + result.signature.slice(2, -2) + '00';
                await expect(
                    forwarder.connect(forwardOperator).execute(
                        result.request,
                        result.domainSeparator,
                        result.TypeHash,
                        result.suffixData,
                        result.signature,
                    )
                ).to.be.reverted;
            });

            it('should not forward transfer if not enough balance', async function () {
                var data = interface.encodeFunctionData('transfer', [alice.address, 1001]);
                var result = await signForward(provider, eurftoken.target, forwarder.target, bob, 1000000000000, data);
                await expect(
                    forwarder.connect(forwardOperator).execute(
                        result.request,
                        result.domainSeparator,
                        result.TypeHash,
                        result.suffixData,
                        result.signature,
                    )
                ).to.be.reverted;
            });
        });

        describe('EDGE CASES', function () {
            it('should revert if the forwarder is not trusted', async function () {
                const FORWARDER = await ethers.getContractFactory('Forwarder');
                let mysteryForwarder = await upgrades.deployProxy(FORWARDER, [eurftoken.target], { initializer: 'initialize'});
                var data = interface.encodeFunctionData('transfer', [alice.address, 50]);
                var result = await signForward(provider, eurftoken.target, mysteryForwarder.target, bob, 1000000000000, data);
                await expect(
                    mysteryForwarder.connect(forwardOperator).execute(
                        result.request,
                        result.domainSeparator,
                        result.TypeHash,
                        result.suffixData,
                        result.signature,
                    )
                ).to.be.reverted;
            });

            it('should revert if payGaslessBasefee is called', async function () {
                var data = interface.encodeFunctionData('payGaslessBasefee', [alice.address, malory.address]);
                var result = await signForward(provider, eurftoken.target, forwarder.target, malory, 1000000000000, data);
                await expect(
                    forwarder.connect(malory).execute(
                        result.request,
                        result.domainSeparator,
                        result.TypeHash,
                        result.suffixData,
                        result.signature,
                    )
                ).to.be.reverted;
            });

            it('should revert if any other function (exept transfer) is called', async function () {
                var data = interface.encodeFunctionData('approve', [alice.address, 50]);
                var result = await signForward(provider, eurftoken.target, forwarder.target, bob, 1000000000000, data);
                await expect(
                    forwarder.connect(forwardOperator).execute(
                        result.request,
                        result.domainSeparator,
                        result.TypeHash,
                        result.suffixData,
                        result.signature,
                    )
                ).to.be.reverted;
            });

            it('should revert if using already used forward data', async function () {
                var data = interface.encodeFunctionData('transfer', [alice.address, 50]);
                var result = await signForward(provider, eurftoken.target, forwarder.target, bob, 1000000000000, data);
                await forwarder.connect(forwardOperator).execute(
                    result.request,
                    result.domainSeparator,
                    result.TypeHash,
                    result.suffixData,
                    result.signature,
                );
                await expect(
                    forwarder.connect(forwardOperator).execute(
                        result.request,
                        result.domainSeparator,
                        result.TypeHash,
                        result.suffixData,
                        result.signature,
                    )
                ).to.be.reverted;
            });
        });
    });
});
