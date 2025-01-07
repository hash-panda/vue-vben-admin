import { LAMPORTS_PER_SOL, type Connection, type Keypair } from '@solana/web3.js'
export async function requestAirdrop(connection: Connection, payer: Keypair) {
  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    LAMPORTS_PER_SOL,
  )
  console.log("🚀 ~ requestAirdrop ~ airdropSignature:", airdropSignature)

  // await connection.confirmTransaction({
  //   signature: airdropSignature,
  // })
}
