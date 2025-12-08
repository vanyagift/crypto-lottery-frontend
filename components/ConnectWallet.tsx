// components/ConnectWallet.tsx
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: injected() })}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
      {chain?.id !== 97 && (
        <span className="ml-2 text-red-500 text-xs">→ Switch to BSC Testnet</span>
      )}
      <button
        onClick={() => disconnect()}
        className="text-xs text-gray-500 underline"
      >
        Disconnect
      </button>
    </div>
  )
}