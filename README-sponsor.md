# EURF Solidity

Smart contracts in Solidity for the Ethereum implementation of EURF.

## Why Hardhat?

We chose to use Hardhat as our development environment because of its versatile features specifically designed for smart contract development. Hardhat offers an easy-to-use setup, and powerful debugging tools like the built-in Hardhat Network, which allows you to run a local Ethereum network to test contracts instantly. It also has an interactive console and a stack trace mechanism that makes error diagnosis more effective. Hardhat's plugin ecosystem is impressive, providing tools like the Hardhat Gas Reporter for tracking gas usage, the Solidity Coverage plugin for ensuring test coverage, and Hardhat Deploy for managing complex deployments. Hardhat also allows for seamless integration with other tools such as Ethers.js and Waffle, which makes testing and interaction with the blockchain convenient. These features collectively streamline the development process, improve productivity, and provide an excellent developer experience.

## Get Started

To start working with the EURF Solidity smart contracts using Hardhat, follow these steps:

```console
$ git clone https://gitlab.com/qwrtx/tempo/evm-euro-stablecoin.git
$ cd ./evm-euro-stablecoin
$ npm install
$ npx hardhat compile
```

Ensure that you have Node.js and npm installed. This will set up the environment and compile the contracts using Hardhat.

## Contracts

### Token.sol
The **Token** contract is the main ERC20 implementation of EURF. 

### Forwarder.sol
The **Forwarder** contract is designed to support gasless transactions. It forwards signed transactions that are executed on-chain, allowing users to interact with the EURF token without having to pay gas fees directly. This feature is especially useful for improving user experience and onboarding new users by abstracting the complexities of paying for gas.

### FeesHandlerUpgradeable.sol
The **FeesHandlerUpgradeable** contract manages the fee mechanisms for EURF. There are two types of fees: the **transaction fee (txfee_rate)** and the **gasless base fee**. The transaction fee is applied to every transfer, while the gasless base fee is used when transactions are forwarded by trusted forwarders. This contract ensures that fees are collected properly and the EURF ecosystem remains compliant.

### ERC20MetaTxUpgradeable.sol
The **ERC20MetaTxUpgradeable** contract extends the basic ERC20 functionality by adding support for meta-transactions. It allows users to sign approvals and other transactions off-chain, which can be forwarded by another party on-chain. This approach enables gasless transactions, where the transaction costs are borne by a different party (e.g., the dApp or the protocol).

### ERC20ControlerMinterUpgradeable.sol
The **ERC20ControlerMinterUpgradeable** contract manages minting permissions in a controlled manner. It allows the administrator to add or remove minters and to set minting limits, ensuring that the supply of EURF remains within predefined bounds. This contract helps enforce governance policies over token minting.

### ERC20AdminUpgradeable.sol
The **ERC20AdminUpgradeable** contract handles administrative functions for the EURF token. It allows for assigning administrative roles, controlling fees, managing blacklists, and overseeing upgrades of other contracts in the system. The use of upgradeable patterns ensures that the contract can be securely updated as needed.


The contracts use OpenZeppelin's **UUPSUpgradeable** pattern, which provides upgradability through proxies, allowing for future modifications without redeploying the entire contract.

## Deployment

### Setup .env

Create a `.env` file to store sensitive information such as your Infura API key, OpenZeppelin Defender credentials, and other environment-specific data.

### Deploy Contracts

To deploy the contracts, use the following Hardhat commands:

1. Compile contracts:
   ```console
   $ npx hardhat compile
   ```

2. Deploy contracts to a network (e.g., Sepolia):
   ```console
   $ npx hardhat run scripts/deployToken.js --network sepolia
   ```

3. Upgrade contracts using OpenZeppelin's upgrade plugin if necessary:
   ```console
   $ npx hardhat run scripts/upgradeToken.js --network sepolia
   ```

### Tests

Unit tests are handled in ./test/Token.js.
To run tests, run:
```console
   $ npx hardhat test
```

## Fees

### Transaction Fee (txfee_rate)

The **txfee_rate** is a fee charged on every transfer of EURF tokens. The rate is a percentage out of 10,000 and is calculated using the function `calculateTxFee(uint256 txAmount)` as `txAmount * txfee_rate / 10000`. This fee is deducted from the sender's balance, ensuring that each transaction also contributes to maintaining the EURF ecosystem.

### Gasless Base Fee

The **gasless base fee** is charged when a transaction is forwarded by a trusted forwarder. This fee allows users to perform transactions without holding ETH, improving accessibility to non-crypto-savvy users. The **Forwarder** contract manages these transactions, and fees are handled by functions such as `payGaslessBasefee(address payer, address paymaster)`.

## Future Improvements

- **Custom Fee Mechanism**: Introduce a custom fee structure for each forwarder to increase flexibility.
- **Batch Forwarder Addition**: Add functionality to register multiple forwarders in a single transaction to improve efficiency.

For further assistance, consult the Hardhat and OpenZeppelin documentation or open an issue in the repository.

