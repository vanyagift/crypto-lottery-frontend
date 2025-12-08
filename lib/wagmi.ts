// lib/wagmi.ts
import { http, createConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { WagmiProvider } from 'wagmi' // 👈 Добавь эту строку

export const config = createConfig({
  chains: [bscTestnet, bsc],
  connectors: [injected()],
  transports: {
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
  },
})

export { WagmiProvider } // 👈 Экспортируй WagmiProvider

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}