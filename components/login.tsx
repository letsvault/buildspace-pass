import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { Page } from "../pages";
import {
    CreateWallet,
    PaperUser,
    LoginWithPaper
  } from "@paperxyz/react-client-sdk";

interface loginProps {
    email: string,
    setEmail: Function;
    creatingWallet: boolean,
    setCreatingWallet: Function,
    recipientWalletAddress: string | undefined,
    setRecipientWalletAddress: Function,
    setUserCode: Function,
    exchangeCodeForToken: Function;
    setCurrentPage: Function;
}

const Login = (props: loginProps) => {
    const { 
        email, 
        setEmail, 
        creatingWallet, 
        setCreatingWallet, 
        recipientWalletAddress,
        setRecipientWalletAddress, 
        setUserCode, 
        exchangeCodeForToken,
        setCurrentPage,
    } = props;

    return (
        <>
            <div className={styles.loginComponent}>
              <div className={styles.signinOption}>
                <div>
                  <h3 className={styles.signinOptionTitle}>Get yours here (2 steps)</h3>
                  <ul>
                    <li>Register</li>
                    <li>Claim</li>
                  </ul>
                </div>
                <div className={styles.createWalletForm}>
                <input 
                  className={styles.createWalletInput}
                  type="email"
                  placeholder="Your Email Address"
                  onChange={(e) => setEmail(e.target.value)}
                  />
                  <CreateWallet
                    sendEmailOnCreation={true}
                    emailAddress={email}
                    onEmailVerificationInitiated={() => setCreatingWallet(true)}
                    onSuccess={(user: PaperUser) => {
                      setRecipientWalletAddress(user.walletAddress);
                      setCurrentPage(Page.CLAIM_NEW_PASS);
                    }}
                    onError={(error) => {
                      console.log("error", error);
                    }}
                  >
                    {/* @ts-ignore */}
                    <button 
                      className={styles.createWalletButton}
                      disabled={!email || creatingWallet}
                    >
                    {creatingWallet ? ('Loading...') : ('Submit')}
                    </button>
                  </CreateWallet>
                </div>
              </div>
              <div className={styles.signinOption}>
              <h3 className={styles.signinOptionTitle}>Been here before?</h3>
              <LoginWithPaper 
              onSuccess={async (code: string) => {
                setUserCode(code);
                exchangeCodeForToken(code);
              }}>
                {/* @ts-ignore */}
                <button className={styles.loginButton}>Log In</button>
             </LoginWithPaper> 
              </div>
            </div>
            {creatingWallet && !recipientWalletAddress ? (<h3>First time here? Check your email inbox!</h3>) : ("")}
          </>
    )
};

export default Login;