// app/page.tsx (обновлённый фрагмент)
'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import { ConnectWallet } from '@/components/ConnectWallet'

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const [tickets, setTickets] = useState<any[]>([])
  const [currentDraw, setCurrentDraw] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!isConnected || !address) return

      // 1. Регистрация / вход
      const { data } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('wallet_address', address)
        .single()

      if (!data) {
        await supabase.from('users').insert({ wallet_address: address })
      }

      // 2. Загрузка активного розыгрыша
      const {  draw } = await supabase
        .from('draws')
        .select('*')
        .eq('status', 'active')
        .order('end_at', { ascending: false })
        .limit(1)
        .single()

      if (draw) {
        // Подсчёт участников: билеты в этом розыгрыше с уникальными owner
        const {  count } = await supabase
          .from('tickets')
          .select('owner', { count: 'exact', distinct: true })
          .eq('draw_id', draw.id)
          .not('owner', 'is', null)

        setCurrentDraw({
          ...draw,
          participants: count || 0,
        })
      }

      // 3. Загрузка билетов пользователя
      const {  userTickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('owner', address)
        .order('created_at', { ascending: false })

      setTickets(userTickets || [])
    }

    init()
  }, [isConnected, address])

  const handleEnterDraw = () => {
    if (!currentDraw) return
    alert('Opening ticket selection modal (not implemented yet)')
    // TODO: открыть модалку с выбором билетов для участия
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Crypto Lottery Today</h1>
        <ConnectWallet />
      </header>

      {isConnected ? (
        <div className="space-y-6">
          {/* 🔢 Блок текущего розыгрыша */}
          {currentDraw ? (
            <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold mb-2">Draw #{currentDraw.id}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Prize Pool:</span>{' '}
                  <span className="font-bold">${currentDraw.prize_pool.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Jackpot:</span>{' '}
                  <span className="font-bold text-amber-600">${currentDraw.jackpot.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Participants:</span>{' '}
                  <span className="font-bold">{currentDraw.participants}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ends at:</span>{' '}
                  <span className="font-bold">
                    {new Date(currentDraw.end_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={handleEnterDraw}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Enter Draw
              </button>
            </div>
          ) : (
            <div className="p-4 text-gray-500 italic">
              No active draw currently. Next draw starts soon.
            </div>
          )}

          {/* 🎟️ Список билетов */}
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

          {/* 💰 Кнопка Buy Ticket (можно оставить ниже) */}
          <button
            onClick={async () => {
              const res = await fetch('/api/buy-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet_address: address }),
              })
              if (res.ok) {
                const newTicket = await res.json()
                setTickets((prev) => [newTicket, ...prev])
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Buy Ticket
          </button>
        </div>
      ) : (
        <p>Connect your wallet to continue</p>
      )}
    </div>
  )
}