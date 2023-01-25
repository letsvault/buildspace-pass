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
        <nav className={styles.navBar}>
          <div className={styles.headerLogo}>
          <Image width={50} height={50} src="/favicon.ico" alt="access pass logo"></Image>
          </div>
          <div className={styles.navButtons}>
            {/* UNCOMMENT ONCE HOW IT WORKS IS LIVE */}
            {/* <button className={styles.howItWorksButton}>
              How it works
            </button> */}
            <LoginWithPaper 
              onSuccess={async (code: string) => {
                setUserCode(code);
                exchangeCodeForToken(code);
              }}>
                {/* @ts-ignore */}
                <button className={styles.loginButton}>{currentPage === Page.LOGIN ? "Login" : "Logged In"}</button>
             </LoginWithPaper> 
          </div>
        </nav>
      </header>
      <main className={styles.main}>
        {currentPage === Page.LOGIN && (
          <h1>Get Your <span style={{color: "#537FE7"}}>University Alumni </span>Access Pass</h1>
        )}

        {loggingIn && (
          <h2>Retreiving your Access Pass...</h2>
        )}

        {!loggingIn && currentPage === Page.LOGIN && (
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
        )}

        {currentPage === Page.CLAIM_NEW_PASS && (
          <>
            <h2>Hi, Alum! 👋 </h2>
            <button 
              onClick={() => mintNft()}
              disabled={mintedNft !== null}
            >
                {minting ? ("Loading...") : ("Get Your Access Pass")}
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

        <div style={{marginTop: '20px'}}>
          <p>If you have any issues {currentPage === Page.LOGIN ? "claiming or " : ""} connecting, reach out to us at team@letsvault.xyz.</p>
        </div>
        <GlobeAnim />
      </main>
    </div>
  );
};

export default Home;
