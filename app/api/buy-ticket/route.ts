// app/api/buy-ticket/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address } = await req.json()

    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address required' }, { status: 400 })
    }

    // Атомарный запрос: выбрать и обновить один билет за раз
    const { data: ticket, error: updateError } = await supabase
      .rpc('get_and_assign_ticket', { wallet_address: wallet_address })

    if (updateError) {
      console.error('RPC error:', updateError)
      return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 500 })
    }

    if (!ticket) {
      return NextResponse.json({ error: 'No tickets available. Please mint more.' }, { status: 404 })
    }

    // Возвращаем билет с image (если есть в таблице)
    return NextResponse.json({
      id: ticket.id,
      type: ticket.type,
      status: ticket.status,
      owner: ticket.owner,
      image: ticket.image || '/default-ticket.png', // Если image не указано, используем заглушку
      created_at: ticket.created_at,
    })

  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}