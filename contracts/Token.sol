/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2024 QWRTX SAS
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

import {ERC20MetaTxUpgradeable} from "./ERC20MetaTxUpgradeable.sol";
import {ERC20AdminUpgradeable} from "./ERC20AdminUpgradeable.sol";
import {ERC20ControlerMinterUpgradeable} from "./ERC20ControlerMinterUpgradeable.sol";
import {FeesHandlerUpgradeable} from "./FeesHandlerUpgradeable.sol";

contract EURFToken is
    ERC20MetaTxUpgradeable,
    ERC20AdminUpgradeable,
    ERC20ControlerMinterUpgradeable,
    FeesHandlerUpgradeable,
    UUPSUpgradeable
{
    uint8 constant DECIMALS = 6;

    bytes32 public constant OWNER = DEFAULT_ADMIN_ROLE;

    error InvalidForwarder();
    error BalanceTooLow(uint256 amountNeeded, uint256 balance);
    error AlreadyOwner(address newOwner);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __Pausable_init();
        __AccessControlEnumerable_init();

        _grantRole(OWNER, msg.sender);

        __EIP712_init("EURF", "1");

        __ERC20_init_unchained("EURF", "EURF");
        __ERC20MetaTx_init_unchained();
        __ERC20Admin_init_unchained();
        __ERC20ControlerMinter_init_unchained();
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Function to update the OWNER / DEFAULT_ADMIN_ROLE
     * @param newOwner The address of the owner
     */
    function setOwner(address newOwner) public {
        if (newOwner == address(0)) revert InvalidZeroAddress();
        if (newOwner == owner()) revert AlreadyOwner(newOwner);
        grantRole(OWNER, newOwner);
        revokeRole(OWNER, getRoleMember(OWNER, 0));
    }

    function owner() public view returns (address) {
        return getRoleMember(OWNER, 0);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER) {}

    //-------------------------- FORWARDER LOGIC --------------------------

    function setTrustedForwarder(address trustedForwarder) public override onlyRole(ADMIN) {
        super.setTrustedForwarder(trustedForwarder);
    }

    function _msgSender() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (address sender) {
        return ERC20MetaTxUpgradeable._msgSender();
    }

    function _msgData() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (bytes calldata) {
        return ERC20MetaTxUpgradeable._msgData();
    }

    //-------------------------- FEES HANDLER LOGIC --------------------------

    /**
     * @dev Function to set feesFaucet
     * @param feesFaucet New feesFaucet address
     */
    function setFeeFaucet(address feesFaucet) public override onlyRole(ADMIN) {
        super.setFeeFaucet(feesFaucet);
    }

    /**
     * @dev Function to update tx fee rate
     * @param newRate The address of the minter
     */
    function setTxFeeRate(uint256 newRate) public override onlyRole(ADMIN) {
        super.setTxFeeRate(newRate);
    }

    /**
     * @dev Function to trigger tx fee payment to feesFaucet (internal)
     * @param from The address of the payer
     * @param txAmount amount of the transaction in EURF
     */
    function _payTxFee(address from, uint256 txAmount) internal override {
        uint256 txFees = calculateTxFee(txAmount);
        if (balanceOf(from) < txFees + txAmount) revert BalanceTooLow(txFees + txAmount, balanceOf(from));
        if (_feesFaucet != address(0)) _update(from, _feesFaucet, txFees);
        emit FeesPaid(from, txFees);
    }

    /**
     * @dev Function to update gasless tx basefee
     * @param newBaseFee new gasless basefee amount
     */
    function setGaslessBasefee(uint256 newBaseFee) public override onlyRole(ADMIN) {
        super.setGaslessBasefee(newBaseFee);
    }

    /**
     * @dev Function to trigger gaslessBasefee payment from payer to paymaster
     * Can only be called from trustedForwarder.
     * @param payer Address of basefee payer (meta-tx signer)
     * @param paymaster Address of paymester (meta-tx executer)
     */
    function payGaslessBasefee(address payer, address paymaster) external override {
        if (!isTrustedForwarder(msg.sender)) revert InvalidForwarder();
        if (balanceOf(payer) < _gaslessBasefee) revert BalanceTooLow(_gaslessBasefee, balanceOf(payer));
        _update(payer, paymaster, _gaslessBasefee);
        emit GaslessBasefeePaid(payer, paymaster, _gaslessBasefee);
    }

    //-------------------------- TRANSFER W/FEES LOGIC --------------------------

    function transferSanity(address sender, address recipient, uint256 amount) internal {
        adminSanity(sender, recipient);
        if (_txfeeRate > 0) _payTxFee(sender, amount);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        transferSanity(_msgSender(), recipient, amount);
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        transferSanity(sender, recipient, amount);
        return super.transferFrom(sender, recipient, amount);
    }

    function transferWithAuthorization(
        address holder,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override returns (bool) {
        transferSanity(holder, spender, value);
        return super.transferWithAuthorization(holder, spender, value, deadline, v, r, s);
    }

    uint256[49] private __gap;
}
