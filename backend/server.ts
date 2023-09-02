import express, { Request, Response} from 'express';;
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import cors from 'cors';
import 'dotenv/config';

// This is our receipt database
import db from "./database";

// Load contract ABI
import contractMetadata from "./abi/SimpleNFT.json";

// Set up blockchain provider
const rpcURL = process.env.RPC_URL || "127.0.0.1:8545";
const provider = new Web3.providers.HttpProvider(rpcURL);
const web3 = new Web3(provider);
const simpleNFT = new web3.eth.Contract(contractMetadata.abi as AbiItem[], contractMetadata.address);

// Set up private key
const privateKey = process.env.PRIVATE_KEY;
// @todo process exit code?
if (!privateKey) throw new Error("Private key is not set");

// Set up express
const server = express();
const port = process.env.PORT || 8000;
server.use(express.urlencoded({ extended: true }));
server.use(express.json()); // To parse the incoming requests with JSON payloads
server.use(cors()); // Bad practice but to save time for this demo

// Endpoints
server.get("/hello", (_, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// blockchain connection test
server.get("/connectionTest", async (_, res: Response) => {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    return res.status(200).json({
      status: "ok",
      blockNumber: blockNumber,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "failed",
    });
  }
});

// mint NFT
// @todo error handling
server.post("/mint", async (req: Request, res: Response) => {
  try {
    const { recipient } = req.body;

    const tx = {
      from: process.env.ACCOUNT,
      to: contractMetadata.address,
      gas: 1000000, // @todo introduce dynamic gas estimation
      data: simpleNFT.methods.mint(recipient).encodeABI(),
    };
    // const signature = await web3.eth.accounts.signTransaction(tx, privateKey).then((signedTx) => { if (signedTx.rawTransaction) return signedTx }).catch((error) => { 
    //   return res.status(500).json({
    //     status: "failed",
    //     message: "Error occurred while creating a signature. Private key might be invalid: " + error,
    //   });
    //  });
    const signature = await web3.eth.accounts.signTransaction(tx, privateKey);
    if (!signature || !signature.rawTransaction) { 
      throw new Error("Error occurred while creating a signature. Private key might be invalid");
    }

    const receipt = await web3.eth
      .sendSignedTransaction(signature.rawTransaction).on('error', (error) => { 
        throw new Error(error.message);
      });
    const stmt = db.prepare(
      'INSERT INTO nft_receipts (transaction_hash, owner) VALUES (?, ?)',
    );
    stmt.run(receipt.transactionHash, recipient);

    return res.status(200).json({
      status: "ok",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
    });
  }
});

server.post("/details", async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.body;
    const totalSupply = await simpleNFT.methods.totalSupply().call();
    const contractName = await simpleNFT.methods.name().call();
    const symbol = await simpleNFT.methods.symbol().call();
    const balanceOf = await simpleNFT.methods.balanceOf(userAddress).call();

    return res.status(200).json({
      status: "ok",
      name: contractName,
      symbol: symbol,
      totalSupply: totalSupply,
      balanceOf: balanceOf,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "failed",
    });
  }
});

// Retrieve all receipts
server.get('/receipts', (_, res: Response) => {
  db.all('SELECT * FROM nft_receipts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json(rows);
  });
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
