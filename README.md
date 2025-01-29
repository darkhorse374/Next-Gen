# Next Generation audit details
- Total Prize Pool: $22,000 in USDC
  - HM awards: $17,600 in USDC
  - QA awards: $700 in USDC 
  - Judge awards: $1,900 in USDC
  - Validator awards: $1,300 in USDC
  - Scout awards: $500 in USDC
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts January 31, 2025 20:00 UTC
- Ends February 7, 2025 20:00 UTC

**Note re: risk level upgrades/downgrades**

Two important notes about judging phase risk adjustments: 
- High- or Medium-risk submissions downgraded to Low-risk (QA) will be ineligible for awards.
- Upgrading a Low-risk finding from a QA report to a Medium- or High-risk finding is not supported.

As such, wardens are encouraged to select the appropriate risk level carefully during the submission phase.

## Automated Findings / Publicly Known Issues

The 4naly3er report can be found [here](https://github.com/code-423n4/2025-01-next-generation/blob/main/4naly3er-report.md).



_Note for C4 wardens: Anything included in this `Automated Findings / Publicly Known Issues` section is considered a publicly known issue and is ineligible for awards._


# Overview


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

## Links

- **Previous audits:**  N/A
- **Documentation:** https://drive.google.com/file/d/1VUANWsOjzKbkMDn5pB2gseK2wlYgw0r8/view?usp=sharing
- **Website:** https://ngpes.com/


---


# Scope

*See [scope.txt](https://github.com/code-423n4/2025-01-next-generation/blob/main/scope.txt)*

### Files in scope


| File   | Logic Contracts | Interfaces | nSLOC | Purpose | Libraries used |
| ------ | --------------- | ---------- | ----- | -----   | ------------ |
| /contracts/ERC20AdminUpgradeable.sol | 1| **** | 64 | |@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol|
| /contracts/ERC20ControlerMinterUpgradeable.sol | 1| **** | 107 | |@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol|
| /contracts/ERC20MetaTxUpgradeable.sol | 1| **** | 79 | |@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol<br>@openzeppelin/contracts/utils/cryptography/ECDSA.sol<br>@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol|
| /contracts/Forwarder.sol | 1| **** | 92 | |@openzeppelin/contracts/utils/cryptography/ECDSA.sol<br>@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol|
| /contracts/Token.sol | 1| **** | 92 | |@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol|
| /contracts/FeesHandlerUpgradeable.sol | 1| **** | 38 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol|
| **Totals** | **6** | **** | **472** | | |

### Files out of scope

*See [out_of_scope.txt](https://github.com/code-423n4/2025-01-next-generation/blob/main/out_of_scope.txt)*

## Scoping Q &amp; A

### General questions

| Question                                | Answer                       |
| --------------------------------------- | ---------------------------- |
| ERC20 used by the protocol              |       None             |
| Test coverage                           |   79.76% of statements                          |
| ERC721 used  by the protocol            |            None              |
| ERC777 used by the protocol             |           None                |
| ERC1155 used by the protocol            |              None            |
| Chains the protocol will be deployed on | Ethereum,Polygon |


### External integrations (e.g., Uniswap) behavior in scope:


| Question                                                  | Answer |
| --------------------------------------------------------- | ------ |
| Enabling/disabling fees (e.g. Blur disables/enables fees) | No   |
| Pausability (e.g. Uniswap pool gets paused)               |  No   |
| Upgradeability (e.g. Uniswap gets upgraded)               |   No  |


### EIP compliance checklist
ERC20, EIP-1967, ERC2771, EIP-3009 - See attached pdf with smart contract specification for details


# Additional context

## Main invariants
N/A

## Attack ideas (where to focus for bugs)
N/A


## All trusted roles in the protocol



For details see [the docs PDF](https://drive.google.com/file/d/1VUANWsOjzKbkMDn5pB2gseK2wlYgw0r8/view)

| Role                                | Description                       |
| --------------------------------------- | ---------------------------- |
| OWNER           |    |
| ADMIN           |    |
| MASTER_MINTER   |    |
| MINTER          |    |
| CONTROLLER      |    |


## Describe any novel or unique curve logic or mathematical models implemented in the contracts:

N/A


## Running tests


For more details see also [this README](https://github.com/code-423n4/2025-01-next-generation/blob/main/README-sponsor.md)

```bash
git clone https://github.com/code-423n4/2025-01-next-generation.git
cd 2025-01-next-generation
npm i
cp env.example .env
# then fill out the PRIVATE_KEY field with a private key (e.g. "0x147a7588690ee8057fd46ca3accaa7eb96f980ba168b53ab0cbb5d6ed143bf33")

npx hardhat test
```
To run code coverage
```bash
make coverage
```
To run gas benchmarks
```bash
make gas
```

File                                  |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
--------------------------------------|----------|----------|----------|----------|----------------|
 contracts/                           |    79.76 |    65.63 |    75.34 |    82.56 |                |
  ERC20AdminUpgradeable.sol           |    78.26 |    80.77 |    83.33 |    79.17 | 24,25,26,27,40 |
  ERC20ControlerMinterUpgradeable.sol |    82.05 |       80 |    66.67 |    86.54 |... 48,52,56,98 |
  ERC20MetaTxUpgradeable.sol          |    73.08 |    55.56 |    72.73 |    78.79 |... 148,149,151 |
  FeesHandlerUpgradeable.sol          |     87.5 |    33.33 |    83.33 |    90.91 |             45 |
  Forwarder.sol                       |    63.64 |    54.55 |    63.64 |    68.42 |... 131,134,135 |
  Token.sol                           |    94.87 |    57.69 |    83.33 |    94.59 |         69,100 |
All files                             |    79.76 |    65.63 |    75.34 |    82.56 |                |

## Miscellaneous
Employees of Next Generation and employees' family members are ineligible to participate in this audit.

Code4rena's rules cannot be overridden by the contents of this README. In case of doubt, please check with C4 staff.



