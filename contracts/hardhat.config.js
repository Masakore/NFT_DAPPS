require("@nomicfoundation/hardhat-toolbox");

const privateKey = !process.env.PRIVATE_KEY
  ? undefined
  : [process.env.PRIVATE_KEY];

module.exports = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: { accounts: { count: 50 } },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    sepolia: {
      url: process.env.RPC_URL,
      chainId: 11155111,
      accounts: privateKey,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './dist',
  }
};
