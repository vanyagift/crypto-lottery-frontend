// components/ConnectWallet.tsx
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <button
        onClick={() => connect()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div>
        {address?.slice(0, 6)}...{address?.slice(-4)}
        {chain?.id !== 97 && (
          <span className="ml-2 text-red-500">→ Switch to BSC Testnet</span>
        )}
      </div>
      <button
        onClick={() => disconnect()}
        className="text-sm text-gray-500 underline"
      >
        Disconnect
      </button>
    </div>
  )
}