pragma solidity ^0.5.16;

import "./Roles.sol";

contract FarmerRole {
    using Roles for Roles.Role;

    event FarmerAdded(address indexed account);
    event FarmerRemoved(address indexed account);

    Roles.Role private farmers;

    constructor() public {
        _addFarmer(msg.sender);
    }

    modifier onlyFarmer() {
        require(isFarmer(msg.sender));
        _;
    }

    function isFarmer(address account) public view returns (bool) {
        return farmers.has(account);
    }

    function addFarmer(address account) public onlyFarmer {
        _addFarmer(account);
    }

    function renounceFarmer() public {
        _removeFarmer(msg.sender);
    }

    function _addFarmer(address account) internal {
        farmers.add(account);
        emit FarmerAdded(account);
    }

    function _removeFarmer(address account) internal {
        farmers.remove(account);
        emit FarmerRemoved(account);
    }
}
