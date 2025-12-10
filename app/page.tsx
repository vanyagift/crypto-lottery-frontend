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

  // Регистрация / вход + загрузка билетов
  useEffect(() => {
    if (isConnected && address) {
      const registerOrLogin = async () => {
        try {
          const { data, error: selectError } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('wallet_address', address)
            .single()

          if (selectError?.code === 'PGRST116') {
            // Первый вход
            await supabase.from('users').insert({ wallet_address: address })
          } else if (data) {
            // Повторный вход
            await supabase
              .from('users')
              .update({ last_login_at: new Date().toISOString() })
              .eq('wallet_address', address)
          }

          // Загружаем ТОЛЬКО свои билеты
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
        const err = await res.json()
        alert(`Failed to buy ticket: ${err.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error(err)
      alert('Error buying ticket')
    } finally {
      setLoading(false)
    }
  }

  // Маппинг статусов
  const statusLabels: Record<string, string> = {
    bought: 'Not in draw',
    in_draw: 'In current draw',
    used: 'Used',
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
                  <div key={t.id} className="flex items-center gap-3 p-3 border rounded">
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={`${t.type} ticket`}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        ?
                      </div>
                    )}
                    <div>
                      <div className="font-mono">#{t.id}</div>
                      <div className="capitalize text-sm">{t.type}</div>
                      <div className="text-xs text-gray-600">
                        {statusLabels[t.status] || t.status}
                      </div>
                    </div>
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