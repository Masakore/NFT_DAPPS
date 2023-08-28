import "./App.css";
import { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";

const App = () => {
  const BACKEND_ENDPOINT = "https://simple-nft-test-b736bcd4d7ca.herokuapp.com";
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const initialState = { accounts: [] }; 
  const [wallet, setWallet] = useState(initialState); 
  const [data, setData] = useState(null);


  useEffect(() => {
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      setHasProvider(Boolean(provider));
    };

    getProvider();
  }, []);

  const updateWallet = async (accounts: any) => {
    
    setWallet({ accounts }); 
  }; 

  const fetchNFTData = async (userAddress: string) => {
    fetch(`${BACKEND_ENDPOINT}/details`, {
      body: JSON.stringify({
        user: userAddress,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.balanceOf !== "0") { // TODO: move this logic to backend
        setData(json);
      }
    })
    .catch((error) => console.error(error));
  }

  const handleConnect = async () => {
    
    const accounts = await (window as any).ethereum.request({
       method: "eth_requestAccounts",
    }); 
    updateWallet(accounts); 
    await fetchNFTData(accounts[0]); 
  }; 

  return (
    <div className="App">
      <div>Injected Provider {hasProvider ? "DOES" : "DOES NOT"} Exist</div>

      {hasProvider && (
        <button onClick={handleConnect}>Connect MetaMask</button>
      )}

      {wallet.accounts.length > 0  && (
        <div>Wallet Accounts: {wallet.accounts[0]}</div>
      )}
      <div>
        {/* TODO: Implement UI */}
        {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "Loading..."}
      </div>
    </div>
  );
};

export default App;