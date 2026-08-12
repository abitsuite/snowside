import { createWalletClient, createPublicClient, http, encodeFunctionData, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, toBytes } from 'viem';

const EWOQ_KEY = '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027';
const NATIVE_MINTER = '0x0200000000000000000000000000000000000001';
const RPC = 'https://rpc.snowside.network/signet';

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

const account = privateKeyToAccount(EWOQ_KEY as `0x${string}`);
console.log('EWOQ address:', account.address);

// Compute the correct selector
const selector = keccak256(toBytes('mintNativeCoin(address,uint256)')).substring(0, 10);
console.log('mintNativeCoin selector:', selector);
console.log('(was using mint selector: 0x40c10f19 — WRONG!)');

const chain: Chain = {
  id: 33416,
  name: 'snowside-signet',
  nativeCurrency: { name: 'ECX', symbol: 'ECX', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
};

const publicClient = createPublicClient({ chain, transport: http() });
const walletClient = createWalletClient({ account, chain, transport: http() });

async function main() {
  // 1. Check EWOQ balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('EWOQ balance:', balance.toString(), 'wei');

  // 2. Check if EWOQ is admin on NativeMinter (readAllowList)
  const readData = encodeFunctionData({
    abi: NATIVE_MINTER_ABI,
    functionName: 'readAllowList',
    args: [account.address],
  });
  console.log('\n--- Checking EWOQ role on NativeMinter ---');
  try {
    const role = await publicClient.call({
      to: NATIVE_MINTER as `0x${string}`,
      data: readData,
    });
    console.log('EWOQ role:', role?.data, '(2 = admin, 1 = enabled, 0 = none)');
  } catch (err: any) {
    console.error('readAllowList failed:', err.message?.substring(0, 200));
  }

  // 3. Mint 1 ECX (100 sats * 10^16) to test address
  const toAddr = '0xFd89b56D37642D155af094bF00A2B4e9014aBAFC';
  const amount = BigInt(100) * BigInt(10) ** BigInt(16); // 1 ECX

  const mintData = encodeFunctionData({
    abi: NATIVE_MINTER_ABI,
    functionName: 'mintNativeCoin',
    args: [toAddr, amount],
  });

  console.log('\n--- Minting 1 ECX via mintNativeCoin ---');
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
