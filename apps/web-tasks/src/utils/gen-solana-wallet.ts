import fs from 'node:fs';

import { Keypair } from '@solana/web3.js';
import bip39 from 'bip39';
import bs58 from 'bs58';
import { derivePath } from 'ed25519-hd-key';

// 调整参数：
// =================================
// 生成钱包个数
const WALLET_COUNT = 5;
// 保存钱包的文件名
const WALLET_FILE = 'wallets.json';
// =================================

// 生成单个钱包
function generateSolanaWallet(accountIndex = 0) {
  // 生成助记词
  const mnemonic = bip39.generateMnemonic(256); // 24 个单词

  // 从助记词派生种子
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // Phantom 使用的是 m/44'/501'/0'/0' 路径
  // accountIndex 允许从同一个助记词生成多个账户
  const path = `m/44'/501'/${accountIndex}'/0'`;
  const derivedSeed = derivePath(path, seed.toString()).key;

  // 创建密钥对
  const keypair = Keypair.fromSeed(derivedSeed);

  return {
    mnemonic,
    secretKey: bs58.encode(keypair.secretKey),
    publicKey: keypair.publicKey.toString(),
    path, // 添加路径信息便于调试
  };
}

// 从助记词恢复钱包
// function recoverFromMnemonic(mnemonic: any, accountIndex = 0) {
//   const seed = bip39.mnemonicToSeedSync(mnemonic);
//   const path = `m/44'/501'/${accountIndex}'/0'`;
//   const derivedSeed = derivePath(path, seed.toString()).key;
//   const keypair = Keypair.fromSeed(derivedSeed);

//   return {
//     mnemonic,
//     secretKey: bs58.encode(keypair.secretKey),
//     publicKey: keypair.publicKey.toString(),
//     path,
//   };
// }

// 批量生成钱包
function generateMultipleWallets(count: number) {
  const wallets = [];

  for (let i = 0; i < count; i++) {
    const wallet = generateSolanaWallet(); // 每个钱包使用不同的 account index
    wallets.push(wallet);
  }

  return wallets;
}

// 保存钱包信息到文件
function saveWalletsToFile(
  wallets: {
    mnemonic: any;
    path: string; // 添加路径信息便于调试
    publicKey: any;
    secretKey: any;
  }[],
  filename: string,
) {
  const data = JSON.stringify(wallets, null, 2);
  fs.writeFileSync(filename, data);
  // console.log(`Wallets saved to ${filename}`);
}

// 使用示例:
async function main() {
  // 生成 5 个钱包
  const wallets = generateMultipleWallets(WALLET_COUNT);

  // 保存钱包信息到文件
  saveWalletsToFile(wallets, WALLET_FILE);

  // console.log('Generated Wallets:');
  // wallets.forEach((wallet, index) => {
  //   console.log(`\nWallet ${index + 1}:`);
  //   console.log('Path:', wallet.path);
  //   console.log('Mnemonic:', wallet.mnemonic);
  //   console.log('Secret Key:', wallet.secretKey);
  //   console.log('Public Key (Address):', wallet.publicKey);
  // });

  // // 测试从助记词恢复
  // const recoveredWallet = recoverFromMnemonic(wallets[0].mnemonic, 0);
  // console.log('\nRecovered Wallet:');
  // console.log('Path:', recoveredWallet.path);
  // console.log('Public Key:', recoveredWallet.publicKey);
}

main();
