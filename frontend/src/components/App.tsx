import detectEthereumProvider from "@metamask/detect-provider";
import { FC, useEffect, useState } from "react";
import ABI from "../abi/SimpleNFT.json";
import "./input.css";

const formatBalance = (rawBalance: string): string => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};

const formatToWei = (amountInEth: number): string => {
  return "0x" + (amountInEth * 1000000000000000000).toString(16);
};

const App: FC = () => {
  const backendEndpoint = "https://simplenft-api-b04ba9fe9c76.herokuapp.com";
  // const backendEndpoint = process.env.BACKEND_ENDPOINT || "https://simple-nft-test-b736bcd4d7ca.herokuapp.com";

  // Wallet states
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const initialState = { accounts: [], balance: "" };
  const [wallet, setWallet] = useState(initialState);
  const [isConnecting, setIsConnecting] = useState(false);
  const disableConnection = Boolean(wallet) && isConnecting;

  // Minting states
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  // Donation states
  const [isDonating, setIsDonating] = useState(false);
  const [isDonated, setIsDonated] = useState(false);

  // NFT details state
  const [nftDetail, setNftDetail] = useState<NftDetail>();

  // General error message 
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Backend API response type: returns the current user's NFT details 
  type NftDetail = {
    status: string,
    name: string,
    symbol: string,
    totalSupply: string,
    balanceOf: string
  }

  // Connect to MetaMask
  useEffect(() => {
    const refreshAccounts = (accounts: any) => {
      if (accounts.length > 0) {
        updateWallet(accounts);
      } else {
        setWallet(initialState);
      }
    };

    const getProvider = async () => {
      const provider = await detectEthereumProvider({
        mustBeMetaMask: true,
        silent: true,
      });
      setHasProvider(Boolean(provider));

      if (provider) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        refreshAccounts(accounts);
        window.ethereum.on("accountsChanged", refreshAccounts);
      }
    };

    getProvider();

    // Clean up the listener upon unmount of this component.
    return () => {
      window.ethereum?.removeListener("accountsChanged", refreshAccounts);
    };
  }, []);

  // Backend API call to get NFT details of the current user when the wallet state changes
  useEffect(() => { 
    const fetchNFTDetails = async (userAddress: string) => {
      fetch(`${backendEndpoint}/details`, {
        body: JSON.stringify({
          user: userAddress,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
        .then((response) => response.json())
        .then((json: NftDetail) => {
          setNftDetail(json);
        })
        .catch((error) => console.error(error));
    };

    if (wallet.accounts.length > 0) {
      fetchNFTDetails(wallet.accounts[0]);
    }
  }, [wallet]);

  useEffect(() => {
    // If the user has minted the NFT, set the isMinted to true
    setIsMinted(nftDetail?.balanceOf && parseInt(nftDetail.balanceOf) > 0 ? true : false);
   }, [nftDetail]);

  const updateWallet = async (accounts: any) => {
    const balance = formatBalance(
      await window.ethereum!.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })
    );
    setWallet({ accounts, balance });
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    await window.ethereum
      .request({
        method: "eth_requestAccounts",
      })
      .then((accounts: []) => {
        setError(false);
        updateWallet(accounts);
      })
      .catch((err: any) => {
        setError(true);
        setErrorMessage(err.message);
      });
    setIsConnecting(false);
  };

  const mint = async (userAddress: string) => {
    setIsMinting(true);
    fetch(`${backendEndpoint}/mint`, {
      body: JSON.stringify({
        user: userAddress,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
      .then(() => setIsMinted(true))
      .catch((err: any) => {
        setError(true);
        setErrorMessage(err.message);
      });
    setIsMinting(false);
  };

  const sendDonation = async () => {
    setIsDonating(true);
    const donationAmount = formatToWei(0.0001);
    console.log("donationAmount", donationAmount);
    await window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.accounts[0],
            to: ABI.address,
            value: donationAmount,
          },
        ],
      })
      .then((txHash: string) => {
        setIsDonated(true);
        console.log(txHash);
      })
      .catch((err: any) => {
        setError(true);
        setErrorMessage(err.message);
      });
    setIsDonating(false);
  };

  return (
    <div className="bg-white pb-6 sm:pb-8 lg:pb-12">
      {/* Header */}
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <header className="mb-8 flex items-center justify-between py-4 md:mb-12 md:py-8 xl:mb-16">
          <a
            href="/"
            className="inline-flex items-center gap-2.5 text-2xl font-bold text-black md:text-3xl"
            aria-label="logo"
          >
            <svg
              width="95"
              height="94"
              viewBox="0 0 95 94"
              className="h-auto w-6 text-indigo-500"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M96 0V47L48 94H0V47L48 0H96Z" />
            </svg>
            Simple NFT Dapp
          </a>
          {!hasProvider && (
            <a
              href="https://metamask.io/download/"
              className="hidden rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base lg:inline-block"
            >
              Get Metamask
            </a>
          )}
          {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
            <button
              disabled={disableConnection}
              onClick={handleConnect}
              className="hidden rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base lg:inline-block"
            >
              Connect MetaMask
            </button>
          )}
        </header>

        {/* Main */}
        <section className="flex flex-col justify-between gap-6 sm:gap-10 md:gap-16 lg:flex-row">
          <div className="flex flex-col justify-center sm:text-center lg:py-12 lg:text-left xl:w-5/12 xl:py-24">
            <p className="mb-4 font-semibold text-indigo-500 md:mb-6 md:text-lg xl:text-xl">
              Presented by Vitalik
            </p>

            <h1 className="mb-8 text-4xl font-bold text-black sm:text-3xl md:mb-12 md:text-6xl">
              Get The Awesome NFT
            </h1>

            {/* Error message */}
            <div className="mb-8 text-red-500 leading-relaxed  md:mb-12 lg:w-4/5 xl:text-lg">
              {error && (
                <div onClick={() => setError(false)} className="text-red-500">
                  <strong>Something went wrong. Please try again later</strong>
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>

            {/* NFT Details */}
            <div className="mb-8 text-2xl font-bold text-black text-center">
              {nftDetail && (
                <div>{`${nftDetail.balanceOf} (Yours)/ ${nftDetail.totalSupply} (Total Issued)`}</div>
              )}
            </div>

            {/* Call to action */}
            {isMinted ? (
              <div className="bg-white py-6 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
                  <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-gray-100 p-4 sm:flex-row md:p-8">
                    <div>
                      <h2 className="text-xl font-bold text-indigo-500 md:text-2xl">
                        You wanna donate to me?
                      </h2>
                      <p className="text-gray-600">
                        You have : {wallet.balance} ETH
                      </p>
                    </div>

                    <button
                      disabled={isDonating}
                      onClick={() => sendDonation()}
                      className="inline-block rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base"
                    >
                      {isDonated ? "Thank you ありがとう!" : "Donate 0.001 ETH"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                disabled={isMinting}
                onClick={() => mint(wallet.accounts[0])}
                className="inline-block rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base"
              >
                Get Free NFT
              </button>
            )}
          </div>

          {/* NFT Image */}
          <div className="h-48 overflow-hidden rounded-lg bg-gray-100 shadow-lg lg:h-auto xl:w-6/12">
            <img src="ReadyNFT-Doodle.webp" />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="bg-white pt-4 sm:pt-10 lg:pt-12">
        <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="flex flex-col items-center border-t pt-6">
            <div className="text-indigo-500">
              Contract Address on Ethereum Sepolia Testnet:
            </div>
            <a
              className="text-gray-500"
              href={`https://sepolia.etherscan.io/address/${ABI.address}`}
            >
              {ABI.address}
            </a>
          </div>
          <div className="py-8 text-center text-sm text-gray-400">
            © 2023 - Present Vitalik. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
