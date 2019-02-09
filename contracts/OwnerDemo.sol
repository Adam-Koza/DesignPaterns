pragma solidity ^0.5.0;

contract OwnerDemo {
    address public _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor () public {
        _owner = msg.sender;
        emit OwnershipTransferred(address(this), _owner);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(isOwner(), ".");
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(this));
        _owner = address(this);
    }

    function transferOwner(address newOwner) public onlyOwner {
        _transferOwner(newOwner);
    }

    function _transferOwner(address newOwner) internal {
        require(newOwner != address(this), ".");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}