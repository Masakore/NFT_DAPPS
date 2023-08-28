import React, { useState, useEffect } from 'react';
import { Web3 } from "web3";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
      let userAddress = "";
      async function onInit() {
        if (!(window as any).ethereum) {
          await (window as any).ethereum.enable();
        }
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
      }
      onInit().then(currentUser => userAddress = currentUser);
      console.log(userAddress);
      console.log(userAddress === "0xb9c56a4adec6dfcdfdfba995326a7db98494e37b");
      fetch("https://simple-nft-test-b736bcd4d7ca.herokuapp.com/details", {
        body: JSON.stringify({
          user: "0xb9c56a4adec6dfcdfdfba995326a7db98494e37b",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => console.error(error));
  }, []);

  return (
    <>
      <header>
        <h1>Simple NFT dApp</h1>
      </header>
      <div>
        {/* TODO: Implement UI */}
        {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "Loading..."}
      </div>
    </>
  );
}

export default App;
