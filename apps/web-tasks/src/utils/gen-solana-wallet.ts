import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';

function getMasterKey(seed: Buffer): { key: Buffer; chainCode: Buffer } {
  const h = hmac.create(sha512, Buffer.from('ed25519 seed'));
  h.update(seed);
  const I = Buffer.from(h.digest());
  return {
    key: I.slice(0, 32),
    chainCode: I.slice(32),
  };
}

function CKDPriv(
  parent: { key: Buffer; chainCode: Buffer },
  index: number,
): { key: Buffer; chainCode: Buffer } {
  const indexBuffer = Buffer.alloc(4);
  indexBuffer.writeUInt32BE(index + 0x80000000, 0);

  const data = Buffer.concat([Buffer.alloc(1), parent.key, indexBuffer]);

  const h = hmac.create(sha512, parent.chainCode);
  h.update(data);
  const I = Buffer.from(h.digest());

  return {
    key: I.slice(0, 32),
    chainCode: I.slice(32),
  };
}

function derivePath(seed: Buffer): Buffer {
  let { key, chainCode } = getMasterKey(seed);

  // Derive m/44'/501'/0'/0'
  [44, 501, 0, 0].forEach((index) => {
    const derived = CKDPriv({ key, chainCode }, index);
    key = derived.key;
    chainCode = derived.chainCode;
  });

  return key;
}

// 生成单个钱包
function generateSolanaWallet() {
  try {
    // 生成 12 词助记词
    const mnemonic = bip39.generateMnemonic(128);

    // 从助记词生成种子
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    // 使用 BIP44 派生路径 m/44'/501'/0'/0'
    const derivedSeed = derivePath(seed);

    // 从派生的种子创建密钥对
    const keypair = Keypair.fromSeed(derivedSeed);

    return {
      mnemonic,
      publicKey: keypair.publicKey.toString(),
      secretKey: bs58.encode(keypair.secretKey),
    };
  } catch (error) {
    console.error('Error generating wallet:', error);
    throw error;
  }
}

// 批量生成钱包
export function generateMultipleWallets(count: number) {
  const wallets = [];

  for (let i = 0; i < count; i++) {
    const wallet = generateSolanaWallet();
    wallets.push(wallet);
  }

  return wallets;
}

// 创建新钱包的方法
export function createNewWallet() {
  try {
    const wallet = generateSolanaWallet();
    return wallet;
  } catch (error) {
    console.error('Failed to create wallet:', error);
    throw error;
  }
}

// 从助记词恢复钱包
export function recoverFromMnemonic(mnemonic: string) {
  try {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const derivedSeed = derivePath(seed);
    const keypair = Keypair.fromSeed(derivedSeed);

    return {
      mnemonic,
      publicKey: keypair.publicKey.toString(),
      secretKey: bs58.encode(keypair.secretKey),
    };
  } catch (error) {
    console.error('Error recovering wallet:', error);
    throw error;
  }
}
