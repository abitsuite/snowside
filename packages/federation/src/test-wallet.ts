import { HDWallet } from './wallet.js';

const mnemonic =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const wallet = new HDWallet(mnemonic);

console.log('Testing HD wallet address generation:');
console.log('---');

for (const network of ['mainnet', 'testnet', 'signet']) {
  for (let i = 0; i < 3; i++) {
    const addr = wallet.deriveDepositAddress(network, i);
    console.log(`${network} [${i}]: ${addr}`);
  }
  console.log('---');
}

const addr0 = wallet.deriveDepositAddress('testnet', 0);
const addr1 = wallet.deriveDepositAddress('testnet', 1);
console.log('Addresses are unique:', addr0 !== addr1);
