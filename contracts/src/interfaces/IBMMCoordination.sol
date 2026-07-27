// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IBMMCoordination
/// @notice Interface for the BMM coordination precompile (implemented in Go)
/// @dev This interface mirrors the Go precompile functions. The precompile
///      address will be assigned during Subnet-EVM configuration.
interface IBMMCoordination {
    /// @notice Status of the current settlement attempt
    enum SettlementStatus {
        Idle,       // No pending settlement
        Pending,    // BMM Request submitted, waiting for eCash acceptance
        Confirmed   // eCash has accepted the BMM Request
    }

    /// @notice A pending block waiting to be included in an aggregate
    struct PendingBlock {
        bytes32 blockHash;     // Hash of the finalized Snowside block
        uint256 baseFeeAmount; // Escrowed Base Fees (in satoshis)
        uint256 blockNumber;   // Snowside block number
    }

    /// @notice Called by validators when a block is finalized
    /// @dev Escrows the Base Fees and updates the Merkle root
    /// @param blockHash Hash of the finalized block
    /// @param baseFeeAmount Amount of Base Fees to escrow (in satoshis)
    function submitBlock(bytes32 blockHash, uint256 baseFeeAmount) external;

    /// @notice Called by proposers to initiate a BMM Request
    /// @dev Emits an event that the BMM bidder software listens for
    /// @param expectedMerkleRoot Current Merkle root of pending blocks
    /// @param prevMainBlock Hash of the previous eCash block
    function proposeSettlement(bytes32 expectedMerkleRoot, bytes32 prevMainBlock) external;

    /// @notice Called by proposer to update the aggregate with new blocks
    /// @dev Allows including blocks produced during a pending settlement
    /// @param newMerkleRoot Updated Merkle root including new blocks
    function updateAggregate(bytes32 newMerkleRoot) external;

    /// @notice Called when eCash confirms a BMM Accept
    /// @dev Releases escrowed fees to the proposer
    /// @param ecashBlockHeight The eCash block height where BMM was accepted
    /// @param acceptedHash The Merkle root that was accepted
    function confirmSettlement(uint256 ecashBlockHeight, bytes32 acceptedHash) external;

    /// @notice Returns the current settlement status
    /// @return status Current settlement status
    /// @return merkleRoot Current Merkle root of pending blocks
    /// @return totalEscrowed Total escrowed Base Fees (in satoshis)
    /// @return pendingCount Number of pending blocks in the aggregate
    function getSettlementStatus()
        external
        view
        returns (SettlementStatus status, bytes32 merkleRoot, uint256 totalEscrowed, uint256 pendingCount);
}
