// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

abstract contract ERC20MetaTxUpgradeable is ERC20Upgradeable, EIP712Upgradeable {
    mapping(address => uint256) private _nonces;

    // solhint-disable-next-line var-name-mixedcase
    bytes32 private _PERMIT_TYPEHASH;
    bytes32 private _TWA_TYPEHASH;

    address private _trustedForwarder;

    error DeadLineExpired(uint256 deadline);
    error InvalidSignature();
    error InvalidZeroAddress();

    event TrustedForwarderUpdated(address newTrustedForwarder);

    /**
     * @dev Initializes the {EIP712} domain separator using the `name` parameter, and setting `version` to `"1"`.
     *
     * It's a good idea to use the same `name` that is defined as the ERC20 token name.
     */

    function __ERC20MetaTx_init(string memory name) internal onlyInitializing {
        __Context_init_unchained();
        __EIP712_init_unchained(name, "1");
        __ERC20MetaTx_init_unchained();
    }

    function __ERC20MetaTx_init_unchained() internal onlyInitializing {
        _PERMIT_TYPEHASH = keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );
        _TWA_TYPEHASH = keccak256(
            "TransferWithAuthorization(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );
        _trustedForwarder = address(0);
    }

    /**
     * @dev permit function approves if valid signed permit is provided.
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual {
        if (block.timestamp > deadline) revert DeadLineExpired(deadline);

        bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPEHASH, owner, spender, value, _useNonce(owner), deadline));

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, v, r, s);
        if (signer != owner) revert InvalidSignature();

        _approve(owner, spender, value);
    }

    /**
     * @dev transferWithAuthorization function transferWithAuthorization if valid signed twa is provided.
     */
    function transferWithAuthorization(
        address holder,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual returns (bool) {
        if (block.timestamp > deadline) revert DeadLineExpired(deadline);

        bytes32 structHash = keccak256(abi.encode(_TWA_TYPEHASH, holder, spender, value, _useNonce(holder), deadline));

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, v, r, s);
        if (signer != holder) revert InvalidSignature();

        _update(holder, spender, value);

        return true;
    }

    /**
     * @dev returns nounce.
     */
    function nonce(address owner) public view returns (uint256) {
        return _nonces[owner];
    }

    /**
     * @dev See {IERC20Permit-DOMAIN_SEPARATOR}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @dev "Consume a nonce": return the current value and increment.
     *
     */
    function _useNonce(address owner) internal virtual returns (uint256 current) {
        current = _nonces[owner];
        _nonces[owner] = current + 1;
    }

    /**
     * @dev Function to update trustedForwarder
     * @param trustedForwarder Address of new trustedForwarder
     */
    function setTrustedForwarder(address trustedForwarder) public virtual {
        if (trustedForwarder == address(0)) revert InvalidZeroAddress();
        _trustedForwarder = trustedForwarder;
        emit TrustedForwarderUpdated(_trustedForwarder);
    }

    /**
     * @dev Function to check if caller is a trusted Forwarder
     * @param forwarder The address of the forwarder
     */
    function isTrustedForwarder(address forwarder) public view returns (bool) {
        return forwarder == _trustedForwarder;
    }

    function _msgSender() internal view virtual override returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }
}
