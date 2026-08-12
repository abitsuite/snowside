import { createPublicClient, http, type Chain } from 'viem';

const RPC = 'https://rpc.snowside.network/signet';
const NATIVE_MINTER = '0x0200000000000000000000000000000000000001';

const chain: Chain = {
  id: 33416,
  name: 'snowside-signet',
  nativeCurrency: { name: 'ECX', symbol: 'ECX', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
};

const client = createPublicClient({ chain, transport: http() });

async function main() {
  // 1. Check chain ID
  const chainId = await client.getChainId();
  console.log('Chain ID:', chainId);

  // 2. Check if precompile address has code
  const code = await client.getCode({ address: NATIVE_MINTER as `0x${string}` });
  console.log('NativeMinter code:', code);

  // 3. Try eth_call with mint(address,uint256) = 0x40c10f19
  //    to = 0xFd89b56D37642D155af094bF00A2B4e9014aBAFC (test recipient)
  //    amount = 100 sats = 100 * 10^16 = 1000000000000000 wei
  const toAddr = '0xFd89b56D37642D155af094bF00A2B4e9014aBAFC';
  const amount = BigInt(100) * BigInt(10) ** BigInt(16);

  const addressPadded = toAddr.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const amountHex = amount.toString(16).padStart(64, '0');
  const mintData = `0x40c10f19${addressPadded}${amountHex}`;

  console.log('\n--- Testing mint(address,uint256) ---');
  console.log('Selector: 0x40c10f19');
  console.log('Data:', mintData);

  try {
    const result = await client.call({
      to: NATIVE_MINTER as `0x${string}`,
      data: mintData as `0x${string}`,
    });
    console.log('Result:', result);
  } catch (err: any) {
    console.error('Error:', err.message);
    if (err.cause) console.error('Cause:', err.cause.message || err.cause);
  }

  // 4. Try other common selectors
  const selectors: Record<string, string> = {
    'mint(address,uint256)': '0x40c10f19',
    'mint(address,uint256,uint256)': '',  // compute below
    'deposit(address,uint256)': '',
  };

  // 5. Check other precompile addresses
  console.log('\n--- Checking other precompile addresses ---');
  for (let i = 0; i <= 10; i++) {
    const addr = `0x020000000000000000000000000000000000000${i.toString(16)}`;
    try {
      const c = await client.getCode({ address: addr as `0x${string}` });
      if (c && c !== '0x') {
        console.log(`${addr}: code = ${c}`);
      }
    } catch (e) {
      // skip
    }
  }

  // 6. Try reading the NativeMinter admin status
  // readAdmin(address) selector = ?
  // Let's try some common read functions
  const readSelectors = [
    '0xa3f1d81b',  // readAllowList(address) - AllowList precompile
    '0x6ef8c667',  // readMinter(address)
    '0xeadfdb10',  // readAdmin(address)
  ];

  for (const sel of readSelectors) {
    const data = `${sel}${addressPadded}`;
    console.log(`\n--- Testing selector ${sel} ---`);
    try {
      const result = await client.call({
        to: NATIVE_MINTER as `0x${string}`,
        data: data as `0x${string}`,
      });
      console.log('Result:', result);
    } catch (err: any) {
      console.error('Error:', err.message?.substring(0, 100));
    }
  }
}

main().catch(console.error);
