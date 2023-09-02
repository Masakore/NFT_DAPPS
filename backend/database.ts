import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./nftReceipts.db');

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS nft_receipts (id INTEGER PRIMARY KEY, transaction_hash TEXT, owner TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)',
  );
});

export default db;
