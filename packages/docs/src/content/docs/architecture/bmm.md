---
title: Blind Merged Mining
description: How Bitcoin miners secure Snowside via BIP-301 without running a full node
---

Blind Merged Mining (BMM) is the mechanism by which Bitcoin miners secure Snowside
without running a full Snowside node. It is defined in BIP-301 and activates as part
of the eCash Drivechain (BIP-300/301) hard-fork.

## How BMM Works

1. Snowside block producers create sidechain blocks
2. Producers submit compact block header commitments to the Bitcoin mainchain
3. Bitcoin miners include these commitments in their coinbase transactions
4. The miner who includes a commitment earns a BTC fee from the block producer

Crucially, Bitcoin miners do **not** need to:

- Run a Snowside full node
- Validate Snowside transactions
- Understand Snowside's consensus rules
- Hold any Snowside-specific tokens

They simply include a small data commitment in a transaction they are already making.
This is the "blind" in Blind Merged Mining — miners are blind to the sidechain's
internals.

## Economic Incentives

The economic model is simple and self-sustaining:

- Snowside users pay **BTC** for gas (transaction fees)
- 100% of Base Fees are paid to eCash L1 miners via BMM. Settlement proposers are compensated from the Snowside Treasury (5% of Contract Fee capture). Validators receive Treasury distribution (85%, proportional to bonded BTC)
- Settlement proposers pay 100% of escrowed Base Fees to eCash miners via BMM and are compensated from the Treasury instead
- Miners include commitments because the marginal cost is zero and the fee is positive

Because the cost to miners is negligible — they are already producing blocks —
rational miners will include Snowside commitments. This gives Snowside access to
Bitcoin's full security budget.

## Settlement Finality

BMM provides a third tier of confirmation: **settlement**. While Avalanche consensus
confirms transactions in seconds, the BMM anchor to Bitcoin provides the ultimate
security guarantee. Reverting Snowside's history requires attacking Bitcoin's
hashrate — the most costly attack in all of cryptocurrency.

## References

- [BIP-300: Hashrate Escrows](https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki)
- [BIP-301: Blind Merged Mining](https://github.com/bitcoin/bips/blob/master/bip-0301.mediawiki)
- [Drivechain.info](https://drivechain.info/)
