import { Transaction, Keypair, Connection, PublicKey } from "@solana/web3.js";
import { DataV2, createCreateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { bundlrStorage, findMetadataPda, keypairIdentity, Metaplex, UploadMetadataInput } from '@metaplex-foundation/js';

// connecting to solana devnet
const endpoint = 'https://api.devnet.solana.com';
const solanaConnection = new Connection(endpoint);

// token metadata that will be uploaded to arweave
const ARWEAVE_METADATA = {
  name: "Token D. Test",
  symbol: "ZORO",
  description: "Miro yo! kore wa ore no token daaaa!! konoyaroo!!",
  image: "https://ipfs.io/ipfs/QmcNdRaHeMweqc44brP2MJ5hwp9kQKTfLSUA6yqPq6TkTn" 
}

const uploadMetadata = async(wallet: Keypair, tokenMetadata: UploadMetadataInput):Promise<string> => {

    //create metaplex instance on devnet using this wallet
    const metaplex = Metaplex.make(solanaConnection)
        .use(keypairIdentity(wallet))
        .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: endpoint,
        timeout: 60000,
        }));
    
    //Upload to Arweave
    const { uri } = await metaplex.nfts().uploadMetadata(tokenMetadata);
    return uri;

}


const createInstruction = async ( payer:Keypair, mintPubkey: PublicKey, mintAuthority: PublicKey, data: DataV2)=>{

    //metadata account associated with mint
    const metadataPDA = await findMetadataPda(mintPubkey);   

    // creating instruction for creating metadata account on-chain
    const instruction = new Transaction().add(

        createCreateMetadataAccountV2Instruction({
            metadata: metadataPDA, 
            mint: mintPubkey, 
            mintAuthority: mintAuthority,
            payer: payer.publicKey,
            updateAuthority: mintAuthority,
          },
          { createMetadataAccountArgsV2: 
            { 
              data: data, 
              isMutable: true 
            } 
          }
        )
    );

    return instruction;
}

const main = async() => {
    
    // imported pallet.json into the file
    const secretKeyBytes = [27,48,240,5,45,246,117,202,58,155,23,80,0,31,40,124,0,150,41,31,20,127,208,216,199,107,32,164,155,65,61,160,230,189,137,175,209,153,176,17,143,113,169,219,228,182,11,187,60,159,200,118,69,126,228,188,59,247,115,198,151,69,53,81];
    const secretKey = Buffer.from(secretKeyBytes);
    const pallet = Keypair.fromSecretKey(secretKey);

    // arveave url after uploading metadata
    let metadataUri = await uploadMetadata(pallet, ARWEAVE_METADATA);

    //this will be stored on chain
    const CHAIN_METADATA = {
      name: ARWEAVE_METADATA.name, 
      symbol: ARWEAVE_METADATA.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    } as DataV2;

    //Create new pubkey for mint address
    const mintPubkey = new PublicKey("D2Vkq7ak1mwN8fparHUdbudWbdbRdCFniNM2uGChjdZK");   

    // transaction builder function
    const newNameTransaction:Transaction = await createInstruction(
        pallet,
        mintPubkey,
        pallet.publicKey,
        CHAIN_METADATA
    );

    // sending transaction to devnet
    const transactionId =  await solanaConnection.sendTransaction(newNameTransaction, [pallet]);

    // logger to display successful execution
    console.log(transactionId);
}

main();