# Report


## Gas Optimizations


| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | Don't use `_msgSender()` if not supporting EIP-2771 | 23 |
| [GAS-2](#GAS-2) | Use assembly to check for `address(0)` | 4 |
| [GAS-3](#GAS-3) | Using bools for storage incurs overhead | 3 |
| [GAS-4](#GAS-4) | Cache array length outside of loop | 1 |
| [GAS-5](#GAS-5) | Use calldata instead of memory for function arguments that do not get mutated | 3 |
| [GAS-6](#GAS-6) | For Operations that will not overflow, you could use unchecked | 25 |
| [GAS-7](#GAS-7) | Use Custom Errors instead of Revert Strings to save Gas | 9 |
| [GAS-8](#GAS-8) | Avoid contract existence checks by using low level calls | 3 |
| [GAS-9](#GAS-9) | Functions guaranteed to revert when called by normal users can be marked `payable` | 17 |
| [GAS-10](#GAS-10) | `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`) | 1 |
| [GAS-11](#GAS-11) | Using `private` rather than `public` for constants, saves gas | 6 |
| [GAS-12](#GAS-12) | Splitting require() statements that use && saves gas | 1 |
| [GAS-13](#GAS-13) | Increments/decrements can be unchecked in for-loops | 1 |
| [GAS-14](#GAS-14) | Use != 0 instead of > 0 for unsigned integer comparison | 1 |
| [GAS-15](#GAS-15) | `internal` functions not called by the contract should be removed | 2 |
### <a name="GAS-1"></a>[GAS-1] Don't use `_msgSender()` if not supporting EIP-2771
Use `msg.sender` if the code does not implement [EIP-2771 trusted forwarder](https://eips.ethereum.org/EIPS/eip-2771) support

*Instances (23)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

76:         if (!hasRole(ADMIN, _msgSender())) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

66:             if (!hasRole(CONTROLLER, _msgSender())) revert NotController(_msgSender());

68:             _operatingController = _msgSender();

70:             if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) && _operatingController != _msgSender())

71:                 revert SafetySwitchOnUnauthorized(_msgSender());

75:         emit SwitchOperatingState(_msgSender(), _operating);

147:         if (!hasRole(MASTER_MINTER, _msgSender()) && !hasRole(MINTER_ROLE, _msgSender()))

148:             revert NotMinter(_msgSender());

153:         if (hasRole(MINTER_ROLE, _msgSender())) {

154:             uint256 mintingAllowedAmount = minterAllowed[_msgSender()];

156:             minterAllowed[_msgSender()] = mintingAllowedAmount - amount;

160:         emit Mint(_msgSender(), to, amount);

170:         if (!hasRole(MASTER_MINTER, _msgSender()) && !hasRole(MINTER_ROLE, _msgSender()))

171:             revert NotMinter(_msgSender());

173:         _burn(_msgSender(), amount);

174:         emit Burn(_msgSender(), amount);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

137:     function _msgSender() internal view virtual override returns (address sender) {

143:             return super._msgSender();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

67:         __Ownable_init(_msgSender());

115:         _eurf.payGaslessBasefee(req.from, _msgSender());

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

95:     function _msgSender() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (address sender) {

96:         return ERC20MetaTxUpgradeable._msgSender();

162:         transferSanity(_msgSender(), recipient, amount);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="GAS-2"></a>[GAS-2] Use assembly to check for `address(0)`
*Saves 6 gas per instance*

*Instances (4)*:
```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

124:         if (trustedForwarder == address(0)) revert InvalidZeroAddress();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

69:         require(ngeurToken != address(0), "NGEUR Forwarder: NGEUR Token address can't be address 0");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

77:         if (newOwner == address(0)) revert InvalidZeroAddress();

129:         if (_feesFaucet != address(0)) _update(from, _feesFaucet, txFees);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="GAS-3"></a>[GAS-3] Using bools for storage incurs overhead
Use uint256(1) and uint256(2) for true/false to avoid a Gwarmaccess (100 gas), and to avoid Gsset (20000 gas) when changing from ‘false’ to ‘true’, after having been ‘true’ in the past. See [source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/58f635312aa21f947cae5f8578638a85aa2519f5/contracts/security/ReentrancyGuard.sol#L23-L27).

*Instances (3)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

11:     mapping(address => bool) private _blacklist;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

15:     bool public _operating;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

45:     mapping(bytes32 => bool) public typeHashes;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="GAS-4"></a>[GAS-4] Cache array length outside of loop
If not cached, the solidity compiler will always read the length of the array during each iteration. That is, if it is a storage array, this is an extra sload operation (100 additional extra gas for each iteration except for the first) and if it is a memory array, this is an extra mload operation (3 additional gas for each iteration except for the first).

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

129:         for (uint i = 0; i < bytes(typeName).length; i++) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="GAS-5"></a>[GAS-5] Use calldata instead of memory for function arguments that do not get mutated
When a function with a `memory` array is called externally, the `abi.decode()` step has to use a for-loop to copy each index of the `calldata` to the `memory` index. Each iteration of this for-loop costs at least 60 gas (i.e. `60 * <mem_array>.length`). Using `calldata` directly bypasses this loop. 

If the array is passed to an `internal` function which passes the array to another internal function where the array is modified and therefore `memory` is used in the `external` call, it's still more gas-efficient to use `calldata` when the `external` function uses modifiers, since the modifiers may prevent the internal functions from being called. Structs have the same overhead as an array of length one. 

 *Saves 60 gas per instance*

*Instances (3)*:
```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

31:     function __ERC20ControlerMinter_init(string memory name, string memory symbol) public onlyInitializing {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

159:         ForwardRequest memory req,

161:         bytes memory suffixData

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="GAS-6"></a>[GAS-6] For Operations that will not overflow, you could use unchecked

*Instances (25)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

5: import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

6: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

5: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

156:             minterAllowed[_msgSender()] = mintingAllowedAmount - amount;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

5: import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

6: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

116:         _nonces[owner] = current + 1;

149:             return msg.data[:msg.data.length - 20];

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

5: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

53:         return (txAmount * _txfeeRate) / FEE_RATIO;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

27: import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

28: import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

29: import "./Token.sol";

125:         nonces[req.from]++;

129:         for (uint i = 0; i < bytes(typeName).length; i++) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

27: import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

28: import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

30: import {ERC20MetaTxUpgradeable} from "./ERC20MetaTxUpgradeable.sol";

31: import {ERC20AdminUpgradeable} from "./ERC20AdminUpgradeable.sol";

32: import {ERC20ControlerMinterUpgradeable} from "./ERC20ControlerMinterUpgradeable.sol";

33: import {FeesHandlerUpgradeable} from "./FeesHandlerUpgradeable.sol";

128:         if (balanceOf(from) < txFees + txAmount) revert BalanceTooLow(txFees + txAmount, balanceOf(from));

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="GAS-7"></a>[GAS-7] Use Custom Errors instead of Revert Strings to save Gas
Custom errors are available from solidity version 0.8.4. Custom errors save [**~50 gas**](https://gist.github.com/IllIllI000/ad1bd0d29a0101b25e57c293b4b0c746) each time they're hit by [avoiding having to allocate and store the revert string](https://blog.soliditylang.org/2021/04/21/custom-errors/#errors-in-depth). Not defining the strings also save deployment gas

Additionally, custom errors can be used inside and outside of contracts (including interfaces and libraries).

Source: <https://blog.soliditylang.org/2021/04/21/custom-errors/>:

> Starting from [Solidity v0.8.4](https://github.com/ethereum/solidity/releases/tag/v0.8.4), there is a convenient and gas-efficient way to explain to users why an operation failed through the use of custom errors. Until now, you could already use strings to give more information about failures (e.g., `revert("Insufficient funds.");`), but they are rather expensive, especially when it comes to deploy cost, and it is difficult to use dynamic information in them.

Consider replacing **all revert strings** with custom errors in the solution, and particularly those that have multiple occurrences:

*Instances (9)*:
```solidity
File: ./contracts/Forwarder.sol

69:         require(ngeurToken != address(0), "NGEUR Forwarder: NGEUR Token address can't be address 0");

90:         require(reqTransferSelector == transferSelector, "NGEUR Forwarder: can only forward transfer transactions");

104:         require(req.to == _eurfAddress, "NGEUR Forwarder: can only forward NGEUR transactions");

109:         require(reqTransferSelector == transferSelector, "NGEUR Forwarder: can only forward transfer transactions");

113:         require(success, "NGEUR Forwarder: failed tx execution");

121:         require(nonces[req.from] == req.nonce, "NGEUR Forwarder: nonce mismatch");

131:             require(c != "(" && c != ")", "NGEUR Forwarder: invalid typename");

151:         require(typeHashes[requestTypeHash], "NGEUR Forwarder: invalid request typehash");

155:         require(digest.recover(sig) == req.from, "NGEUR Forwarder: signature mismatch");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="GAS-8"></a>[GAS-8] Avoid contract existence checks by using low level calls
Prior to 0.8.10 the compiler inserted extra code, including `EXTCODESIZE` (**100 gas**), to check for contract existence for external function calls. In more recent solidity versions, the compiler will not insert these checks if the external call has a return value. Similar behavior can be achieved in earlier versions by using low-level calls, since low level calls never check for contract existence

*Instances (3)*:
```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

63:         address signer = ECDSA.recover(hash, v, r, s);

87:         address signer = ECDSA.recover(hash, v, r, s);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

155:         require(digest.recover(sig) == req.from, "NGEUR Forwarder: signature mismatch");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="GAS-9"></a>[GAS-9] Functions guaranteed to revert when called by normal users can be marked `payable`
If a function modifier such as `onlyOwner` is used, the function will revert if a normal user tries to pay the function. Marking the function as `payable` will lower the gas cost for legitimate callers because the compiler will not include checks for whether a payment was provided.

*Instances (17)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

23:     function __ERC20Admin_init(string memory name, string memory symbol) internal onlyInitializing {

30:     function __ERC20Admin_init_unchained() internal onlyInitializing {

34:     function setAdministrator(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {

45:     function setBlacklist(address account, bool blacklisted) internal onlyRole(ADMIN) {

65:     function pause() external onlyRole(ADMIN) {

69:     function unpause() external onlyRole(ADMIN) {

84:     function forceTransfer(address from, address to, uint256 amount) external onlyRole(ADMIN) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

31:     function __ERC20ControlerMinter_init(string memory name, string memory symbol) public onlyInitializing {

37:     function __ERC20ControlerMinter_init_unchained() internal onlyInitializing {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

29:     function __ERC20MetaTx_init(string memory name) internal onlyInitializing {

35:     function __ERC20MetaTx_init_unchained() internal onlyInitializing {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

128:     function registerRequestType(string calldata typeName, string calldata typeSuffix) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

87:     function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER) {}

91:     function setTrustedForwarder(address trustedForwarder) public override onlyRole(ADMIN) {

109:     function setFeeFaucet(address feesFaucet) public override onlyRole(ADMIN) {

117:     function setTxFeeRate(uint256 newRate) public override onlyRole(ADMIN) {

137:     function setGaslessBasefee(uint256 newBaseFee) public override onlyRole(ADMIN) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="GAS-10"></a>[GAS-10] `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`)
Pre-increments and pre-decrements are cheaper.

For a `uint256 i` variable, the following is true with the Optimizer enabled at 10k:

**Increment:**

- `i += 1` is the most expensive form
- `i++` costs 6 gas less than `i += 1`
- `++i` costs 5 gas less than `i++` (11 gas less than `i += 1`)

**Decrement:**

- `i -= 1` is the most expensive form
- `i--` costs 11 gas less than `i -= 1`
- `--i` costs 5 gas less than `i--` (16 gas less than `i -= 1`)

Note that post-increments (or post-decrements) return the old value before incrementing or decrementing, hence the name *post-increment*:

```solidity
uint i = 1;  
uint j = 2;
require(j == i++, "This will be false as i is incremented after the comparison");
```
  
However, pre-increments (or pre-decrements) return the new value:
  
```solidity
uint i = 1;  
uint j = 2;
require(j == ++i, "This will be true as i is incremented before the comparison");
```

In the pre-increment case, the compiler has to create a temporary variable (when used) for returning `1` instead of `2`.

Consider using pre-increments and pre-decrements where they are relevant (meaning: not where post-increments/decrements logic are relevant).

*Saves 5 gas per instance*

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

129:         for (uint i = 0; i < bytes(typeName).length; i++) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="GAS-11"></a>[GAS-11] Using `private` rather than `public` for constants, saves gas
If needed, the values can be read from the verified contract source code, or if there are multiple values there can be a single getter function that [returns a tuple](https://github.com/code-423n4/2022-08-frax/blob/90f55a9ce4e25bceed3a74290b854341d8de6afa/src/contracts/FraxlendPair.sol#L156-L178) of the values of all currently-public constants. Saves **3406-3606 gas** in deployment gas due to the compiler not having to create non-payable getter functions for deployment calldata, not having to store the bytes of the value outside of where it's used, and not adding another entry to the method ID table

*Instances (6)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

9:     bytes32 public constant ADMIN = keccak256("ADMIN");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

8:     bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

9:     bytes32 public constant MASTER_MINTER = keccak256("MASTER_MINTER");

13:     bytes32 public constant CONTROLLER = keccak256("CONTROLLER");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

42:     string public constant GENERIC_PARAMS =

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

44:     bytes32 public constant OWNER = DEFAULT_ADMIN_ROLE;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="GAS-12"></a>[GAS-12] Splitting require() statements that use && saves gas

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

131:             require(c != "(" && c != ")", "NGEUR Forwarder: invalid typename");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="GAS-13"></a>[GAS-13] Increments/decrements can be unchecked in for-loops
In Solidity 0.8+, there's a default overflow check on unsigned integers. It's possible to uncheck this in for-loops and save some gas at each iteration, but at the cost of some code readability, as this uncheck cannot be made inline.

[ethereum/solidity#10695](https://github.com/ethereum/solidity/issues/10695)

The change would be:

```diff
- for (uint256 i; i < numIterations; i++) {
+ for (uint256 i; i < numIterations;) {
 // ...  
+   unchecked { ++i; }
}  
```

These save around **25 gas saved** per instance.

The same can be applied with decrements (which should use `break` when `i == 0`).

The risk of overflow is non-existent for `uint256`.

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

129:         for (uint i = 0; i < bytes(typeName).length; i++) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="GAS-14"></a>[GAS-14] Use != 0 instead of > 0 for unsigned integer comparison

*Instances (1)*:
```solidity
File: ./contracts/Token.sol

158:         if (_txfeeRate > 0) _payTxFee(sender, amount);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="GAS-15"></a>[GAS-15] `internal` functions not called by the contract should be removed
If the functions are required by an interface, the contract should inherit from that interface and use the `override` keyword

*Instances (2)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

23:     function __ERC20Admin_init(string memory name, string memory symbol) internal onlyInitializing {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

29:     function __ERC20MetaTx_init(string memory name) internal onlyInitializing {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)


## Non Critical Issues


| |Issue|Instances|
|-|:-|:-:|
| [NC-1](#NC-1) | Missing checks for `address(0)` when assigning values to address state variables | 1 |
| [NC-2](#NC-2) | Use `string.concat()` or `bytes.concat()` instead of `abi.encodePacked` | 5 |
| [NC-3](#NC-3) | `constant`s should be defined rather than using magic numbers | 2 |
| [NC-4](#NC-4) | Control structures do not follow the Solidity Style Guide | 35 |
| [NC-5](#NC-5) | Critical Changes Should Use Two-step Procedure | 5 |
| [NC-6](#NC-6) | Default Visibility for constants | 2 |
| [NC-7](#NC-7) | Consider disabling `renounceOwnership()` | 1 |
| [NC-8](#NC-8) | Duplicated `require()`/`revert()` Checks Should Be Refactored To A Modifier Or Function | 2 |
| [NC-9](#NC-9) | Event missing indexed field | 5 |
| [NC-10](#NC-10) | Events that mark critical parameter changes should contain both the old and the new value | 8 |
| [NC-11](#NC-11) | Function ordering does not follow the Solidity style guide | 6 |
| [NC-12](#NC-12) | Functions should not be longer than 50 lines | 56 |
| [NC-13](#NC-13) | Change uint to uint256 | 1 |
| [NC-14](#NC-14) | Lack of checks in setters | 6 |
| [NC-15](#NC-15) | Missing Event for critical parameters change | 6 |
| [NC-16](#NC-16) | NatSpec is completely non-existent on functions that should have them | 18 |
| [NC-17](#NC-17) | File's first line is not an SPDX Identifier | 2 |
| [NC-18](#NC-18) | Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor | 3 |
| [NC-19](#NC-19) | Consider using named mappings | 5 |
| [NC-20](#NC-20) | Adding a `return` statement when the function defines a named return variable, is redundant | 3 |
| [NC-21](#NC-21) | Take advantage of Custom Error's return value property | 14 |
| [NC-22](#NC-22) | Avoid the use of sensitive terms | 17 |
| [NC-23](#NC-23) | Contract does not follow the Solidity style guide's suggested layout ordering | 5 |
| [NC-24](#NC-24) | Some require descriptions are not clear | 1 |
| [NC-25](#NC-25) | Use Underscores for Number Literals (add an underscore every 3 digits) | 1 |
| [NC-26](#NC-26) | Internal and private variables and functions names should begin with an underscore | 5 |
| [NC-27](#NC-27) | Event is missing `indexed` fields | 13 |
| [NC-28](#NC-28) | Constants should be defined rather than using magic numbers | 1 |
| [NC-29](#NC-29) | `override` function arguments that are unused should have the variable name removed or commented out to avoid compiler warnings | 1 |
| [NC-30](#NC-30) | `public` functions not called by the contract should be declared `external` instead | 16 |
| [NC-31](#NC-31) | Variables need not be initialized to zero | 1 |
### <a name="NC-1"></a>[NC-1] Missing checks for `address(0)` when assigning values to address state variables

*Instances (1)*:
```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

24:         _feesFaucet = newFeeFaucet;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

### <a name="NC-2"></a>[NC-2] Use `string.concat()` or `bytes.concat()` instead of `abi.encodePacked`
Solidity version 0.8.4 introduces `bytes.concat()` (vs `abi.encodePacked(<bytes>,<bytes>)`)

Solidity version 0.8.12 introduces `string.concat()` (vs `abi.encodePacked(<str>,<str>), which catches concatenation errors (in the event of a `bytes` data mixed in the concatenation)`)

*Instances (5)*:
```solidity
File: ./contracts/Forwarder.sol

71:         string memory requestType = string(abi.encodePacked("ForwardRequest(", GENERIC_PARAMS, ")"));

112:         (success, ret) = req.to.call{gas: req.gas, value: req.value}(abi.encodePacked(req.data, req.from));

134:         string memory requestType = string(abi.encodePacked(typeName, "(", GENERIC_PARAMS, ",", typeSuffix));

153:             abi.encodePacked("\x19\x01", domainSeparator, keccak256(_getEncoded(req, requestTypeHash, suffixData)))

164:             abi.encodePacked(

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="NC-3"></a>[NC-3] `constant`s should be defined rather than using magic numbers
Even [assembly](https://github.com/code-423n4/2022-05-opensea-seaport/blob/9d7ce4d08bf3c3010304a0476a785c70c0e90ae7/contracts/lib/TokenTransferrer.sol#L35-L39) can benefit from using readable constants instead of hex/numeric literals

*Instances (2)*:
```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

140:                 sender := shr(96, calldataload(sub(calldatasize(), 20)))

149:             return msg.data[:msg.data.length - 20];

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

### <a name="NC-4"></a>[NC-4] Control structures do not follow the Solidity Style Guide
See the [control structures](https://docs.soliditylang.org/en/latest/style-guide.html#control-structures) section of the Solidity Style Guide

*Instances (35)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

46:         if (_blacklist[account] == blacklisted) revert BlacklistUnchangedError(account, blacklisted);

77:             if (paused()) revert PausedError();

78:             if (isBlacklisted(from)) revert SenderBlacklistedError(from);

80:         if (isBlacklisted(to)) revert RecipientBlacklistedError(to);

81:         if (to == address(this)) revert TransferToContractError();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

66:             if (!hasRole(CONTROLLER, _msgSender())) revert NotController(_msgSender());

70:             if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) && _operatingController != _msgSender())

90:         if (formerMasterMinter == newMasterMinter) revert AlreadyMasterMinter(newMasterMinter);

131:         if (!hasRole(MINTER_ROLE, minter)) revert NotMinter(minter);

147:         if (!hasRole(MASTER_MINTER, _msgSender()) && !hasRole(MINTER_ROLE, _msgSender()))

149:         if (amount <= 0) revert InvalidAmount(amount);

150:         if (!_operating) revert OperationsOff();

155:             if (amount > mintingAllowedAmount) revert mintingAllowedAmountExceeded(amount, mintingAllowedAmount);

170:         if (!hasRole(MASTER_MINTER, _msgSender()) && !hasRole(MINTER_ROLE, _msgSender()))

172:         if (!_operating) revert OperationsOff();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

57:         if (block.timestamp > deadline) revert DeadLineExpired(deadline);

64:         if (signer != owner) revert InvalidSignature();

81:         if (block.timestamp > deadline) revert DeadLineExpired(deadline);

88:         if (signer != holder) revert InvalidSignature();

124:         if (trustedForwarder == address(0)) revert InvalidZeroAddress();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

29:         if (newTxFeeRate > FEE_RATIO || newTxFeeRate < 0) revert InvalidFeeRate(FEE_RATIO, newTxFeeRate);

35:         if (newGaslessBasefee < 0) revert NegativeBasefee();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

77:     function verify(

84:         _verifyNonce(req);

85:         _verifySig(req, domainSeparator, requestTypeHash, suffixData, sig);

100:         _verifyNonce(req);

101:         _verifySig(req, domainSeparator, requestTypeHash, suffixData, sig);

144:     function _verifySig(

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

77:         if (newOwner == address(0)) revert InvalidZeroAddress();

78:         if (newOwner == owner()) revert AlreadyOwner(newOwner);

128:         if (balanceOf(from) < txFees + txAmount) revert BalanceTooLow(txFees + txAmount, balanceOf(from));

129:         if (_feesFaucet != address(0)) _update(from, _feesFaucet, txFees);

148:         if (!isTrustedForwarder(msg.sender)) revert InvalidForwarder();

149:         if (balanceOf(payer) < _gaslessBasefee) revert BalanceTooLow(_gaslessBasefee, balanceOf(payer));

158:         if (_txfeeRate > 0) _payTxFee(sender, amount);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-5"></a>[NC-5] Critical Changes Should Use Two-step Procedure
The critical procedures should be two step process.

See similar findings in previous Code4rena contests for reference: <https://code4rena.com/reports/2022-06-illuminate/#2-critical-changes-should-use-two-step-procedure>

**Recommended Mitigation Steps**

Lack of two-step procedure for critical operations leaves them error-prone. Consider adding two step procedure on the critical functions.

*Instances (5)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

34:     function setAdministrator(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {

45:     function setBlacklist(address account, bool blacklisted) internal onlyRole(ADMIN) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/Token.sol

76:     function setOwner(address newOwner) public {

91:     function setTrustedForwarder(address trustedForwarder) public override onlyRole(ADMIN) {

109:     function setFeeFaucet(address feesFaucet) public override onlyRole(ADMIN) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-6"></a>[NC-6] Default Visibility for constants
Some constants are using the default visibility. For readability, consider explicitly declaring them as `internal`.

*Instances (2)*:
```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

12:     uint256 constant FEE_RATIO = 10000;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Token.sol

42:     uint8 constant DECIMALS = 6;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-7"></a>[NC-7] Consider disabling `renounceOwnership()`
If the plan for your project does not include eventually giving up all ownership control, consider overwriting OpenZeppelin's `Ownable`'s `renounceOwnership()` function in order to disable it.

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

31: contract Forwarder is OwnableUpgradeable {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="NC-8"></a>[NC-8] Duplicated `require()`/`revert()` Checks Should Be Refactored To A Modifier Or Function

*Instances (2)*:
```solidity
File: ./contracts/Forwarder.sol

90:         require(reqTransferSelector == transferSelector, "NGEUR Forwarder: can only forward transfer transactions");

109:         require(reqTransferSelector == transferSelector, "NGEUR Forwarder: can only forward transfer transactions");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="NC-9"></a>[NC-9] Event missing indexed field
Index event fields make the field more quickly accessible [to off-chain tools](https://ethereum.stackexchange.com/questions/40396/can-somebody-please-explain-the-concept-of-event-indexing) that parse events. This is especially useful when it comes to filtering based on an address. However, note that each index field costs extra gas during emission, so it's not necessarily best to index the maximum allowed per event (three fields). Where applicable, each `event` should use three `indexed` fields if there are three or more fields, and gas usage is not particularly of concern for the events in question. If there are fewer than three applicable fields, all of the applicable fields should be indexed.

*Instances (5)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

13:     event Blacklisted(address account, bool blacklisted);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

21:     event TrustedForwarderUpdated(address newTrustedForwarder);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

14:     event TxFeeRateUpdated(uint256 newTxFeeRate);

15:     event GaslessBasefeeUpdated(uint256 newGaslessBasefee);

16:     event FeeFaucetUpdated(address newFeeFaucet);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

### <a name="NC-10"></a>[NC-10] Events that mark critical parameter changes should contain both the old and the new value
This should especially be done if the new value is not required to be different from the old value

*Instances (8)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

45:     function setBlacklist(address account, bool blacklisted) internal onlyRole(ADMIN) {
            if (_blacklist[account] == blacklisted) revert BlacklistUnchangedError(account, blacklisted);
            _blacklist[account] = blacklisted;
            emit Blacklisted(account, blacklisted);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

88:     function setMasterMinter(address newMasterMinter) external {
            address formerMasterMinter = getRoleMember(MASTER_MINTER, 0);
            if (formerMasterMinter == newMasterMinter) revert AlreadyMasterMinter(newMasterMinter);
            revokeRole(MASTER_MINTER, formerMasterMinter);
            emit MinterAllowanceUpdated(formerMasterMinter, 0);

88:     function setMasterMinter(address newMasterMinter) external {
            address formerMasterMinter = getRoleMember(MASTER_MINTER, 0);
            if (formerMasterMinter == newMasterMinter) revert AlreadyMasterMinter(newMasterMinter);
            revokeRole(MASTER_MINTER, formerMasterMinter);
            emit MinterAllowanceUpdated(formerMasterMinter, 0);
            grantRole(MASTER_MINTER, newMasterMinter);
            emit MinterAllowanceUpdated(newMasterMinter, type(uint256).max);

127:     function updateMintingAllowance(
             address minter,
             uint256 minterAllowedAmount
         ) external virtual onlyRole(MASTER_MINTER) {
             if (!hasRole(MINTER_ROLE, minter)) revert NotMinter(minter);
             minterAllowed[minter] = minterAllowedAmount;
             emit MinterAllowanceUpdated(minter, minterAllowedAmount);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

123:     function setTrustedForwarder(address trustedForwarder) public virtual {
             if (trustedForwarder == address(0)) revert InvalidZeroAddress();
             _trustedForwarder = trustedForwarder;
             emit TrustedForwarderUpdated(_trustedForwarder);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

23:     function setFeeFaucet(address newFeeFaucet) public virtual {
            _feesFaucet = newFeeFaucet;
            emit FeeFaucetUpdated(newFeeFaucet);

28:     function setTxFeeRate(uint256 newTxFeeRate) public virtual {
            if (newTxFeeRate > FEE_RATIO || newTxFeeRate < 0) revert InvalidFeeRate(FEE_RATIO, newTxFeeRate);
            _txfeeRate = newTxFeeRate;
            emit TxFeeRateUpdated(newTxFeeRate);

34:     function setGaslessBasefee(uint256 newGaslessBasefee) public virtual {
            if (newGaslessBasefee < 0) revert NegativeBasefee();
            _gaslessBasefee = newGaslessBasefee;
            emit GaslessBasefeeUpdated(newGaslessBasefee);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

### <a name="NC-11"></a>[NC-11] Function ordering does not follow the Solidity style guide
According to the [Solidity style guide](https://docs.soliditylang.org/en/v0.8.17/style-guide.html#order-of-functions), functions should be laid out in the following order :`constructor()`, `receive()`, `fallback()`, `external`, `public`, `internal`, `private`, but the cases below do not follow this pattern

*Instances (6)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

1: 
   Current order:
   internal __ERC20Admin_init
   internal __ERC20Admin_init_unchained
   external setAdministrator
   public isAdministrator
   internal setBlacklist
   external blacklist
   external unblacklist
   public isBlacklisted
   external pause
   external unpause
   internal adminSanity
   external forceTransfer
   
   Suggested order:
   external setAdministrator
   external blacklist
   external unblacklist
   external pause
   external unpause
   external forceTransfer
   public isAdministrator
   public isBlacklisted
   internal __ERC20Admin_init
   internal __ERC20Admin_init_unchained
   internal setBlacklist
   internal adminSanity

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

1: 
   Current order:
   public __ERC20ControlerMinter_init
   internal __ERC20ControlerMinter_init_unchained
   external addController
   external removeController
   public isController
   public safetySwitch
   public isOperating
   external setMasterMinter
   public isMasterMinter
   external addMinter
   external removeMinter
   external updateMintingAllowance
   public getMinterAllowance
   public mint
   public burn
   
   Suggested order:
   external addController
   external removeController
   external setMasterMinter
   external addMinter
   external removeMinter
   external updateMintingAllowance
   public __ERC20ControlerMinter_init
   public isController
   public safetySwitch
   public isOperating
   public isMasterMinter
   public getMinterAllowance
   public mint
   public burn
   internal __ERC20ControlerMinter_init_unchained

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

1: 
   Current order:
   internal __ERC20MetaTx_init
   internal __ERC20MetaTx_init_unchained
   public permit
   public transferWithAuthorization
   public nonce
   external DOMAIN_SEPARATOR
   internal _useNonce
   public setTrustedForwarder
   public isTrustedForwarder
   internal _msgSender
   internal _msgData
   
   Suggested order:
   external DOMAIN_SEPARATOR
   public permit
   public transferWithAuthorization
   public nonce
   public setTrustedForwarder
   public isTrustedForwarder
   internal __ERC20MetaTx_init
   internal __ERC20MetaTx_init_unchained
   internal _useNonce
   internal _msgSender
   internal _msgData

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

1: 
   Current order:
   public setFeeFaucet
   public setTxFeeRate
   public setGaslessBasefee
   public getTxFeeRate
   public getGaslessBasefee
   public calculateTxFee
   internal _payTxFee
   external payGaslessBasefee
   
   Suggested order:
   external payGaslessBasefee
   public setFeeFaucet
   public setTxFeeRate
   public setGaslessBasefee
   public getTxFeeRate
   public getGaslessBasefee
   public calculateTxFee
   internal _payTxFee

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

1: 
   Current order:
   public nonce
   public getEURF
   public initialize
   external verify
   external execute
   internal _verifyNonce
   internal _updateNonce
   external registerRequestType
   internal registerRequestTypeInternal
   internal _verifySig
   public _getEncoded
   
   Suggested order:
   external verify
   external execute
   external registerRequestType
   public nonce
   public getEURF
   public initialize
   public _getEncoded
   internal _verifyNonce
   internal _updateNonce
   internal registerRequestTypeInternal
   internal _verifySig

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

1: 
   Current order:
   public initialize
   public decimals
   public setOwner
   public owner
   internal _authorizeUpgrade
   public setTrustedForwarder
   internal _msgSender
   internal _msgData
   public setFeeFaucet
   public setTxFeeRate
   internal _payTxFee
   public setGaslessBasefee
   external payGaslessBasefee
   internal transferSanity
   public transfer
   public transferFrom
   public transferWithAuthorization
   
   Suggested order:
   external payGaslessBasefee
   public initialize
   public decimals
   public setOwner
   public owner
   public setTrustedForwarder
   public setFeeFaucet
   public setTxFeeRate
   public setGaslessBasefee
   public transfer
   public transferFrom
   public transferWithAuthorization
   internal _authorizeUpgrade
   internal _msgSender
   internal _msgData
   internal _payTxFee
   internal transferSanity

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-12"></a>[NC-12] Functions should not be longer than 50 lines
Overly complex code can make understanding functionality more difficult, try to further modularize your code to ensure readability 

*Instances (56)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

23:     function __ERC20Admin_init(string memory name, string memory symbol) internal onlyInitializing {

30:     function __ERC20Admin_init_unchained() internal onlyInitializing {

34:     function setAdministrator(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {

39:     function isAdministrator(address account) public view returns (bool) {

45:     function setBlacklist(address account, bool blacklisted) internal onlyRole(ADMIN) {

59:     function isBlacklisted(address account) public view returns (bool) {

75:     function adminSanity(address from, address to) internal view {

84:     function forceTransfer(address from, address to, uint256 amount) external onlyRole(ADMIN) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

31:     function __ERC20ControlerMinter_init(string memory name, string memory symbol) public onlyInitializing {

37:     function __ERC20ControlerMinter_init_unchained() internal onlyInitializing {

47:     function addController(address newController) external {

51:     function removeController(address controller) external {

55:     function isController(address account) public view returns (bool) {

82:     function isOperating() public view returns (bool, address) {

88:     function setMasterMinter(address newMasterMinter) external {

97:     function isMasterMinter(address account) public view returns (bool) {

106:     function addMinter(address minter, uint256 minterAllowedAmount) external {

136:     function getMinterAllowance(address minter) public view returns (uint256) {

146:     function mint(address to, uint256 amount) public virtual {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

29:     function __ERC20MetaTx_init(string memory name) internal onlyInitializing {

35:     function __ERC20MetaTx_init_unchained() internal onlyInitializing {

98:     function nonce(address owner) public view returns (uint256) {

106:     function DOMAIN_SEPARATOR() external view returns (bytes32) {

114:     function _useNonce(address owner) internal virtual returns (uint256 current) {

123:     function setTrustedForwarder(address trustedForwarder) public virtual {

133:     function isTrustedForwarder(address forwarder) public view returns (bool) {

137:     function _msgSender() internal view virtual override returns (address sender) {

147:     function _msgData() internal view virtual override returns (bytes calldata) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

23:     function setFeeFaucet(address newFeeFaucet) public virtual {

28:     function setTxFeeRate(uint256 newTxFeeRate) public virtual {

34:     function setGaslessBasefee(uint256 newGaslessBasefee) public virtual {

40:     function getTxFeeRate() public view returns (uint256) {

44:     function getGaslessBasefee() public view returns (uint256) {

52:     function calculateTxFee(uint256 txAmount) public view returns (uint256) {

56:     function _payTxFee(address from, uint256 txAmount) internal virtual;

58:     function payGaslessBasefee(address payer, address paymaster) external virtual;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

58:     function nonce(address from) public view returns (uint256) {

62:     function getEURF() public view returns (address) {

66:     function initialize(address ngeurToken) public initializer {

120:     function _verifyNonce(ForwardRequest memory req) internal view {

124:     function _updateNonce(ForwardRequest memory req) internal {

128:     function registerRequestType(string calldata typeName, string calldata typeSuffix) external onlyOwner {

138:     function registerRequestTypeInternal(string memory requestType) internal {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

68:     function decimals() public pure override returns (uint8) {

87:     function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER) {}

91:     function setTrustedForwarder(address trustedForwarder) public override onlyRole(ADMIN) {

95:     function _msgSender() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (address sender) {

99:     function _msgData() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (bytes calldata) {

109:     function setFeeFaucet(address feesFaucet) public override onlyRole(ADMIN) {

117:     function setTxFeeRate(uint256 newRate) public override onlyRole(ADMIN) {

126:     function _payTxFee(address from, uint256 txAmount) internal override {

137:     function setGaslessBasefee(uint256 newBaseFee) public override onlyRole(ADMIN) {

147:     function payGaslessBasefee(address payer, address paymaster) external override {

156:     function transferSanity(address sender, address recipient, uint256 amount) internal {

161:     function transfer(address recipient, uint256 amount) public override returns (bool) {

166:     function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-13"></a>[NC-13] Change uint to uint256
Throughout the code base, some variables are declared as `uint`. To favor explicitness, consider changing all instances of `uint` to `uint256`

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

129:         for (uint i = 0; i < bytes(typeName).length; i++) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="NC-14"></a>[NC-14] Lack of checks in setters
Be it sanity checks (like checks against `0`-values) or initial setting checks: it's best for Setter functions to have them

*Instances (6)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

34:     function setAdministrator(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
            revokeRole(ADMIN, getRoleMember(ADMIN, 0));
            grantRole(ADMIN, newAdmin);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

124:     function _updateNonce(ForwardRequest memory req) internal {
             nonces[req.from]++;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

91:     function setTrustedForwarder(address trustedForwarder) public override onlyRole(ADMIN) {
            super.setTrustedForwarder(trustedForwarder);

109:     function setFeeFaucet(address feesFaucet) public override onlyRole(ADMIN) {
             super.setFeeFaucet(feesFaucet);

117:     function setTxFeeRate(uint256 newRate) public override onlyRole(ADMIN) {
             super.setTxFeeRate(newRate);

137:     function setGaslessBasefee(uint256 newBaseFee) public override onlyRole(ADMIN) {
             super.setGaslessBasefee(newBaseFee);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-15"></a>[NC-15] Missing Event for critical parameters change
Events help non-contract tools to track changes, and events prevent users from being surprised by changes.

*Instances (6)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

34:     function setAdministrator(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
            revokeRole(ADMIN, getRoleMember(ADMIN, 0));
            grantRole(ADMIN, newAdmin);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/Token.sol

76:     function setOwner(address newOwner) public {
            if (newOwner == address(0)) revert InvalidZeroAddress();
            if (newOwner == owner()) revert AlreadyOwner(newOwner);
            grantRole(OWNER, newOwner);
            revokeRole(OWNER, getRoleMember(OWNER, 0));

91:     function setTrustedForwarder(address trustedForwarder) public override onlyRole(ADMIN) {
            super.setTrustedForwarder(trustedForwarder);

109:     function setFeeFaucet(address feesFaucet) public override onlyRole(ADMIN) {
             super.setFeeFaucet(feesFaucet);

117:     function setTxFeeRate(uint256 newRate) public override onlyRole(ADMIN) {
             super.setTxFeeRate(newRate);

137:     function setGaslessBasefee(uint256 newBaseFee) public override onlyRole(ADMIN) {
             super.setGaslessBasefee(newBaseFee);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-16"></a>[NC-16] NatSpec is completely non-existent on functions that should have them
Public and external functions that aren't view or pure should have NatSpec comments

*Instances (18)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

34:     function setAdministrator(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {

51:     function blacklist(address account) external {

55:     function unblacklist(address account) external {

65:     function pause() external onlyRole(ADMIN) {

69:     function unpause() external onlyRole(ADMIN) {

84:     function forceTransfer(address from, address to, uint256 amount) external onlyRole(ADMIN) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

31:     function __ERC20ControlerMinter_init(string memory name, string memory symbol) public onlyInitializing {

47:     function addController(address newController) external {

51:     function removeController(address controller) external {

88:     function setMasterMinter(address newMasterMinter) external {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

66:     function initialize(address ngeurToken) public initializer {

93:     function execute(

128:     function registerRequestType(string calldata typeName, string calldata typeSuffix) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

53:     function initialize() public initializer {

91:     function setTrustedForwarder(address trustedForwarder) public override onlyRole(ADMIN) {

161:     function transfer(address recipient, uint256 amount) public override returns (bool) {

166:     function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {

171:     function transferWithAuthorization(

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-17"></a>[NC-17] File's first line is not an SPDX Identifier

*Instances (2)*:
```solidity
File: ./contracts/Forwarder.sol

1: /**

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

1: /**

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-18"></a>[NC-18] Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor
If a function is supposed to be access-controlled, a `modifier` should be used instead of a `require/if` statement for more readability.

*Instances (3)*:
```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

138:         if (isTrustedForwarder(msg.sender)) {

148:         if (isTrustedForwarder(msg.sender)) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Token.sol

148:         if (!isTrustedForwarder(msg.sender)) revert InvalidForwarder();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-19"></a>[NC-19] Consider using named mappings
Consider moving to solidity version 0.8.18 or later, and using [named mappings](https://ethereum.stackexchange.com/questions/51629/how-to-name-the-arguments-in-mapping/145555#145555) to make it easier to understand the purpose of each mapping

*Instances (5)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

11:     mapping(address => bool) private _blacklist;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

11:     mapping(address => uint256) public minterAllowed;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

9:     mapping(address => uint256) private _nonces;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

45:     mapping(bytes32 => bool) public typeHashes;

48:     mapping(address => uint256) private nonces;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="NC-20"></a>[NC-20] Adding a `return` statement when the function defines a named return variable, is redundant

*Instances (3)*:
```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

137:     function _msgSender() internal view virtual override returns (address sender) {
             if (isTrustedForwarder(msg.sender)) {
                 assembly {
                     sender := shr(96, calldataload(sub(calldatasize(), 20)))
                 }
             } else {
                 return super._msgSender();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

93:     function execute(
            ForwardRequest calldata req,
            bytes32 domainSeparator,
            bytes32 requestTypeHash,
            bytes calldata suffixData,
            bytes calldata sig
        ) external payable returns (bool success, bytes memory ret) {
            _verifyNonce(req);
            _verifySig(req, domainSeparator, requestTypeHash, suffixData, sig);
            _updateNonce(req);
    
            require(req.to == _eurfAddress, "NGEUR Forwarder: can only forward NGEUR transactions");
    
            bytes4 transferSelector = bytes4(keccak256("transfer(address,uint256)"));
            bytes4 reqTransferSelector = bytes4(req.data[:4]);
    
            require(reqTransferSelector == transferSelector, "NGEUR Forwarder: can only forward transfer transactions");
    
            // solhint-disable-next-line avoid-low-level-calls
            (success, ret) = req.to.call{gas: req.gas, value: req.value}(abi.encodePacked(req.data, req.from));
            require(success, "NGEUR Forwarder: failed tx execution");
    
            _eurf.payGaslessBasefee(req.from, _msgSender());
    
            return (success, ret);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

95:     function _msgSender() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (address sender) {
            return ERC20MetaTxUpgradeable._msgSender();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-21"></a>[NC-21] Take advantage of Custom Error's return value property
An important feature of Custom Error is that values such as address, tokenID, msg.value can be written inside the () sign, this kind of approach provides a serious advantage in debugging and examining the revert details of dapps such as tenderly.

*Instances (14)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

77:             if (paused()) revert PausedError();

81:         if (to == address(this)) revert TransferToContractError();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

66:             if (!hasRole(CONTROLLER, _msgSender())) revert NotController(_msgSender());

71:                 revert SafetySwitchOnUnauthorized(_msgSender());

148:             revert NotMinter(_msgSender());

150:         if (!_operating) revert OperationsOff();

171:             revert NotMinter(_msgSender());

172:         if (!_operating) revert OperationsOff();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

64:         if (signer != owner) revert InvalidSignature();

88:         if (signer != holder) revert InvalidSignature();

124:         if (trustedForwarder == address(0)) revert InvalidZeroAddress();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

35:         if (newGaslessBasefee < 0) revert NegativeBasefee();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Token.sol

77:         if (newOwner == address(0)) revert InvalidZeroAddress();

148:         if (!isTrustedForwarder(msg.sender)) revert InvalidForwarder();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-22"></a>[NC-22] Avoid the use of sensitive terms
Use [alternative variants](https://www.zdnet.com/article/mysql-drops-master-slave-and-blacklist-whitelist-terminology/), e.g. allowlist/denylist instead of whitelist/blacklist

*Instances (17)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

11:     mapping(address => bool) private _blacklist;

13:     event Blacklisted(address account, bool blacklisted);

16:     error BlacklistUnchangedError(address account, bool blacklisted);

17:     error SenderBlacklistedError(address account);

18:     error RecipientBlacklistedError(address account);

45:     function setBlacklist(address account, bool blacklisted) internal onlyRole(ADMIN) {

46:         if (_blacklist[account] == blacklisted) revert BlacklistUnchangedError(account, blacklisted);

47:         _blacklist[account] = blacklisted;

48:         emit Blacklisted(account, blacklisted);

51:     function blacklist(address account) external {

52:         setBlacklist(account, true);

55:     function unblacklist(address account) external {

56:         setBlacklist(account, false);

59:     function isBlacklisted(address account) public view returns (bool) {

60:         return _blacklist[account];

78:             if (isBlacklisted(from)) revert SenderBlacklistedError(from);

80:         if (isBlacklisted(to)) revert RecipientBlacklistedError(to);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

### <a name="NC-23"></a>[NC-23] Contract does not follow the Solidity style guide's suggested layout ordering
The [style guide](https://docs.soliditylang.org/en/v0.8.16/style-guide.html#order-of-layout) says that, within a contract, the ordering should be:

1) Type declarations
2) State variables
3) Events
4) Modifiers
5) Functions

However, the contract(s) below do not follow this ordering

*Instances (5)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

1: 
   Current order:
   VariableDeclaration.ADMIN
   VariableDeclaration._blacklist
   EventDefinition.Blacklisted
   ErrorDefinition.PausedError
   ErrorDefinition.BlacklistUnchangedError
   ErrorDefinition.SenderBlacklistedError
   ErrorDefinition.RecipientBlacklistedError
   ErrorDefinition.TransferToContractError
   EventDefinition.ForcedTransfer
   FunctionDefinition.__ERC20Admin_init
   FunctionDefinition.__ERC20Admin_init_unchained
   FunctionDefinition.setAdministrator
   FunctionDefinition.isAdministrator
   FunctionDefinition.setBlacklist
   FunctionDefinition.blacklist
   FunctionDefinition.unblacklist
   FunctionDefinition.isBlacklisted
   FunctionDefinition.pause
   FunctionDefinition.unpause
   FunctionDefinition.adminSanity
   FunctionDefinition.forceTransfer
   
   Suggested order:
   VariableDeclaration.ADMIN
   VariableDeclaration._blacklist
   ErrorDefinition.PausedError
   ErrorDefinition.BlacklistUnchangedError
   ErrorDefinition.SenderBlacklistedError
   ErrorDefinition.RecipientBlacklistedError
   ErrorDefinition.TransferToContractError
   EventDefinition.Blacklisted
   EventDefinition.ForcedTransfer
   FunctionDefinition.__ERC20Admin_init
   FunctionDefinition.__ERC20Admin_init_unchained
   FunctionDefinition.setAdministrator
   FunctionDefinition.isAdministrator
   FunctionDefinition.setBlacklist
   FunctionDefinition.blacklist
   FunctionDefinition.unblacklist
   FunctionDefinition.isBlacklisted
   FunctionDefinition.pause
   FunctionDefinition.unpause
   FunctionDefinition.adminSanity
   FunctionDefinition.forceTransfer

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

1: 
   Current order:
   VariableDeclaration.MINTER_ROLE
   VariableDeclaration.MASTER_MINTER
   VariableDeclaration.minterAllowed
   VariableDeclaration.CONTROLLER
   VariableDeclaration._operating
   VariableDeclaration._operatingController
   EventDefinition.MinterAllowanceUpdated
   EventDefinition.Mint
   EventDefinition.Burn
   EventDefinition.SwitchOperatingState
   ErrorDefinition.AlreadyMasterMinter
   ErrorDefinition.NotController
   ErrorDefinition.SafetySwitchOnUnauthorized
   ErrorDefinition.OperationsOff
   ErrorDefinition.NotMinter
   ErrorDefinition.mintingAllowedAmountExceeded
   ErrorDefinition.InvalidAmount
   FunctionDefinition.__ERC20ControlerMinter_init
   FunctionDefinition.__ERC20ControlerMinter_init_unchained
   FunctionDefinition.addController
   FunctionDefinition.removeController
   FunctionDefinition.isController
   FunctionDefinition.safetySwitch
   FunctionDefinition.isOperating
   FunctionDefinition.setMasterMinter
   FunctionDefinition.isMasterMinter
   FunctionDefinition.addMinter
   FunctionDefinition.removeMinter
   FunctionDefinition.updateMintingAllowance
   FunctionDefinition.getMinterAllowance
   FunctionDefinition.mint
   FunctionDefinition.burn
   
   Suggested order:
   VariableDeclaration.MINTER_ROLE
   VariableDeclaration.MASTER_MINTER
   VariableDeclaration.minterAllowed
   VariableDeclaration.CONTROLLER
   VariableDeclaration._operating
   VariableDeclaration._operatingController
   ErrorDefinition.AlreadyMasterMinter
   ErrorDefinition.NotController
   ErrorDefinition.SafetySwitchOnUnauthorized
   ErrorDefinition.OperationsOff
   ErrorDefinition.NotMinter
   ErrorDefinition.mintingAllowedAmountExceeded
   ErrorDefinition.InvalidAmount
   EventDefinition.MinterAllowanceUpdated
   EventDefinition.Mint
   EventDefinition.Burn
   EventDefinition.SwitchOperatingState
   FunctionDefinition.__ERC20ControlerMinter_init
   FunctionDefinition.__ERC20ControlerMinter_init_unchained
   FunctionDefinition.addController
   FunctionDefinition.removeController
   FunctionDefinition.isController
   FunctionDefinition.safetySwitch
   FunctionDefinition.isOperating
   FunctionDefinition.setMasterMinter
   FunctionDefinition.isMasterMinter
   FunctionDefinition.addMinter
   FunctionDefinition.removeMinter
   FunctionDefinition.updateMintingAllowance
   FunctionDefinition.getMinterAllowance
   FunctionDefinition.mint
   FunctionDefinition.burn

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

1: 
   Current order:
   VariableDeclaration._feesFaucet
   VariableDeclaration._txfeeRate
   VariableDeclaration._gaslessBasefee
   VariableDeclaration.FEE_RATIO
   EventDefinition.TxFeeRateUpdated
   EventDefinition.GaslessBasefeeUpdated
   EventDefinition.FeeFaucetUpdated
   EventDefinition.FeesPaid
   EventDefinition.GaslessBasefeePaid
   ErrorDefinition.InvalidFeeRate
   ErrorDefinition.NegativeBasefee
   FunctionDefinition.setFeeFaucet
   FunctionDefinition.setTxFeeRate
   FunctionDefinition.setGaslessBasefee
   FunctionDefinition.getTxFeeRate
   FunctionDefinition.getGaslessBasefee
   FunctionDefinition.calculateTxFee
   FunctionDefinition._payTxFee
   FunctionDefinition.payGaslessBasefee
   
   Suggested order:
   VariableDeclaration._feesFaucet
   VariableDeclaration._txfeeRate
   VariableDeclaration._gaslessBasefee
   VariableDeclaration.FEE_RATIO
   ErrorDefinition.InvalidFeeRate
   ErrorDefinition.NegativeBasefee
   EventDefinition.TxFeeRateUpdated
   EventDefinition.GaslessBasefeeUpdated
   EventDefinition.FeeFaucetUpdated
   EventDefinition.FeesPaid
   EventDefinition.GaslessBasefeePaid
   FunctionDefinition.setFeeFaucet
   FunctionDefinition.setTxFeeRate
   FunctionDefinition.setGaslessBasefee
   FunctionDefinition.getTxFeeRate
   FunctionDefinition.getGaslessBasefee
   FunctionDefinition.calculateTxFee
   FunctionDefinition._payTxFee
   FunctionDefinition.payGaslessBasefee

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

1: 
   Current order:
   StructDefinition.ForwardRequest
   UsingForDirective.ECDSA
   VariableDeclaration.GENERIC_PARAMS
   VariableDeclaration.typeHashes
   VariableDeclaration.nonces
   VariableDeclaration._eurf
   VariableDeclaration._eurfAddress
   EventDefinition.RequestTypeRegistered
   FunctionDefinition.receive
   FunctionDefinition.nonce
   FunctionDefinition.getEURF
   FunctionDefinition.initialize
   FunctionDefinition.verify
   FunctionDefinition.execute
   FunctionDefinition._verifyNonce
   FunctionDefinition._updateNonce
   FunctionDefinition.registerRequestType
   FunctionDefinition.registerRequestTypeInternal
   FunctionDefinition._verifySig
   FunctionDefinition._getEncoded
   
   Suggested order:
   UsingForDirective.ECDSA
   VariableDeclaration.GENERIC_PARAMS
   VariableDeclaration.typeHashes
   VariableDeclaration.nonces
   VariableDeclaration._eurf
   VariableDeclaration._eurfAddress
   StructDefinition.ForwardRequest
   EventDefinition.RequestTypeRegistered
   FunctionDefinition.receive
   FunctionDefinition.nonce
   FunctionDefinition.getEURF
   FunctionDefinition.initialize
   FunctionDefinition.verify
   FunctionDefinition.execute
   FunctionDefinition._verifyNonce
   FunctionDefinition._updateNonce
   FunctionDefinition.registerRequestType
   FunctionDefinition.registerRequestTypeInternal
   FunctionDefinition._verifySig
   FunctionDefinition._getEncoded

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

1: 
   Current order:
   VariableDeclaration.DECIMALS
   VariableDeclaration.OWNER
   ErrorDefinition.InvalidForwarder
   ErrorDefinition.BalanceTooLow
   ErrorDefinition.AlreadyOwner
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.decimals
   FunctionDefinition.setOwner
   FunctionDefinition.owner
   FunctionDefinition._authorizeUpgrade
   FunctionDefinition.setTrustedForwarder
   FunctionDefinition._msgSender
   FunctionDefinition._msgData
   FunctionDefinition.setFeeFaucet
   FunctionDefinition.setTxFeeRate
   FunctionDefinition._payTxFee
   FunctionDefinition.setGaslessBasefee
   FunctionDefinition.payGaslessBasefee
   FunctionDefinition.transferSanity
   FunctionDefinition.transfer
   FunctionDefinition.transferFrom
   FunctionDefinition.transferWithAuthorization
   VariableDeclaration.__gap
   
   Suggested order:
   VariableDeclaration.DECIMALS
   VariableDeclaration.OWNER
   VariableDeclaration.__gap
   ErrorDefinition.InvalidForwarder
   ErrorDefinition.BalanceTooLow
   ErrorDefinition.AlreadyOwner
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.decimals
   FunctionDefinition.setOwner
   FunctionDefinition.owner
   FunctionDefinition._authorizeUpgrade
   FunctionDefinition.setTrustedForwarder
   FunctionDefinition._msgSender
   FunctionDefinition._msgData
   FunctionDefinition.setFeeFaucet
   FunctionDefinition.setTxFeeRate
   FunctionDefinition._payTxFee
   FunctionDefinition.setGaslessBasefee
   FunctionDefinition.payGaslessBasefee
   FunctionDefinition.transferSanity
   FunctionDefinition.transfer
   FunctionDefinition.transferFrom
   FunctionDefinition.transferWithAuthorization

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-24"></a>[NC-24] Some require descriptions are not clear
1. It does not comply with the general require error description model of the project (Either all of them should be debugged in this way, or all of them should be explained with a string not exceeding 32 bytes.)
2. For debug dapps like Tenderly, these debug messages are important, this allows the user to see the reasons for revert practically.

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

131:             require(c != "(" && c != ")", "NGEUR Forwarder: invalid typename");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="NC-25"></a>[NC-25] Use Underscores for Number Literals (add an underscore every 3 digits)

*Instances (1)*:
```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

12:     uint256 constant FEE_RATIO = 10000;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

### <a name="NC-26"></a>[NC-26] Internal and private variables and functions names should begin with an underscore
According to the Solidity Style Guide, Non-`external` variable and function names should begin with an [underscore](https://docs.soliditylang.org/en/latest/style-guide.html#underscore-prefix-for-non-external-functions-and-variables)

*Instances (5)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

45:     function setBlacklist(address account, bool blacklisted) internal onlyRole(ADMIN) {

75:     function adminSanity(address from, address to) internal view {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

48:     mapping(address => uint256) private nonces;

138:     function registerRequestTypeInternal(string memory requestType) internal {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

156:     function transferSanity(address sender, address recipient, uint256 amount) internal {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-27"></a>[NC-27] Event is missing `indexed` fields
Index event fields make the field more quickly accessible to off-chain tools that parse events. However, note that each index field costs extra gas during emission, so it's not necessarily best to index the maximum allowed per event (three fields). Each event should use three indexed fields if there are three or more fields, and gas usage is not particularly of concern for the events in question. If there are fewer than three fields, all of the fields should be indexed.

*Instances (13)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

13:     event Blacklisted(address account, bool blacklisted);

21:     event ForcedTransfer(address indexed from, address indexed to, uint256 amount);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

18:     event MinterAllowanceUpdated(address indexed minter, uint256 minterAllowedAmount);

19:     event Mint(address indexed minter, address indexed to, uint256 amount);

20:     event Burn(address indexed minter, uint256 amount);

21:     event SwitchOperatingState(address indexed controler, bool state);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

21:     event TrustedForwarderUpdated(address newTrustedForwarder);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

14:     event TxFeeRateUpdated(uint256 newTxFeeRate);

15:     event GaslessBasefeeUpdated(uint256 newGaslessBasefee);

16:     event FeeFaucetUpdated(address newFeeFaucet);

17:     event FeesPaid(address indexed payer, uint256 fees);

18:     event GaslessBasefeePaid(address indexed payer, address indexed paymaster, uint256 basefee);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

53:     event RequestTypeRegistered(bytes32 indexed typeHash, string typeStr);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="NC-28"></a>[NC-28] Constants should be defined rather than using magic numbers

*Instances (1)*:
```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

140:                 sender := shr(96, calldataload(sub(calldatasize(), 20)))

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

### <a name="NC-29"></a>[NC-29] `override` function arguments that are unused should have the variable name removed or commented out to avoid compiler warnings

*Instances (1)*:
```solidity
File: ./contracts/Token.sol

87:     function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER) {}

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-30"></a>[NC-30] `public` functions not called by the contract should be declared `external` instead

*Instances (16)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

39:     function isAdministrator(address account) public view returns (bool) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

31:     function __ERC20ControlerMinter_init(string memory name, string memory symbol) public onlyInitializing {

55:     function isController(address account) public view returns (bool) {

64:     function safetySwitch() public {

82:     function isOperating() public view returns (bool, address) {

97:     function isMasterMinter(address account) public view returns (bool) {

136:     function getMinterAllowance(address minter) public view returns (uint256) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

98:     function nonce(address owner) public view returns (uint256) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

40:     function getTxFeeRate() public view returns (uint256) {

44:     function getGaslessBasefee() public view returns (uint256) {

52:     function calculateTxFee(uint256 txAmount) public view returns (uint256) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

58:     function nonce(address from) public view returns (uint256) {

62:     function getEURF() public view returns (address) {

66:     function initialize(address ngeurToken) public initializer {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

53:     function initialize() public initializer {

76:     function setOwner(address newOwner) public {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="NC-31"></a>[NC-31] Variables need not be initialized to zero
The default value for variables is zero, so initializing them to zero is superfluous.

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

129:         for (uint i = 0; i < bytes(typeName).length; i++) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)


## Low Issues


| |Issue|Instances|
|-|:-|:-:|
| [L-1](#L-1) | Use a 2-step ownership transfer pattern | 1 |
| [L-2](#L-2) | Missing checks for `address(0)` when assigning values to address state variables | 1 |
| [L-3](#L-3) | `abi.encodePacked()` should not be used with dynamic types when passing the result to a hash function such as `keccak256()` | 6 |
| [L-4](#L-4) | Do not leave an implementation contract uninitialized | 1 |
| [L-5](#L-5) | `domainSeparator()` isn't protected against replay attacks in case of a future chain split  | 8 |
| [L-6](#L-6) | Empty Function Body - Consider commenting why | 1 |
| [L-7](#L-7) | Empty `receive()/payable fallback()` function does not authenticate requests | 1 |
| [L-8](#L-8) | Initializers could be front-run | 16 |
| [L-9](#L-9) | Prevent accidentally burning tokens | 9 |
| [L-10](#L-10) | `pragma experimental ABIEncoderV2` is deprecated | 1 |
| [L-11](#L-11) | Loss of precision | 1 |
| [L-12](#L-12) | Solidity version 0.8.20+ may not work on other chains due to `PUSH0` | 2 |
| [L-13](#L-13) | Use `Ownable2Step.transferOwnership` instead of `Ownable.transferOwnership` | 1 |
| [L-14](#L-14) | Unsafe ERC20 operation(s) | 2 |
| [L-15](#L-15) | Upgradeable contract is missing a `__gap[50]` storage variable to allow for new storage variables in later versions | 30 |
| [L-16](#L-16) | Upgradeable contract not initialized | 45 |
### <a name="L-1"></a>[L-1] Use a 2-step ownership transfer pattern
Recommend considering implementing a two step process where the owner or admin nominates an account and the nominated account needs to call an `acceptOwnership()` function for the transfer of ownership to fully succeed. This ensures the nominated EOA account is a valid and active account. Lack of two-step procedure for critical operations leaves them error-prone. Consider adding two step procedure on the critical functions.

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

31: contract Forwarder is OwnableUpgradeable {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="L-2"></a>[L-2] Missing checks for `address(0)` when assigning values to address state variables

*Instances (1)*:
```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

24:         _feesFaucet = newFeeFaucet;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

### <a name="L-3"></a>[L-3] `abi.encodePacked()` should not be used with dynamic types when passing the result to a hash function such as `keccak256()`
Use `abi.encode()` instead which will pad items to 32 bytes, which will [prevent hash collisions](https://docs.soliditylang.org/en/v0.8.13/abi-spec.html#non-standard-packed-mode) (e.g. `abi.encodePacked(0x123,0x456)` => `0x123456` => `abi.encodePacked(0x1,0x23456)`, but `abi.encode(0x123,0x456)` => `0x0...1230...456`). "Unless there is a compelling reason, `abi.encode` should be preferred". If there is only one argument to `abi.encodePacked()` it can often be cast to `bytes()` or `bytes32()` [instead](https://ethereum.stackexchange.com/questions/30912/how-to-compare-strings-in-solidity#answer-82739).
If all arguments are strings and or bytes, `bytes.concat()` should be used instead

*Instances (6)*:
```solidity
File: ./contracts/Forwarder.sol

71:         string memory requestType = string(abi.encodePacked("ForwardRequest(", GENERIC_PARAMS, ")"));

112:         (success, ret) = req.to.call{gas: req.gas, value: req.value}(abi.encodePacked(req.data, req.from));

134:         string memory requestType = string(abi.encodePacked(typeName, "(", GENERIC_PARAMS, ",", typeSuffix));

153:             abi.encodePacked("\x19\x01", domainSeparator, keccak256(_getEncoded(req, requestTypeHash, suffixData)))

166:                 abi.encode(req.from, req.to, req.value, req.gas, req.nonce, keccak256(req.data)),

167:                 suffixData

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="L-4"></a>[L-4] Do not leave an implementation contract uninitialized
An uninitialized implementation contract can be taken over by an attacker, which may impact the proxy. To prevent the implementation contract from being used, it's advisable to invoke the `_disableInitializers` function in the constructor to automatically lock it when it is deployed. This should look similar to this:
```solidity
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
      _disableInitializers();
  }
```

Sources:
- https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable-_disableInitializers--
- https://twitter.com/0xCygaar/status/1621417995905167360?s=20

*Instances (1)*:
```solidity
File: ./contracts/Token.sol

51:     constructor() initializer {}

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="L-5"></a>[L-5] `domainSeparator()` isn't protected against replay attacks in case of a future chain split 
Severity: Low.
Description: See <https://eips.ethereum.org/EIPS/eip-2612#security-considerations>.
Remediation: Consider using the [implementation](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/EIP712.sol#L77-L90) from OpenZeppelin, which recalculates the domain separator if the current `block.chainid` is not the cached chain ID.
Past occurrences of this issue:
- [Reality Cards Contest](https://github.com/code-423n4/2021-06-realitycards-findings/issues/166)
- [Swivel Contest](https://github.com/code-423n4/2021-09-swivel-findings/issues/98)
- [Malt Finance Contest](https://github.com/code-423n4/2021-11-malt-findings/issues/349)

*Instances (8)*:
```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

106:     function DOMAIN_SEPARATOR() external view returns (bytes32) {

107:         return _domainSeparatorV4();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

79:         bytes32 domainSeparator,

85:         _verifySig(req, domainSeparator, requestTypeHash, suffixData, sig);

95:         bytes32 domainSeparator,

101:         _verifySig(req, domainSeparator, requestTypeHash, suffixData, sig);

146:         bytes32 domainSeparator,

153:             abi.encodePacked("\x19\x01", domainSeparator, keccak256(_getEncoded(req, requestTypeHash, suffixData)))

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="L-6"></a>[L-6] Empty Function Body - Consider commenting why

*Instances (1)*:
```solidity
File: ./contracts/Token.sol

87:     function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER) {}

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="L-7"></a>[L-7] Empty `receive()/payable fallback()` function does not authenticate requests
If the intention is for the Ether to be used, the function should call another function, otherwise it should revert (e.g. require(msg.sender == address(weth))). Having no access control on the function means that someone may send Ether to the contract, and have no way to get anything back out, which is a loss of funds. If the concern is having to spend a small amount of gas to check the sender against an immutable address, the code should at least have a function to rescue unused Ether.

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

56:     receive() external payable {}

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="L-8"></a>[L-8] Initializers could be front-run
Initializers could be front-run, allowing an attacker to either set their own values, take ownership of the contract, and in the best case forcing a re-deployment

*Instances (16)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

23:     function __ERC20Admin_init(string memory name, string memory symbol) internal onlyInitializing {

24:         __ERC20_init(name, symbol);

25:         __Pausable_init();

26:         __AccessControlEnumerable_init();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

31:     function __ERC20ControlerMinter_init(string memory name, string memory symbol) public onlyInitializing {

32:         __ERC20_init(name, symbol);

33:         __AccessControlEnumerable_init();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

29:     function __ERC20MetaTx_init(string memory name) internal onlyInitializing {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

66:     function initialize(address ngeurToken) public initializer {

67:         __Ownable_init(_msgSender());

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

51:     constructor() initializer {}

53:     function initialize() public initializer {

54:         __UUPSUpgradeable_init();

55:         __Pausable_init();

56:         __AccessControlEnumerable_init();

60:         __EIP712_init("EURF", "1");

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="L-9"></a>[L-9] Prevent accidentally burning tokens
Minting and burning tokens to address(0) prevention

*Instances (9)*:
```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

108:         grantRole(MINTER_ROLE, minter);

109:         emit MinterAllowanceUpdated(minter, minterAllowedAmount);

118:         revokeRole(MINTER_ROLE, minter);

119:         emit MinterAllowanceUpdated(minter, 0);

131:         if (!hasRole(MINTER_ROLE, minter)) revert NotMinter(minter);

133:         emit MinterAllowanceUpdated(minter, minterAllowedAmount);

155:             if (amount > mintingAllowedAmount) revert mintingAllowedAmountExceeded(amount, mintingAllowedAmount);

159:         _mint(to, amount);

173:         _burn(_msgSender(), amount);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

### <a name="L-10"></a>[L-10] `pragma experimental ABIEncoderV2` is deprecated
Use `pragma abicoder v2` [instead](https://github.com/ethereum/solidity/blob/69411436139acf5dbcfc5828446f18b9fcfee32c/docs/080-breaking-changes.rst#silent-changes-of-the-semantics)

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

25: pragma experimental ABIEncoderV2;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="L-11"></a>[L-11] Loss of precision
Division by large numbers may result in the result being zero, due to solidity not supporting fractions. Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator

*Instances (1)*:
```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

53:         return (txAmount * _txfeeRate) / FEE_RATIO;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

### <a name="L-12"></a>[L-12] Solidity version 0.8.20+ may not work on other chains due to `PUSH0`
The compiler for Solidity 0.8.20 switches the default target EVM version to [Shanghai](https://blog.soliditylang.org/2023/05/10/solidity-0.8.20-release-announcement/#important-note), which includes the new `PUSH0` op code. This op code may not yet be implemented on all L2s, so deployment on these chains will fail. To work around this issue, use an earlier [EVM](https://docs.soliditylang.org/en/v0.8.20/using-the-compiler.html?ref=zaryabs.com#setting-the-evm-version-to-target) [version](https://book.getfoundry.sh/reference/config/solidity-compiler#evm_version). While the project itself may or may not compile with 0.8.20, other projects with which it integrates, or which extend this project may, and those projects will have problems deploying these contracts/libraries.

*Instances (2)*:
```solidity
File: ./contracts/Forwarder.sol

24: pragma solidity ^0.8.20;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

25: pragma solidity ^0.8.20;

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="L-13"></a>[L-13] Use `Ownable2Step.transferOwnership` instead of `Ownable.transferOwnership`
Use [Ownable2Step.transferOwnership](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable2Step.sol) which is safer. Use it as it is more secure due to 2-stage ownership transfer.

**Recommended Mitigation Steps**

Use <a href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable2Step.sol">Ownable2Step.sol</a>
  
  ```solidity
      function acceptOwnership() external {
          address sender = _msgSender();
          require(pendingOwner() == sender, "Ownable2Step: caller is not the new owner");
          _transferOwnership(sender);
      }
```

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

28: import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

### <a name="L-14"></a>[L-14] Unsafe ERC20 operation(s)

*Instances (2)*:
```solidity
File: ./contracts/Token.sol

163:         return super.transfer(recipient, amount);

168:         return super.transferFrom(sender, recipient, amount);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="L-15"></a>[L-15] Upgradeable contract is missing a `__gap[50]` storage variable to allow for new storage variables in later versions
See [this](https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps) link for a description of this storage variable. While some contracts may not currently be sub-classed, adding the variable now protects against forgetting to add it in the future.

*Instances (30)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

5: import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

6: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

8: abstract contract ERC20AdminUpgradeable is ERC20Upgradeable, PausableUpgradeable, AccessControlEnumerableUpgradeable {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

5: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

7: abstract contract ERC20ControlerMinterUpgradeable is ERC20Upgradeable, AccessControlEnumerableUpgradeable {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

6: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

8: abstract contract ERC20MetaTxUpgradeable is ERC20Upgradeable, EIP712Upgradeable {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

5: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

7: abstract contract FeesHandlerUpgradeable is Initializable {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

28: import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

31: contract Forwarder is OwnableUpgradeable {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

27: import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

28: import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

30: import {ERC20MetaTxUpgradeable} from "./ERC20MetaTxUpgradeable.sol";

31: import {ERC20AdminUpgradeable} from "./ERC20AdminUpgradeable.sol";

32: import {ERC20ControlerMinterUpgradeable} from "./ERC20ControlerMinterUpgradeable.sol";

33: import {FeesHandlerUpgradeable} from "./FeesHandlerUpgradeable.sol";

36:     ERC20MetaTxUpgradeable,

37:     ERC20AdminUpgradeable,

38:     ERC20ControlerMinterUpgradeable,

39:     FeesHandlerUpgradeable,

40:     UUPSUpgradeable

54:         __UUPSUpgradeable_init();

95:     function _msgSender() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (address sender) {

96:         return ERC20MetaTxUpgradeable._msgSender();

99:     function _msgData() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (bytes calldata) {

100:         return ERC20MetaTxUpgradeable._msgData();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="L-16"></a>[L-16] Upgradeable contract not initialized
Upgradeable contracts are initialized via an initializer function rather than by a constructor. Leaving such a contract uninitialized may lead to it being taken over by a malicious user

*Instances (45)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

5: import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

6: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

8: abstract contract ERC20AdminUpgradeable is ERC20Upgradeable, PausableUpgradeable, AccessControlEnumerableUpgradeable {

23:     function __ERC20Admin_init(string memory name, string memory symbol) internal onlyInitializing {

24:         __ERC20_init(name, symbol);

25:         __Pausable_init();

26:         __AccessControlEnumerable_init();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

5: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

7: abstract contract ERC20ControlerMinterUpgradeable is ERC20Upgradeable, AccessControlEnumerableUpgradeable {

31:     function __ERC20ControlerMinter_init(string memory name, string memory symbol) public onlyInitializing {

32:         __ERC20_init(name, symbol);

33:         __AccessControlEnumerable_init();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/ERC20MetaTxUpgradeable.sol

4: import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

6: import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

8: abstract contract ERC20MetaTxUpgradeable is ERC20Upgradeable, EIP712Upgradeable {

29:     function __ERC20MetaTx_init(string memory name) internal onlyInitializing {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20MetaTxUpgradeable.sol)

```solidity
File: ./contracts/FeesHandlerUpgradeable.sol

5: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

7: abstract contract FeesHandlerUpgradeable is Initializable {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/FeesHandlerUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

28: import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

31: contract Forwarder is OwnableUpgradeable {

66:     function initialize(address ngeurToken) public initializer {

67:         __Ownable_init(_msgSender());

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

27: import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

28: import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

30: import {ERC20MetaTxUpgradeable} from "./ERC20MetaTxUpgradeable.sol";

31: import {ERC20AdminUpgradeable} from "./ERC20AdminUpgradeable.sol";

32: import {ERC20ControlerMinterUpgradeable} from "./ERC20ControlerMinterUpgradeable.sol";

33: import {FeesHandlerUpgradeable} from "./FeesHandlerUpgradeable.sol";

36:     ERC20MetaTxUpgradeable,

37:     ERC20AdminUpgradeable,

38:     ERC20ControlerMinterUpgradeable,

39:     FeesHandlerUpgradeable,

40:     UUPSUpgradeable

51:     constructor() initializer {}

53:     function initialize() public initializer {

54:         __UUPSUpgradeable_init();

55:         __Pausable_init();

56:         __AccessControlEnumerable_init();

60:         __EIP712_init("EURF", "1");

95:     function _msgSender() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (address sender) {

96:         return ERC20MetaTxUpgradeable._msgSender();

99:     function _msgData() internal view override(ERC20MetaTxUpgradeable, ContextUpgradeable) returns (bytes calldata) {

100:         return ERC20MetaTxUpgradeable._msgData();

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)


## Medium Issues


| |Issue|Instances|
|-|:-|:-:|
| [M-1](#M-1) | Centralization Risk for trusted owners | 12 |
| [M-2](#M-2) | Fees can be set to be greater than 100%. | 3 |
| [M-3](#M-3) | Lack of EIP-712 compliance: using `keccak256()` directly on an array or struct variable | 1 |
### <a name="M-1"></a>[M-1] Centralization Risk for trusted owners

#### Impact:
Contracts have owners with privileged rights to perform admin tasks and need to be trusted to not perform malicious updates or drain funds.

*Instances (12)*:
```solidity
File: ./contracts/ERC20AdminUpgradeable.sol

34:     function setAdministrator(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {

45:     function setBlacklist(address account, bool blacklisted) internal onlyRole(ADMIN) {

65:     function pause() external onlyRole(ADMIN) {

69:     function unpause() external onlyRole(ADMIN) {

84:     function forceTransfer(address from, address to, uint256 amount) external onlyRole(ADMIN) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20AdminUpgradeable.sol)

```solidity
File: ./contracts/ERC20ControlerMinterUpgradeable.sol

130:     ) external virtual onlyRole(MASTER_MINTER) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/ERC20ControlerMinterUpgradeable.sol)

```solidity
File: ./contracts/Forwarder.sol

128:     function registerRequestType(string calldata typeName, string calldata typeSuffix) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

```solidity
File: ./contracts/Token.sol

87:     function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER) {}

91:     function setTrustedForwarder(address trustedForwarder) public override onlyRole(ADMIN) {

109:     function setFeeFaucet(address feesFaucet) public override onlyRole(ADMIN) {

117:     function setTxFeeRate(uint256 newRate) public override onlyRole(ADMIN) {

137:     function setGaslessBasefee(uint256 newBaseFee) public override onlyRole(ADMIN) {

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="M-2"></a>[M-2] Fees can be set to be greater than 100%.
There should be an upper limit to reasonable fees.
A malicious owner can keep the fee rate at zero, but if a large value transfer enters the mempool, the owner can jack the rate up to the maximum and sandwich attack a user.

*Instances (3)*:
```solidity
File: ./contracts/Token.sol

109:     function setFeeFaucet(address feesFaucet) public override onlyRole(ADMIN) {
             super.setFeeFaucet(feesFaucet);

117:     function setTxFeeRate(uint256 newRate) public override onlyRole(ADMIN) {
             super.setTxFeeRate(newRate);

137:     function setGaslessBasefee(uint256 newBaseFee) public override onlyRole(ADMIN) {
             super.setGaslessBasefee(newBaseFee);

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Token.sol)

### <a name="M-3"></a>[M-3] Lack of EIP-712 compliance: using `keccak256()` directly on an array or struct variable
Directly using the actual variable instead of encoding the array values goes against the EIP-712 specification https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-encodedata. 
**Note**: OpenSea's [Seaport's example with offerHashes and considerationHashes](https://github.com/ProjectOpenSea/seaport/blob/a62c2f8f484784735025d7b03ccb37865bc39e5a/reference/lib/ReferenceGettersAndDerivers.sol#L130-L131) can be used as a reference to understand how array of structs should be encoded.

*Instances (1)*:
```solidity
File: ./contracts/Forwarder.sol

153:             abi.encodePacked("\x19\x01", domainSeparator, keccak256(_getEncoded(req, requestTypeHash, suffixData)))

```
[Link to code](https://github.com/code-423n4/2025-01-next-generation/blob/main/./contracts/Forwarder.sol)

