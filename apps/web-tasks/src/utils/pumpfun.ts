import {
  type Keypair,
  Connection,
  clusterApiUrl,
  PublicKey,
  sendAndConfirmTransaction,
  TransactionInstruction,
  ComputeBudgetProgram,
  Transaction,
} from '@solana/web3.js';
import { isValidBase58 } from './common';
import bs58 from 'bs58';
import consola from 'consola';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

export const connection = new Connection(
  'https://rpc.fc.devnet.soo.network/rpc',
  'confirmed',
);

export const UNIT_BUDGET = 100_000;
export const UNIT_PRICE = 1_000_000;

export const getPayerKeyPair = (privateKey: string) => {
  if (!isValidBase58(privateKey)) {
    throw new Error('Invalid Base58 string');
  }
  const decoded = bs58.decode(privateKey.trim());
  const keypairFromSecretKey = Keypair.fromSecretKey(decoded);
  return keypairFromSecretKey;
};

export async function getTokenBalance(
  publicKey: PublicKey,
  mintStr: string,
): Promise<number | null> {
  try {
    const mint = new PublicKey(mintStr);
    console.log('🚀 ~ connection:', connection);
    const tokenBalance = await connection.getBalance(publicKey);
    console.log('🚀 ~ tokenBalance:', tokenBalance);
    // const response = await connection.getTokenAccountsByOwner(
    //   publicKey,
    //   { mint },
    //   'confirmed', // 添加承诺级别
    // );
    // const accounts = response.value;
    // console.log('🚀 ~ response:', response);
    // if (accounts.length > 0) {
    //   const tokenAmount =
    //     accounts[0].account.data.parsed.info.tokenAmount.uiAmount;
    //   return parseFloat(tokenAmount);
    // }

    const res = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    res.value.forEach((accountInfo) => {
      console.log(`pubkey: ${accountInfo.pubkey.toBase58()}`);
      console.log(
        `mint: ${accountInfo.account.data['parsed']['info']['mint']}`,
      );
      console.log(
        `owner: ${accountInfo.account.data['parsed']['info']['owner']}`,
      );
      console.log(
        `decimals: ${accountInfo.account.data['parsed']['info']['tokenAmount']['decimals']}`,
      );
      console.log(
        `amount: ${accountInfo.account.data['parsed']['info']['tokenAmount']['amount']}`,
      );
      console.log('====================');
    });

    return null;
  } catch (e) {
    consola.error('Error fetching token balance:', e);
    return null;
  }
}

export async function confirmTxn(
  txnSig: string,
  maxRetries: number = 20,
  retryInterval: number = 3,
): Promise<boolean> {
  let retries = 1;

  while (retries < maxRetries) {
    try {
      const txnRes = await client.getTransaction(txnSig);
      if (txnRes && !txnRes.meta?.err) {
        consola.log('Transaction confirmed... try count:', retries);
        return true;
      }

      consola.log('Error: Transaction not confirmed. Retrying...');
      if (txnRes?.meta?.err) {
        consola.log('Transaction failed.');
        return false;
      }
    } catch (e) {
      consola.log('Awaiting confirmation... try count:', retries);
      retries++;
      await new Promise((resolve) => setTimeout(resolve, retryInterval * 1000));
    }
  }

  consola.log('Max retries reached. Transaction confirmation failed.');
  return false;
}

export async function buy(
  connection: Connection,
  payerKeypair: Keypair,
  mintStr: string,
  solIn: number = 0.01,
  slippage: number = 5,
): Promise<boolean> {
  try {
    consola.log(`Starting buy transaction for mint: ${mintStr}`);

    const mint = new PublicKey(mintStr);
    const user = payerKeypair.publicKey;

    // Get or create associated token account
    consola.log('Fetching or creating associated token account...');
    const associatedUser = await getAssociatedTokenAddress(mint, user);

    let tokenAccountInstruction: TransactionInstruction | null = null;
    try {
      await connection.getTokenAccountBalance(associatedUser);
    } catch {
      tokenAccountInstruction = createAssociatedTokenAccountInstruction(
        user,
        associatedUser,
        user,
        mint,
      );
      consola.log(`Creating token account: ${associatedUser}`);
    }

    // Calculate amounts
    consola.log('Calculating transaction amounts...');
    const solDec = 1e9;
    const amount = Math.floor(solIn * solDec);
    const maxSolCost = Math.floor(solIn * (1 + slippage / 100) * solDec);

    // Create instructions
    const instructions = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: UNIT_BUDGET }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: UNIT_PRICE }),
    ];

    if (tokenAccountInstruction) {
      instructions.push(tokenAccountInstruction);
    }

    // Add swap instruction
    const swapInstruction = new TransactionInstruction({
      keys: [
        { pubkey: GLOBAL, isSigner: false, isWritable: false },
        { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: associatedUser, isSigner: false, isWritable: true },
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: RENT, isSigner: false, isWritable: false },
        { pubkey: EVENT_AUTHORITY, isSigner: false, isWritable: false },
      ],
      programId: PUMP_FUN_PROGRAM,
      data: Buffer.concat([
        Buffer.from([1]), // Instruction discriminator for buy
        Buffer.from(
          new Uint8Array(new BigUint64Array([BigInt(amount)]).buffer),
        ),
        Buffer.from(
          new Uint8Array(new BigUint64Array([BigInt(maxSolCost)]).buffer),
        ),
      ]),
    });

    instructions.push(swapInstruction);

    // Send transaction
    consola.log('Sending transaction...');
    const transaction = new Transaction().add(...instructions);

    transaction.recentBlockhash = (await client.getLatestBlockhash()).blockhash;
    transaction.feePayer = user;

    const txnSig = await sendAndConfirmTransaction(client, transaction, [
      payerKeypair,
    ]);

    consola.log(`Transaction signature: ${txnSig}`);
    return await confirmTxn(txnSig);
  } catch (e) {
    consola.error('Error occurred during transaction:', e);
    return false;
  }
}
