// app/page.tsx
'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import { ConnectWallet } from '@/components/ConnectWallet'

export default function HomePage() {
  const { address, isConnected } = useAccount()

  // On connect — create user or update last_login_at
useEffect(() => {
  if (isConnected && address) {
    const registerOrLogin = async () => {
      try {
        const { data, error: selectError } = await supabase
          .from('users')
          .select('wallet_address')
          .eq('wallet_address', address)
          .single()

        if (selectError) {
          console.error('Select error:', selectError)
          return
        }

        if (!data) {
          console.log('Creating new user')
          const { error: insertError } = await supabase
            .from('users')
            .insert({ wallet_address: address })
          if (insertError) console.error('Insert error:', insertError)
        } else {
          console.log('Updating last_login_at for:', address)
          const { error: updateError } = await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('wallet_address', address)
          if (updateError) console.error('Update error:', updateError)
          else console.log('✅ last_login_at updated successfully')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
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
          <p className="text-sm text-gray-600 mt-2">
            Authorization successful.
          </p>
        </div>
      ) : (
        <p>Connect your wallet to continue</p>
      )}
    </div>
  )
}