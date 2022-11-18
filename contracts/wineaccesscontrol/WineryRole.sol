// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Import the library 'Roles'
import "./Roles.sol";

contract WineryRole {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event WineryAdded(address indexed account);
    event WineryRemoved(address indexed account);

    // Define a struct 'wineries' by inheriting from 'Roles' library, struct Role
    Roles.Role private wineries;

    // In the constructor make the address that deploys this contract the 1st farmer
    constructor() {
        _addWinery(msg.sender);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyWinery() {
        require(isWinery(msg.sender));
        _;
    }

    // Define a function 'isWinery' to check this role
    function isWinery(address account) public view returns (bool) {
        return wineries.has(account);
    }

    // Define a function 'addWinery' that adds this role
    function addWinery(address account) public onlyWinery {
        _addWinery(account);
    }

    // Define a function 'renounceWinery' to renounce this role
    function renounceWinery() public {
        _removeWinery(msg.sender);
    }

    // Define an internal function '_addWinery' to add this role, called by 'addWinery'
    function _addWinery(address account) internal {
        wineries.add(account);
        emit WineryAdded(account);
    }

    // Define an internal function '_removeWinery' to remove this role, called by 'removeWinery'
    function _removeWinery(address account) internal {
        wineries.remove(account);
        emit WineryRemoved(account);
    }
}
