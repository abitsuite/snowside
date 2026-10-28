// contracts/deployments/dex/src/MockERC20.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockERC20 — placeholder token for pre-ICTT DEX bootstrap on Snowside.
/// @dev Minimal ERC-20 with owner-gated mint. Used for MockUSDC / MockBTCb until
///      real ICTT-bridged USDC / BTC.b land on Snowside. NOT the real asset.
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public immutable decimals;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "MockERC20: not owner");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply, address _initialHolder) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
        if (_initialSupply > 0) {
            _mint(_initialHolder, _initialSupply);
        }
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= value, "MockERC20: allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 value) external onlyOwner {
        _mint(to, value);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "MockERC20: zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "MockERC20: to zero");
        require(balanceOf[from] >= value, "MockERC20: balance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }

    function _mint(address to, uint256 value) internal {
        require(to != address(0), "MockERC20: mint to zero");
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
}
