import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { filecoinHyperspace } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import Layout from "../components/layout";

export const { chains, provider } = configureChains(
  [filecoinHyperspace],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
});

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session }>) {
  return (
    <WagmiConfig client={client}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </WagmiConfig>
  );
}
