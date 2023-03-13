# Candy Machine UI
#### assets folder contains the assets for the candy machine to be associated with the minted nfts;
#### candy-machine-ui folder contains the UI cloned from the metaplex foundation github with the .env file changed for the ui to get access to the candy machine (8wTGjuRMaMXJkBWjfcpGYRV4Ye1RzWkVbAF2ESyhqbvw) deployed on the devnet;
#### details file contains the address of the keypair pallet.json (included in this repo), id of the token created during this project, the associated token account for the token mint (for the pallet.json account) and the address of the candy machine deployed on the devnet.

### For testing the project
- paste the pallet.json in your desired directory.
- change the default signing keypair to pallet.json by writing the command 
- "solana config set --keypair path/pallet.json" 
(change "path" to the absolute path of the pallet.json keypair)

### For testing out token naming script
- cd to token folder
- use command "npm run dev"