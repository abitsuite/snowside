# BMM Bidder

Rust-based Blind Merged Mining (BMM) bidder and settlement monitor for
the Snowside L1.

## Purpose

The BMM bidder:

1. Monitors the BMM coordination precompile on Snowside for pending
   block aggregates
2. Computes the Merkle root of pending block hashes
3. Constructs and submits BMM Requests to the eCash L1
4. Monitors eCash for BMM Accepts
5. Calls confirmSettlement() on the precompile when settlement is
   accepted

## Quick Start

    # Copy the example config
    cp config.example.toml config.toml

    # Edit config.toml with your RPC endpoints and wallet settings

    # Run the daemon
    cargo run -- run --config config.toml

## Development

    # Build
    cargo build

    # Run tests
    cargo test

    # Check formatting
    cargo fmt -- --check

    # Run linter
    cargo clippy

## License

MIT
