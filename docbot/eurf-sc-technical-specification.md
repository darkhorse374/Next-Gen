# SMART CONTRACT TECHNICAL SPECIFICATIONS

Version 1.3 | Creation 2024-09-18 | Last update 2024-14-14 | Authored by QWRTX.com

## ABSTRACT

NEXTGEN presents the EURF 1:1 euro-backed stablecoin. EURF will be released on Ethereum main chain, Polygon & EVM chains.

Present document is a global technical overview of the smart contracts and initial governance leveraging Fireblocks MPC infrastructure. It specifies the operations of EURF by outlining the various roles of the participants through governance policies and roles based on QWRTX expertise.

Beyond governance, these specifications describe all smart contract entry points and the technological choices.

These specifications can be used as support for technical assessments performed by independent third-party auditors. They constitute the most exhaustive description of the functionalities that will be called on the management platform.

This document will evolve over time in additional versions. The version that will be validated will be the official support for the technical development of smart contracts.

## EURF RATIONALES

The NEXTGEN Euro token, namely EURF is a 1:1 euro-backed stablecoin registered by the French AMF. It follows a set of strict rationales:

- There are 5 distinct roles i.e., Administrator, Master minter, Owner, Controller & Reserve
- Each role is a vault account with a minimum of 3 authorizers and a threshold of acceptance of 2
- Smart contract is ownable i.e., only Owner can change the wallet address of any role
- Master minter can mint any amount to any address
- Master minter can burn only to approved addresses
- Master minter can delegate mint right to other accounts with a given allowance
- Controller can lock / unlock mint & burn
- Delegated minter can mint up to its allowance limit
- Delegated minter can burn only to approved addresses
- Administrator can pause / resume transfers
- Administrator can lock (blacklist) / unlock an account
- Administrator can force a transfer from any account to any account
- Administrator can set transfer fees percentage
- Administrator can set gasless transfer fees percentage
- Administrator can reference new trusted forwarder
- Only trusted forwarder can broadcast gasless transfers
- All ERC20/FA2 default features (transfer, approve / operators…etc.)
- Contract can be upgraded* (EVM chains only)

## FIREBLOCKS VAULT RATIONALES

All roles i.e., Owner, Master minter, Administrator, Controller & Reserve apply the following rationales:

- Owner is composed of min. 3 authorizers. All authorizers must approve operation for execution
- Administrator is composed of min. 3 authorizers. At least, 2 authorizers must approve operation for execution
- Reserve is composed of min. 3 authorizers. At least, 2 authorizers must approve operation for execution
- Controller is composed of min. 3 authorizers. At least, 2 authorizers must approve operation for execution
- Master minter is composed of min. 4 authorizers. At least, 2 authorizers must approve operation for execution
- All authorizer validation keys are managed and secured using Fireblocks MPC infrastructure

## INTRODUCTION (ETHEREUM / POLYGON)

### ETHEREUM

Ethereum is a decentralized exchange protocol allowing users to create smart contracts. These smart contracts are based on a protocol able to verify and enforce a mutual distributed computing system. They are deployed and publicly viewable in a blockchain.

Ethereum uses a unit of account designated Ether as the means of payment for these contracts. Its unique correspondent, used by trading platforms, is ETH. Ethereum is the second largest decentralized cryptocurrency, and its technology is widely employed in the crypto spheres, making it a prime choice when it comes to adoption.

The Ethereum consensus protocol was previously based on the principle of Proof of Work, which has been criticized for its high energy demand / consumption. An amendment was introduced and implemented mid-September 2022, to move to proof of stake. Nevertheless, the scalability and high fees rate remain untouched. Coming evolution might remediate these issues overtime.

### POLYGON

Polygon was firstly introduced from an observation: Ethereum is the first smart contract platform in the world, but it is reaching its limits. Users and developers suffer from high latency and gas costs. The current architecture does not allow to customize its technology stack, its tech stack. Developers are fleeing to secondary blockchains, compatible with the EVM (Ethereum Virtual Machine). However, the latter do not communicate with each other, which fragments the network.

## ERC20

ERC20 tokens come from the proposal / improvement process implemented by the Ethereum Foundation on its Github account. It is therefore important to emphasize that ERC20 is a standard: it defines functions and events that a token must manage to be qualified as ERC20. This is not a specific code or product. Everyone can create their own ERC20 token code as long as it respects the standard functions and their behavior. In this case, there are many ERC20 token contracts: the code provided on ethereum.org, the modular code of OpenZeppelin... etc.

This standardization has allowed the rapid development of a very large ecosystem of tokens on Ethereum. Before its creation, each service, each project had to set up its own token format, which also caused errors and incompatibilities. With a simple and open standard, tokens can be deployed easily. This is also the case for services using these tokens.

## EIP-1967 Standard Proxy Storage Slots

Delegating proxy contracts are widely used for both upgradeability and gas savings. These proxies rely on a logic contract (also known as implementation contract or master copy) that is called using delegate call. This allows proxies to keep a persistent state (storage and balance) while the code is delegated to the logic contract.

To avoid clashes in storage usage between the proxy and logic contract, the address of the logic contract is typically saved in a specific storage slot guaranteed to be never allocated by a compiler. This EIP proposes a set of standard slots to store proxy information. This allows clients like block explorers to properly extract and show this information to end users, and logic contracts to optionally act upon it.

## Technological choices & optimization

Regarding the contract implementation, EURF widely relies onto OpenZeppelin collection:

```solidity
@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol
@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetMinterPauserUpgradeable.sol
@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol
@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol
@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol
@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol
```

Additionally, the EURF contract supports "permits" standard to broadcast transfer for third parties as defined by the implementation proposal OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/draft-ERC20Permit.sol

## Gasless Transfers

Gasless transactions are carried out using 2 mechanisms: ERC20permit and ERC2271.

ERC20permit is an ERC20 with a permit function allowing the user to sign an off chain permit and a payer to execute it through the permit function.

To support and test the implementation of the ERC2271 format, a forwarder contract is introduced in accordance with EIP-2770 (see: https://eips.ethereum.org/EIPS/eip-2770).

The EURF contract is ERC2771 compliant so that the forwarder contract can execute EURF transactions that have been signed off-chain. To do this, the administrator must ensure that the forwarder contract is referenced as trustedForwarder.

![alt text](image.png)

## EIP-3009 Transfer with Authorization Transfers

A set of functions to enable meta-transactions and atomic interactions with ERC20 token contracts via signatures conforming to the EIP-712 typed message signing specification.

This enables the user to:
- delegate the gas payment to someone else
- pay for gas in the token itself rather than in ETH
- perform one or more token transfers and other operations in a single atomic transaction
- transfer ERC-20 tokens to another address, and have the recipient submit the transaction
- batch multiple transactions with minimal overhead
- create and perform multiple transactions without having to worry about them failing due to accidental nonce-reuse or improper ordering by the miner

## Storage & variables

Several information is safely stored within the Token smart contract storage. Information includes global variables including roles, the global mapping of addresses holding funds i.e., balances, and additional key metrics.

| STORAGE ENTRY | DEFINITION |
|---------------|------------|
| OWNER | Owner account address |
| ADMIN | Administrator account address |
| MASTER_MINTER | Master minter account address |
| FEES_FAUCET | Fees faucet account address (wallet that receives fees taken from transfers) |
| balances | Mapping of addresses holding funds or that once held tokens and the balance associated |
| allowances | Mapping of approvals and allowances from one account to another |
| blacklisted | Mapping of all blacklisted accounts by the ADMIN |
| minters | Mapping of all addresses referenced as minter and the related allowance |
| controllers | Mapping of all addresses referenced as controller |
| totalSupply | Total amount of tokens in circulation in the contract |
| paused | Boolean flag holding info if transfers are allowed or not |
| name | Token name i.e., NEXTGEN Eur – EURF euro pegged stablecoin |
| symbol | Token symbol i.e., EURF |
| decimal | Number of decimals i.e., 6 |
| txFeeRate | % amount taken on simple transfer |
| gaslessBaseFees | % amount taken on gasless transfers i.e., permits |
| nonces | Mapping of nonces for permits for a given address |
| operating | Boolean flag to lock / unlock mint & burn operations |

## Features

### setOwner
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| setOwner | address | Only OWNER | - |

**DESCRIPTION**: Enable OWNER to set a new OWNER in its place

### setAdministrator
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| setAdministrator | address | Only OWNER | - |

**DESCRIPTION**: Enable OWNER to set a new ADMIN

### setMasterMinter
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| setMasterMinter | address | Only OWNER | - |

**DESCRIPTION**: Enable OWNER to set a new MASTER_MINTER

I'll continue with the remaining features:

### addMinter
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| addMinter | address, allowance | Only MASTER_MINTER | Address not in minters |

**DESCRIPTION**: Enable MASTER_MINTER to register a new account as Minter with a given allowance

### removeMinter
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| removeMinter | address | Only MASTER_MINTER | Address in minters |

**DESCRIPTION**: Enable MASTER_MINTER to remove a given account from Minters

### addController
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| addController | address | Only OWNER | Address not in controllers |

**DESCRIPTION**: Enable MASTER_OWNER to register a new account as Controller

### removeController
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| removeController | address | Only OWNER | Address in controllers |

**DESCRIPTION**: Enable OWNER to remove a given account from Controllers

### updateMintingAllowance
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| updateMintingAllowance | address, amount | Only MASTER_MINTER | Address in minters |

**DESCRIPTION**: Enable MASTER_MINTER to set a new allowance for a given account in Minters

### mint
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| mint | address, amount | Only MASTER_MINTER or MINTER | If Minter, check if allowance does not exceed minted amount |

**DESCRIPTION**: Enable MASTER_MINTER or MINTER to mint a given amount into a given account address. If MINTER update its allowance subtracted with the minting amount.

### burn
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| burn | address, amount | Only MASTER_MINTER or MINTER | - |

**DESCRIPTION**: Enable MASTER_MINTER or MINTER to burn a given amount into a given account address.

### transfer
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| transfer | amount, to | - | - Sender holds enough tokens<br>- Sender not blacklisted<br>- Receiver not blacklisted<br>- Not paused |

**DESCRIPTION**: Enable any token holder to send funds to a given address

### forceTransfer
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| forceTransfer | amount, from, to | Only admin | - Sender holds enough tokens<br>- Sender not blacklisted<br>- Receiver not blacklisted<br>- Not paused |

**DESCRIPTION**: Enable ADMIN to transfer tokens from any holder to a given address

### transferFrom
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| transferFrom | amount, from, to | From is Sender or Sender was previously approved in allowance mapping OR Sender is ADMIN | - Sender holds enough tokens<br>- Sender not blacklisted<br>- Receiver not blacklisted<br>- Or caller is Admin<br>- Not paused |

**DESCRIPTION**: Enable any token holder to send funds to a given address

### approve
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| approve | owner, spender, amount | - | - Owner not blacklisted<br>- Spender not blacklisted |

**DESCRIPTION**: Enable a token holder to approve for spending a given spender and a given amount

### pause
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| pause | - | Only ADMIN | Not already paused |

**DESCRIPTION**: Enable ADMIN to pause transfers

### unpause
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| unpause | - | Only ADMIN | Is paused |

**DESCRIPTION**: Enable ADMIN to resume transfers

### blacklist
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| blacklist | address | Only ADMIN | - |

**DESCRIPTION**: Enable ADMIN to blacklist a given address

### unBlacklist
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| unBlacklist | address | Only ADMIN | - |

**DESCRIPTION**: Enable ADMIN to delist an address from blacklist

### setFeesFaucet
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| setFeesFaucet | address | Only ADMIN | - |

**DESCRIPTION**: Enable ADMIN to set an account address to receive fees taken from transfers

### updateGasFees
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| updateGasFees | amount | Only ADMIN | - |

**DESCRIPTION**: Enable ADMIN to set a percentage taken on amount on each transfer. Fees will be payed by spender

### updateGaslessBasefee
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| updateGaslessBasefee | Payload key | Only ADMIN | - |

**DESCRIPTION**: Enable ADMIN to set a fixed fee on each gasless transaction executed from Trusted Forwarder contract. Fees in EURF will go to the paymaster as a compensation for gas price.

### payGaslessBasefee
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| payGaslessBasefee | address payer, address paymaster | Only Trusted Forwarder | balance > gaslessBasefee |

**DESCRIPTION**: Enable Trusted Forwarder to compensate Paymaster for gas price after executing transaction for token holder (payer).

### permit
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| permit | owner, spender, value, deadline, signature(v, r, s) | - | - Sender holds enough tokens<br>- Sender not blacklisted<br>- Receiver not blacklisted<br>- Not paused<br>- Valid signature |

**DESCRIPTION**: Enable a token holder to approve for spending a given spender and a given amount by signing a permit off-chain and having the spender (or other address) execute the function for him (gas will thus be paid by the spender and not the token older)

### setTrustedForwarder
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| setTrustedForwarder | address trustedForwarder | Only Admin | - |

**DESCRIPTION**: Enable Admin to set a trusted forwarder contract. This forwarder contract enable token holders to sign transactions off-chain and have someone else executing the transaction and paying the gas for the token holder in exchange of tokens.

### transferWithAuthorization
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| transferWithAuthorization | owner, spender, value, deadline, nonce, signature(v, r, s) | - | - Sender holds enough tokens<br>- Sender not blacklisted<br>- Receiver not blacklisted<br>- Not paused<br>- Valid signature |

**DESCRIPTION**: Enable a spender address to transfer a given amount from a Token holder's balance. This can only be achieved by having the token holder sign an authorization off-chain and having the spender (or other address) execute the function for him (gas will thus be paid by the spender and not the token older)

### safetySwitch
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| safetySwitch | - | Only CONTROLLER | If operating is False same Controller to switch |

**DESCRIPTION**: Enable CONTROLLER to lock / unlock mint & burn operations

### addController
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| addController | account | Only OWNER | - |

**DESCRIPTION**: Enable OWNER to grant Controller role to a given account

### removeController
| ENTRYPOINT | PARAMS | PERMISSIONS | CONDITIONS |
|------------|---------|-------------|------------|
| removeController | account | Only OWNER | - |

**DESCRIPTION**: Enable OWNER to revoke Controller role from a given account

