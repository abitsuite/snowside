import { createWalletClient, createPublicClient, http, encodeFunctionData, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, toBytes } from 'viem';

const MINTER_KEY = process.env.MINTER_PRIVATE_KEY;
if (!MINTER_KEY) {
  console.error('MINTER_PRIVATE_KEY env var required (0x-prefixed hex)');
  process.exit(1);
}
const NATIVE_MINTER = '0x0200000000000000000000000000000000000001';
const RPC = process.env.RPC_URL || 'https://rpc.snowside.network/signet';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '33416');
const MINT_TO = process.env.MINT_TO || '0xFd89b56D37642D155af094bF00A2B4e9014aBAFC';
const MINT_AMOUNT_ECX = BigInt(process.env.MINT_AMOUNT_ECX || '1');

// Correct ABI from Avalanche docs — mintNativeCoin, NOT mint
const NATIVE_MINTER_ABI = [
  {
    inputs: [
      { name: 'addr', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'mintNativeCoin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'readAllowList',
    outputs: [{ name: 'role', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const account = privateKeyToAccount(MINTER_KEY as `0x${string}`);
console.log('MINTER address:', account.address);

// Compute the correct selector
const selector = keccak256(toBytes('mintNativeCoin(address,uint256)')).substring(0, 10);
console.log('mintNativeCoin selector:', selector);
console.log('(was using mint selector: 0x40c10f19 — WRONG!)');

const chain: Chain = {
  id: CHAIN_ID,
  name: 'snowside-signet',
  nativeCurrency: { name: 'ECX', symbol: 'ECX', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
};

const publicClient = createPublicClient({ chain, transport: http() });
const walletClient = createWalletClient({ account, chain, transport: http() });

async function main() {
  // 1. Check MINTER balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('MINTER balance:', balance.toString(), 'wei');

  // 2. Check if MINTER is admin on NativeMinter (readAllowList)
  const readData = encodeFunctionData({
    abi: NATIVE_MINTER_ABI,
    functionName: 'readAllowList',
    args: [account.address],
  });
  console.log('\n--- Checking MINTER role on NativeMinter ---');
  try {
    const role = await publicClient.call({
      to: NATIVE_MINTER as `0x${string}`,
      data: readData,
    });
    console.log('MINTER role:', role?.data, '(2 = admin, 1 = enabled, 0 = none)');
  } catch (err: any) {
    console.error('readAllowList failed:', err.message?.substring(0, 200));
  }

  // 3. Mint MINT_AMOUNT_ECX ECX (1 ECX = 100 sats * 10^16 wei) to target address
  const toAddr = MINT_TO as `0x${string}`;
  const amount = MINT_AMOUNT_ECX * BigInt(10) ** BigInt(18);

  const mintData = encodeFunctionData({
    abi: NATIVE_MINTER_ABI,
    functionName: 'mintNativeCoin',
    args: [toAddr, amount],
  });

  console.log(`\n--- Minting ${MINT_AMOUNT_ECX} ECX via mintNativeCoin to ${toAddr} ---`);
  console.log('Data:', mintData);

  // 4. First try eth_call to check if it would succeed
  try {
    await publicClient.call({
      to: NATIVE_MINTER as `0x${string}`,
      data: mintData,
      account: account,
    });
    console.log('eth_call succeeded — tx would work');
  } catch (err: any) {
    console.error('eth_call failed:', err.message?.substring(0, 200));
    // If it fails, don't send the tx
    return;
  }

  // 5. Send the actual transaction
  try {
    const txHash = await walletClient.sendTransaction({
      to: NATIVE_MINTER as `0x${string}`,
      data: mintData,
      account,
      chain,
    });
    console.log('txHash:', txHash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log('status:', receipt.status);
    console.log('gas used:', receipt.gasUsed.toString());

    // Check recipient balance
    const recipientBalance = await publicClient.getBalance({ address: toAddr as `0x${string}` });
    console.log('Recipient balance:', recipientBalance.toString(), 'wei');
    console.log('\n✅ MINT SUCCEEDED!');
  } catch (err: any) {
    console.error('Transaction failed:', err.message);
    if (err.cause) console.error('Cause:', err.cause.message || err.cause);
  }
}

main().catch(console.error);
