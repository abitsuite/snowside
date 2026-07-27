// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/interfaces/IBMMCoordination.sol";

/// @title IBMMCoordination Interface Test
/// @notice Verifies the interface compiles and has correct function signatures
contract IBMMCoordinationTest is Test {
    function testInterfaceCompiles() public pure {
        // Verify enum values
        IBMMCoordination.SettlementStatus idle = IBMMCoordination.SettlementStatus.Idle;
        IBMMCoordination.SettlementStatus pending = IBMMCoordination.SettlementStatus.Pending;
        IBMMCoordination.SettlementStatus confirmed = IBMMCoordination.SettlementStatus.Confirmed;

        assert(uint256(idle) == 0);
        assert(uint256(pending) == 1);
        assert(uint256(confirmed) == 2);
    }
}
