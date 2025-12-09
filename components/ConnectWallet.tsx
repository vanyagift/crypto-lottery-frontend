// components/ConnectWallet.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(true)

  useEffect(() => {
    // Проверяем, установлено ли MetaMask
    if (typeof window !== 'undefined' && !window.ethereum) {
      setIsMetaMaskInstalled(false)
    }
  }, [])

  if (!isMetaMaskInstalled) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-2">
          🦊 MetaMask не найден
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Установить MetaMask
        </a>
        <p className="text-sm text-gray-500 mt-2">
          Требуется расширение для браузера
        </p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: injected() })}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Подключить кошелёк
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
      {chain?.id !== 97 && (
        <span className="ml-2 text-red-500 text-xs">→ Переключите на BSC Testnet</span>
      )}
      <button
        onClick={() => disconnect()}
        className="text-xs text-gray-500 underline"
      >
        Отключить
      </button>
    </div>
  )
}