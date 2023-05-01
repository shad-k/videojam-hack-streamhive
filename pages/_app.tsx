import type { AppProps } from "next/app";
import { useHuddle01 } from "@huddle01/react";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { filecoinHyperspace } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { LivepeerConfig } from "@livepeer/react";
import LivepeerClient from "@/lib/livepeer";

import Layout from "../components/layout";
import "@/styles/globals.css";
import React from "react";

export const { chains, provider } = configureChains(
  [filecoinHyperspace],
  [publicProvider()]
);

const client = createClient({
  autoConnect: false,
  provider,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: "streamhive",
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
});

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session }>) {
  const { initialize, isInitialized } = useHuddle01();
  React.useEffect(() => {
    (async () => {
      if (!isInitialized) {
        await initialize(process.env.NEXT_PUBLIC_YOUR_PROJECT_ID as string);
      }
    })();
  }, [initialize, isInitialized]);
  return (
    <WagmiConfig client={client}>
      <LivepeerConfig client={LivepeerClient}>
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </LivepeerConfig>
    </WagmiConfig>
  );
}
