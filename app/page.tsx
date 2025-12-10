// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import { ConnectWallet } from '@/components/ConnectWallet'

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // При подключении — регистрация/вход + загрузка билетов
  useEffect(() => {
    if (isConnected && address) {
      const registerOrLogin = async () => {
        try {
          const { data, error: selectError } = await supabase
            .from('users')
            .select('wallet_address, created_at')
            .eq('wallet_address', address)
            .single()

          if (selectError?.code === 'PGRST116') {
            // Пользователь не найден → создаём
            await supabase
              .from('users')
              .insert({ wallet_address: address })
          } else if (data) {
            // Обновляем last_login_at при каждом входе
            await supabase
              .from('users')
              .update({ last_login_at: new Date().toISOString() })
              .eq('wallet_address', address)
          }

          // Загружаем билеты пользователя
          const { data: userTickets, error } = await supabase
         .from('tickets')
         .select('*')
         .eq('owner', address)
         .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to load tickets:', error)
        } else {
        setTickets(userTickets || [])
        }
        } catch (err) {
          console.error('Auth or fetch error:', err)
        }
      }

      registerOrLogin()
    }
  }, [isConnected, address])

  const handleBuyTicket = async () => {
    if (!address) return
    setLoading(true)
    try {
      const res = await fetch('/api/buy-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      })
      if (res.ok) {
        const newTicket = await res.json()
        setTickets((prev) => [newTicket, ...prev])
      } else {
        alert('Failed to buy ticket')
      }
    } catch (err) {
      console.error(err)
      alert('Error buying ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Crypto Lottery Today</h1>
        <ConnectWallet />
      </header>

      {isConnected ? (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded">
            <p className="text-green-800">
              ✅ Authorized as: <code className="font-mono">{address}</code>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Authorization successful.
            </p>
          </div>

          <div>
            <button
              onClick={handleBuyTicket}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {loading ? 'Buying...' : 'Buy Ticket'}
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Your Tickets</h2>
            {tickets.length === 0 ? (
              <p className="text-gray-500">No tickets yet. Buy your first one!</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div key={t.id} className="p-3 border rounded">
                    <span className="font-mono">#{t.id}</span> ·{' '}
                    <span className="capitalize">{t.type}</span> ·{' '}
                    {t.status === 'available' ? 'Not in draw' : t.status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>Connect your wallet to continue</p>
      )}
    </div>
  )
}