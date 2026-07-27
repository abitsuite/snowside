# Snowside Subnet-EVM

A fork of [Avalanche's Subnet-EVM](https://github.com/ava-labs/subnet-evm)
modified for Snowside — a dedicated Avalanche Layer-1 for the eCash
hard-fork.

## Modifications

This fork will add a BMM (Blind Merged Mining) coordination precompile
that manages:

- Pending block aggregation (Merkle root computation)
- Fee escrow (Base Fees locked until settlement)
- Settlement state tracking (Idle, Pending, Confirmed)
- Proposer coordination (BMM Request emission, settlement confirmation)

## Upstream Source

Copied from: ava-labs/subnet-evm
Commit hash: see .upstream-commit file

Upstream updates will be applied manually as needed.

## Build

    make build

The binary will be output to ./build/.

## Development

This is a Go project. See the upstream Subnet-EVM documentation for
detailed development instructions:

https://github.com/ava-labs/subnet-evm#readme

## License

This code is derived from Subnet-EVM (licensed under the BSD 3-Clause
License). See LICENSE in this directory for the upstream license terms.
Snowside modifications are licensed under the MIT License.
