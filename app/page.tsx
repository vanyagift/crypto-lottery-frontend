// app/page.tsx
'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import { ConnectWallet } from '@/components/ConnectWallet'

export default function HomePage() {
  const { address, isConnected } = useAccount()

  // On connect — create user (once) or update last_login_at (on every login)
  useEffect(() => {
    if (isConnected && address) {
      const registerOrLogin = async () => {
        try {
          // Проверяем, существует ли пользователь
          const { data, error: selectError } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('wallet_address', address)
            .single()

          if (selectError && selectError.code !== 'PGRST116') {
            // PGRST116 = "no rows returned" — это нормально
            console.error('Unexpected select error:', selectError)
            return
          }

          if (!data) {
            // Первый вход — создаём запись
            console.log('🆕 Creating new user:', address)
            const { error: insertError } = await supabase
              .from('users')
              .insert({ wallet_address: address })
            if (insertError) {
              console.error('Failed to create user:', insertError)
            } else {
              console.log('✅ User created with created_at = NOW()')
            }
          } else {
            // Повторный вход — обновляем last_login_at
            console.log('🔄 Updating last_login_at for:', address)
            const { error: updateError } = await supabase
              .from('users')
              .update({ last_login_at: new Date().toISOString() })
              .eq('wallet_address', address)
            if (updateError) {
              console.error('Failed to update last_login_at:', updateError)
            } else {
              console.log('✅ last_login_at updated successfully')
            }
          }
        } catch (error) {
          console.error('Unexpected error in registerOrLogin:', error)
        }
      }

      registerOrLogin()
    }
  }, [isConnected, address])

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Crypto Lottery Today</h1>
        <ConnectWallet />
      </header>

      {isConnected ? (
        <div className="bg-green-50 p-4 rounded">
          <p className="text-green-800">
            ✅ Connected as: <code className="font-mono">{address}</code>
          </p>
          <p className="text-sm text-gray-600 mt-2">Authorization successful.</p>
        </div>
      ) : (
        <p>Connect your wallet to continue</p>
      )}
    </div>
  )
}