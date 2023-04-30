import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiConfig, createClient, configureChains, mainnet } from "wagmi"
import { publicProvider } from 'wagmi/providers/public'
import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"

export const { chains, provider } = configureChains(
  [mainnet],
  [publicProvider()]
)

const client = createClient({
  autoConnect: true,
  provider,
})

export default function App({ Component, pageProps }: AppProps<{ session: Session;}>) {
  return <WagmiConfig client={client}><SessionProvider session={pageProps.session} refetchInterval={0}><Component {...pageProps} /></SessionProvider></WagmiConfig>
}
