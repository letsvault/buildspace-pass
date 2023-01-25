import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import "../components/GlobeAnim/GlobeAnim.css";
import { PaperSDKProvider } from "@paperxyz/react-client-sdk";

const activeChainId = ChainId.Polygon;
const clientId = process.env.NEXT_PUBLIC_PAPER_UNIVERSITY_ACCESS_CLIENT_ID;
const chainName = "Polygon";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PaperSDKProvider 
      chainName={chainName}
      clientId={clientId}>
      <ThirdwebProvider 
        desiredChainId={activeChainId}
      >
        <Component {...pageProps} />
      </ThirdwebProvider>
    </PaperSDKProvider>
  );
}

export default MyApp;
