// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//import openzeppli initializable
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract FeesHandlerUpgradeable is Initializable {
    address public _feesFaucet;
    uint256 public _txfeeRate;
    uint256 public _gaslessBasefee;

    uint256 constant FEE_RATIO = 10000;

    event TxFeeRateUpdated(uint256 newTxFeeRate);
    event GaslessBasefeeUpdated(uint256 newGaslessBasefee);
    event FeeFaucetUpdated(address newFeeFaucet);
    event FeesPaid(address indexed payer, uint256 fees);
    event GaslessBasefeePaid(address indexed payer, address indexed paymaster, uint256 basefee);

    error InvalidFeeRate(uint256 maxFeeRate, uint256 newFeeRate);
    error NegativeBasefee();

    function setFeeFaucet(address newFeeFaucet) public virtual {
        _feesFaucet = newFeeFaucet;
        emit FeeFaucetUpdated(newFeeFaucet);
    }

    function setTxFeeRate(uint256 newTxFeeRate) public virtual {
        if (newTxFeeRate > FEE_RATIO || newTxFeeRate < 0) revert InvalidFeeRate(FEE_RATIO, newTxFeeRate);
        _txfeeRate = newTxFeeRate;
        emit TxFeeRateUpdated(newTxFeeRate);
    }

    function setGaslessBasefee(uint256 newGaslessBasefee) public virtual {
        if (newGaslessBasefee < 0) revert NegativeBasefee();
        _gaslessBasefee = newGaslessBasefee;
        emit GaslessBasefeeUpdated(newGaslessBasefee);
    }

    function getTxFeeRate() public view returns (uint256) {
        return _txfeeRate;
    }

    function getGaslessBasefee() public view returns (uint256) {
        return _gaslessBasefee;
    }

    /**
     * @dev Function to calculate fees
     * @param txAmount amount of the transaction in NGEUR
     */
    function calculateTxFee(uint256 txAmount) public view returns (uint256) {
        return (txAmount * _txfeeRate) / FEE_RATIO;
    }

    function _payTxFee(address from, uint256 txAmount) internal virtual;

    function payGaslessBasefee(address payer, address paymaster) external virtual;
}
