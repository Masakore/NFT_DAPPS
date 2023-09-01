import express from 'express';;
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import cors from 'cors';
import 'dotenv/config';
import db from "./database";

// Load contract ABI
import contractMetadata from "./abi/SimpleNFT.json";

// Set up blockchain provider
const rpcURL = process.env.RPC_URL || "";
const provider = new Web3.providers.HttpProvider(rpcURL);
const web3 = new Web3(provider);
const simpleNFT = new web3.eth.Contract(contractMetadata.abi as AbiItem[], contractMetadata.address);

// Set up server
const server = express();
const port = process.env.PORT || 8000;
server.use(express.urlencoded({ extended: true }));
server.use(express.json()); // To parse the incoming requests with JSON payloads
server.use(cors()); // Bad practice but to save time for this demo

// Endpoints
// live test
server.get("/hello", (req, res) => {
  res.json({ status: "ok" });
});

// blockchain connection test
server.get("/connectionTest", async (req, res) => {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    return res.json({
      status: "ok",
      blockNumber: blockNumber,
    });
  } catch (error) {
    console.log(error);
  }

  return res.json({
    status: "failed",
  });
});

// mint NFT
// @todo error handling
server.post("/mint", async (req, res) => {
  try {
    const { recipient } = req.body;
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return res.json({
        status: "failed",
        message: "Private key might not be set",
      });
    }

    const tx = {
      from: process.env.ACCOUNT,
      to: contractMetadata.address,
      gas: 1000000,
      data: simpleNFT.methods.mint(recipient).encodeABI(),
    };
    const signature = await web3.eth.accounts.signTransaction(tx, privateKey);
    if (signature && signature.rawTransaction) {
      await web3.eth.sendSignedTransaction(signature.rawTransaction);
      const stmt = db.prepare(
        'INSERT INTO nft_receipts (nft_id, owner) VALUES (?, ?)',
      );
      stmt.run("111", recipient);

      return res.json({
        status: "ok",
      });
    }

    return res.json({
      status: "failed",
      message: "Error occurred while creating a signature. Private key might be invalid",
    });
  } catch (error) {
    console.log(error);
  }

  return res.json({
    status: "failed",
  });
});

server.post("/details", async (req, res) => {
  try {
    const { user } = req.body;
    const totalSupply = await simpleNFT.methods.totalSupply().call();
    const contractName = await simpleNFT.methods.name().call();
    const symbol = await simpleNFT.methods.symbol().call();
    const balanceOf = await simpleNFT.methods.balanceOf(user).call();

    return res.json({
      status: "ok",
      name: contractName,
      symbol: symbol,
      totalSupply: totalSupply,
      balanceOf: balanceOf,
    });
  } catch (error) {
    console.log(error);
  }

  return res.json({
    status: "failed",
  });
});

// Retrieve all receipts
server.get('/receipts', (req, res) => {
  db.all('SELECT * FROM nft_receipts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});

// Reference
// https://celo.academy/t/interact-with-smart-contract-on-celo-using-web3js/256