const express = require('express');
const Web3 = require('web3');
require('dotenv').config();

// Load contract ABI
const abi = require('./abi/SimpleNFT.json');

// Set up blockchain provider
const rpcURL = process.env.RPC_URL || ''; 
const provider = new Web3.providers.HttpProvider(rpcURL);
const web3 = new Web3(provider);
const simpleNFT = new web3.eth.Contract(abi.abi, abi.address);

// Set up server
const server = express();
const port = process.env.PORT || 8000;
server.use(express.urlencoded({ extended: true }));
server.use(express.json()); // To parse the incoming requests with JSON payloads

// Endpoints
// live test
server.get('/hello', (req, res) => {
  res.json({ status: 'ok' });
});

// blockchain connection test 
server.get('/connectionTest', async (req, res) => {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    return res.json({
      status: 'ok',
      blockNumber: blockNumber
    });
  } catch (error) { 
    console.log(error);
  }

  return res.json({
    status: 'failed'
  });
});

// mint NFT
server.post('/mint', async (req, res) => { 
  try {
    const { recipient } = req.body;
    const privateKey = process.env.PRIVATE_KEY;
    const tx = {
      from: process.env.ACCOUNT,
      to: abi.address,
      gas: 1000000,
      data: simpleNFT.methods.mint(recipient).encodeABI()
    }
    const signature = await web3.eth.accounts.signTransaction(tx, privateKey);
    web3.eth.sendSignedTransaction(signature.rawTransaction);

    return res.json({
      status: 'ok'
    });
  } catch (error) { 
    console.log(error);
  }

  return res.json({
    status: 'failed'
  });
});

server.get('/details', async (req, res) => {
  try {
    const { user } = req.body;
    const totalSupply = await simpleNFT.methods.totalSupply().call();
    const contractName = await simpleNFT.methods.name().call();
    const symbol = await simpleNFT.methods.symbol().call();
    const balanceOf = await simpleNFT.methods.balanceOf(user).call();

    return res.json({
      status: 'ok',
      name: contractName,
      symbol: symbol,
      totalSupply: totalSupply,
      balanceOf: balanceOf
    });
  } catch (error) { 
    console.log(error);
  }

  return res.json({
    status: 'failed'
  });
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
})