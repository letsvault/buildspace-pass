import { useContract } from "@thirdweb-dev/react";
import { useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { NFTMetadata } from "@thirdweb-dev/sdk";
import { ThirdwebNftMedia } from "@thirdweb-dev/react";
import { LoginWithPaper } from "@paperxyz/react-client-sdk";
import  Image  from "next/image"
import Login from "../components/login";
import Connect from "../components/connect";
import GlobeAnim from "../components/GlobeAnim/GlobeAnim"

export enum Page {
  LOGIN = 'login',
  CLAIM_NEW_PASS = 'claim new pass',
  VIEW_PASS = 'view pass',
  LOADING = 'loading',
}

const Home: NextPage = () => {
  const { contract } = useContract(
    process.env.CONTRACT_ADDRESS, 
    "edition-drop"
  );

  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [email, setEmail] = useState<string>("");
  const [loggingIn, setLoggingIn ] = useState<boolean>(false);
  const [minting, setMinting] = useState<boolean>(false);
  const [mintedNft, setMintedNft] = useState<NFTMetadata | null>(null);
  const [recipientWalletAddress, setRecipientWalletAddress] = useState<string>("");
  const [creatingWallet, setCreatingWallet] = useState<boolean>(false);
  const [userCode, setUserCode] = useState<string>("");

  async function mintNft() {
    setMinting(true);

    try {
      const result = await fetch("/api/mint-nft", {
        method: "POST",
        body: JSON.stringify({recipientWalletAddress}),
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      const mintedNftMetadata = await result.json();

      setMintedNft(mintedNftMetadata as NFTMetadata);
      setCurrentPage(Page.VIEW_PASS);

    } catch (error){
      console.log(error);
      alert("Something went wrong. Please try again.")
    } finally {
      setMinting(false);
    }
  }

  async function exchangeCodeForToken(code: string) {
    setLoggingIn(true);
    try {
      const response = await fetch('/api/exchange-user-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const token = await response.json();

      if (token) {
        getUserDetails(token);
        getBalance(token);
      }

    } catch (error){
      console.log(error);
    }
  }

  async function getUserDetails(userToken: string) {
    try {
      const response = await fetch('/api/get-user-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userToken }),
      });

      const userDetails = await response.json();
      setEmail(userDetails.email);
      setRecipientWalletAddress(userDetails.walletAddress);

      console.log(userDetails);

    } catch (error){
      console.log(error);
    }
  }

  async function getBalance(userToken: string) {
    try {
      const response = await fetch('/api/get-access-pass-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userToken }),
      });

      const nftsHeld = await response.json();

      if (nftsHeld) {
        setMintedNft(nftsHeld as NFTMetadata);
      }

      setLoggingIn(false);
      setCurrentPage(Page.VIEW_PASS);

    } catch (error){
      console.log(error);
    }
  }
  
  return (
    <div className={styles.container}>
      <header>
      </header>
      <main className={styles.main}>
        {currentPage === Page.LOGIN && (
          <div>
            <h1 style={{'marginBottom':'.5rem'}}>buildspace <span style={{color: "#537FE7"}}>nights + weekends s2 </span></h1>
            <h2 style={{'marginTop':'0px'}}>Builder Pass</h2>
          </div>
        )}

        {loggingIn && (
          <h2>Retreiving your Builder Pass...</h2>
        )}

        {!loggingIn && currentPage === Page.LOGIN && (
          <div>
            <Login
              email={email} 
              setEmail={setEmail} 
              creatingWallet={creatingWallet} 
              setCreatingWallet={setCreatingWallet} 
              recipientWalletAddress={recipientWalletAddress}
              setRecipientWalletAddress={setRecipientWalletAddress}
              setUserCode={setUserCode} 
              exchangeCodeForToken={exchangeCodeForToken}
              setCurrentPage={setCurrentPage}/>
              <GlobeAnim />
            </div>

        )}

        {currentPage === Page.CLAIM_NEW_PASS && (
          <>
            <h2>Hi, builder! 👋 </h2>
            <button 
              className={styles.mintNftButton}
              // Change back to mintNft() 
              onClick={() => setCurrentPage(Page.VIEW_PASS)}
              disabled={mintedNft !== null}
            >
                {minting ? ("Loading...") : ("Get Your Builder Pass")}
            </button>
          </>
        )}

        {currentPage === Page.VIEW_PASS && mintedNft !== null && (
          <div>
            <Connect
            mintedNft={mintedNft ? mintedNft : null}
            ></Connect>
        </div>
        )}

      </main>
    </div>
  );
};

export default Home;
