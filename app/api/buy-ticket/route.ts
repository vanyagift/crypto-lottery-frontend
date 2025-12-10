// app/api/buy-ticket/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address } = await req.json()

    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address required' }, { status: 400 })
    }

    // Выбираем 1 случайный доступный билет (исключаем gift/ref)
    const { data: availableTickets, error: selectError } = await supabase
      .from('tickets')
      .select('id, type')
      .eq('owner', null)
      .not('type', 'in', '("gift","ref")')
      .order('RANDOM()')
      .limit(1)

    if (selectError) {
      console.error('Select error:', selectError)
      return NextResponse.json({ error: 'Failed to find available tickets' }, { status: 500 })
    }

    if (!availableTickets || availableTickets.length === 0) {
      // Можно запустить авто-минт здесь (пока просто ошибка)
      return NextResponse.json({ error: 'No tickets available — minting soon!' }, { status: 404 })
    }

    const ticket = availableTickets[0]

    // Присваиваем владельца
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ owner: wallet_address, status: 'available' })
      .eq('id', ticket.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 500 })
    }

    // Возвращаем билет
    return NextResponse.json({
      id: ticket.id,
      type: ticket.type,
      status: 'available',
      owner: wallet_address,
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}