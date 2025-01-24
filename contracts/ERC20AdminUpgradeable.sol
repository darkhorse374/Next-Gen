// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

abstract contract ERC20AdminUpgradeable is ERC20Upgradeable, PausableUpgradeable, AccessControlEnumerableUpgradeable {
    bytes32 public constant ADMIN = keccak256("ADMIN");

    mapping(address => bool) private _blacklist;

    event Blacklisted(address account, bool blacklisted);

    error PausedError();
    error BlacklistUnchangedError(address account, bool blacklisted);
    error SenderBlacklistedError(address account);
    error RecipientBlacklistedError(address account);
    error TransferToContractError();

    event ForcedTransfer(address indexed from, address indexed to, uint256 amount);

    function __ERC20Admin_init(string memory name, string memory symbol) internal onlyInitializing {
        __ERC20_init(name, symbol);
        __Pausable_init();
        __AccessControlEnumerable_init();
        __ERC20Admin_init_unchained();
    }

    function __ERC20Admin_init_unchained() internal onlyInitializing {
        _grantRole(ADMIN, address(0));
    }

    function setAdministrator(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN, getRoleMember(ADMIN, 0));
        grantRole(ADMIN, newAdmin);
    }

    function isAdministrator(address account) public view returns (bool) {
        return hasRole(ADMIN, account);
    }

    //-------------------------- BLACKLIST LOGIC --------------------------

    function setBlacklist(address account, bool blacklisted) internal onlyRole(ADMIN) {
        if (_blacklist[account] == blacklisted) revert BlacklistUnchangedError(account, blacklisted);
        _blacklist[account] = blacklisted;
        emit Blacklisted(account, blacklisted);
    }

    function blacklist(address account) external {
        setBlacklist(account, true);
    }

    function unblacklist(address account) external {
        setBlacklist(account, false);
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklist[account];
    }

    //-------------------------- PAUSE LOGIC -----------------------------

    function pause() external onlyRole(ADMIN) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN) {
        _unpause();
    }

    //-------------------------- TRANSFER LOGIC --------------------------

    function adminSanity(address from, address to) internal view {
        if (!hasRole(ADMIN, _msgSender())) {
            if (paused()) revert PausedError();
            if (isBlacklisted(from)) revert SenderBlacklistedError(from);
        }
        if (isBlacklisted(to)) revert RecipientBlacklistedError(to);
        if (to == address(this)) revert TransferToContractError();
    }

    function forceTransfer(address from, address to, uint256 amount) external onlyRole(ADMIN) {
        adminSanity(from, to);
        _update(from, to, amount);
        emit ForcedTransfer(from, to, amount);
    }
}
