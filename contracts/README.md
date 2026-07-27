# Snowside Smart Contracts

Solidity smart contracts for the Snowside L1, managed with Foundry.

## Contracts

### src/interfaces/IBMMCoordination.sol
Interface for the BMM coordination precompile (implemented in Go within
Subnet-EVM). Solidity contracts use this interface to call the precompile.

### src/peg/Peg.sol
Handles BTC deposits and withdrawals between eCash L1 and Snowside L2.
Integrates with BIP300/BIP301 deposit and withdrawal processes.

### src/fees/FeeDistribution.sol
Handles distribution of Contract Fees between contract deployers and
the validator set.

## Quick Start

    # Install dependencies (forge-std is already included)
    forge install

    # Build contracts
    forge build

    # Run tests
    forge test

    # Format contracts
    forge fmt

## License

MIT
