// app/page.tsx
'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import { ConnectWallet } from '@/components/ConnectWallet'

export default function HomePage() {
  const { address, isConnected } = useAccount()

  // При подключении — создаём запись в users (если нет)
  useEffect(() => {
    if (isConnected && address) {
      const registerUser = async () => {
        const { data } = await supabase
          .from('users')
          .select('wallet_address')
          .eq('wallet_address', address)
          .single()

        if (!data) {
          await supabase
            .from('users')
            .insert({ wallet_address: address })
        }
      }
      registerUser()
    }
  }, [isConnected, address])

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Crypto Lottery</h1>
        <ConnectWallet />
      </header>

      {isConnected ? (
        <div className="bg-green-50 p-4 rounded">
          <p className="text-green-800">
            ✅ Вы вошли как: <code className="font-mono">{address}</code>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Ваш аккаунт автоматически создан в системе.
          </p>
        </div>
      ) : (
        <p>Подключите кошелёк, чтобы продолжить</p>
      )}
    </div>
  )
}