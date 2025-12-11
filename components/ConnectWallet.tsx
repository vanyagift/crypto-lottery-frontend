// components/ConnectWallet.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function ConnectWallet() {
  const { address, isConnected, chain, connector } = useAccount() // ← добавили connector
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [showInstallMessage, setShowInstallMessage] = useState(false)

  useEffect(() => {
    if (isConnected) {
      setShowInstallMessage(false)
    }
  }, [isConnected])

  const handleConnect = () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setShowInstallMessage(true)
      return
    }
    connect({ connector: injected() })
  }

  const handleDisconnect = () => {
    // Явно передаём connector, если он есть
    if (connector) {
      disconnect({ connector })
    } else {
      disconnect()
    }
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        {chain?.id !== 97 && (
          <span className="ml-2 text-red-500 text-xs">→ Switch to BSC Testnet</span>
        )}
        <button
          onClick={handleDisconnect} // ← исправлено: handleDisconnect
          className="text-xs text-gray-500 underline"
        >
          Disconnect
        </button>
      </div>
    )
  }

  if (showInstallMessage) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md max-w-md">
        <p className="font-medium">Wallet not found</p>
        <p className="mt-1 text-sm">
          Please install{' '}
          <a
            href="https://metamask.io/download/" // ← убраны пробелы
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            MetaMask
          </a>{' '}
          to connect to the lottery.
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-blue-600 text-white rounded-md"
    >
      Connect Wallet
    </button>
  )
}