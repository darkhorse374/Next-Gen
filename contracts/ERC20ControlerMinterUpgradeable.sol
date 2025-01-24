// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

abstract contract ERC20ControlerMinterUpgradeable is ERC20Upgradeable, AccessControlEnumerableUpgradeable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MASTER_MINTER = keccak256("MASTER_MINTER");

    mapping(address => uint256) public minterAllowed;

    bytes32 public constant CONTROLLER = keccak256("CONTROLLER");

    bool public _operating;
    address internal _operatingController;

    event MinterAllowanceUpdated(address indexed minter, uint256 minterAllowedAmount);
    event Mint(address indexed minter, address indexed to, uint256 amount);
    event Burn(address indexed minter, uint256 amount);
    event SwitchOperatingState(address indexed controler, bool state);

    error AlreadyMasterMinter(address account);
    error NotController(address account);
    error SafetySwitchOnUnauthorized(address account);
    error OperationsOff();
    error NotMinter(address account);
    error mintingAllowedAmountExceeded(uint256 amount, uint256 mintingAllowedAmount);
    error InvalidAmount(uint256 amount);

    function __ERC20ControlerMinter_init(string memory name, string memory symbol) public onlyInitializing {
        __ERC20_init(name, symbol);
        __AccessControlEnumerable_init();
        __ERC20ControlerMinter_init_unchained();
    }

    function __ERC20ControlerMinter_init_unchained() internal onlyInitializing {
        _setRoleAdmin(MINTER_ROLE, MASTER_MINTER);
        _grantRole(MASTER_MINTER, address(0));

        _operating = true;
        _operatingController = address(0);
    }

    //-------------------------- CONTROLLER LOGIC --------------------------

    function addController(address newController) external {
        grantRole(CONTROLLER, newController);
    }

    function removeController(address controller) external {
        revokeRole(CONTROLLER, controller);
    }

    function isController(address account) public view returns (bool) {
        return hasRole(CONTROLLER, account);
    }

    /**
     * @dev Function to toggle the operating state of the contract.
     * When called by a CONTROLLER, it switches the contract between operating and non-operating states.
     * In non-operating state, certain functions are disabled (e.g., minting and burning).
     */
    function safetySwitch() public {
        if (_operating) {
            if (!hasRole(CONTROLLER, _msgSender())) revert NotController(_msgSender());
            _operating = false;
            _operatingController = _msgSender();
        } else {
            if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) && _operatingController != _msgSender())
                revert SafetySwitchOnUnauthorized(_msgSender());
            _operating = true;
            _operatingController = address(0);
        }
        emit SwitchOperatingState(_msgSender(), _operating);
    }

    /**
     * @dev Function to check the current operating state of the contract.
     * Returns a tuple containing the operating status, the controler who switched the state, and the lock time.
     */
    function isOperating() public view returns (bool, address) {
        return (_operating, _operatingController);
    }

    //-------------------------- MINTING LOGIC --------------------------

    function setMasterMinter(address newMasterMinter) external {
        address formerMasterMinter = getRoleMember(MASTER_MINTER, 0);
        if (formerMasterMinter == newMasterMinter) revert AlreadyMasterMinter(newMasterMinter);
        revokeRole(MASTER_MINTER, formerMasterMinter);
        emit MinterAllowanceUpdated(formerMasterMinter, 0);
        grantRole(MASTER_MINTER, newMasterMinter);
        emit MinterAllowanceUpdated(newMasterMinter, type(uint256).max);
    }

    function isMasterMinter(address account) public view returns (bool) {
        return hasRole(MASTER_MINTER, account);
    }

    /**
     * @dev Function to add/update a new minter
     * @param minter The address of the minter
     * @param minterAllowedAmount The minting amount allowed for the minter
     */
    function addMinter(address minter, uint256 minterAllowedAmount) external {
        minterAllowed[minter] = minterAllowedAmount;
        grantRole(MINTER_ROLE, minter);
        emit MinterAllowanceUpdated(minter, minterAllowedAmount);
    }

    /**
     * @dev Function to remove a minter
     * @param minter The address of the minter to remove
     */
    function removeMinter(address minter) external {
        minterAllowed[minter] = 0;
        revokeRole(MINTER_ROLE, minter);
        emit MinterAllowanceUpdated(minter, 0);
    }

    /**
     * @dev Function to update the minting allowance of a minter
     * @param minter The address of the minter
     * @param minterAllowedAmount The new minting amount allowed for the minter
     */
    function updateMintingAllowance(
        address minter,
        uint256 minterAllowedAmount
    ) external virtual onlyRole(MASTER_MINTER) {
        if (!hasRole(MINTER_ROLE, minter)) revert NotMinter(minter);
        minterAllowed[minter] = minterAllowedAmount;
        emit MinterAllowanceUpdated(minter, minterAllowedAmount);
    }

    function getMinterAllowance(address minter) public view returns (uint256) {
        return minterAllowed[minter];
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint. Must be less than or equal
     * to the minterAllowance of the caller.
     */
    function mint(address to, uint256 amount) public virtual {
        if (!hasRole(MASTER_MINTER, _msgSender()) && !hasRole(MINTER_ROLE, _msgSender()))
            revert NotMinter(_msgSender());
        if (amount <= 0) revert InvalidAmount(amount);
        if (!_operating) revert OperationsOff();

        // MINTER_ROLE allowance management
        if (hasRole(MINTER_ROLE, _msgSender())) {
            uint256 mintingAllowedAmount = minterAllowed[_msgSender()];
            if (amount > mintingAllowedAmount) revert mintingAllowedAmountExceeded(amount, mintingAllowedAmount);
            minterAllowed[_msgSender()] = mintingAllowedAmount - amount;
        }

        _mint(to, amount);
        emit Mint(_msgSender(), to, amount);
    }

    /**
     * @dev allows a minter to burn some of its own tokens
     * Validates that caller is a minter and that sender is not blacklisted
     * amount is less than or equal to the minter's account balance
     * @param amount uint256 the amount of tokens to be burned
     */
    function burn(uint256 amount) public virtual {
        if (!hasRole(MASTER_MINTER, _msgSender()) && !hasRole(MINTER_ROLE, _msgSender()))
            revert NotMinter(_msgSender());
        if (!_operating) revert OperationsOff();
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount);
    }
}
