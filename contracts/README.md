# Simple NFT dApp contract
This folder contains the smart contract code for Simple NFT dApp

## How to test
```
npm install

npx hardhat compile
npx hardhat node
npx hardhat test --network localhost
```
## How to deploy
1. First, add your credentials in `.env.sample` and rename it to .env
```.env
# Add your own ones and rename this file to .env
RPC_URL=
PRIVATE_KEY=
```

2. Run the following script
```shell
npx hardhat run --network sepolia scripts/deploy.js
```

## TODO
```
Smart Contract:
1. Set up a simple smart contract (e.g. NFT Minting)
=> Done

2. Deploy the smart contract on a testnet, (e.g. Sepolia)
=> Done  
Deployed to Sepolia at 0xb1B720284b1f18B07bB7eE47f0Ba03908A43d792

3. Include scripts to run all tests & deployment scripts as well as simple documentation
on how it works. 
=> Partially done
```