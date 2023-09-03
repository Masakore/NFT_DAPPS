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
npm run deploy
```