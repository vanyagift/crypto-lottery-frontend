// app/api/buy-ticket/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address } = await req.json()

    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address is required' }, { status: 400 })
    }

// Атомарно выбираем и присваиваем билет
const { data: tickets, error: rpcError } = await supabase.rpc('get_and_assign_ticket', { wallet_address });

if (rpcError) {
  console.error('RPC error:', rpcError);
  return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 500 });
}

// RPC возвращает массив, даже если одна строка
const ticket = Array.isArray(tickets) ? tickets[0] : tickets;

if (!ticket) {
  return NextResponse.json({ error: 'No available tickets' }, { status: 404 });
}

    return NextResponse.json({
      id: ticket.id,
      type: ticket.type,
      status: ticket.status,
      owner: ticket.owner,
      image: ticket.image || '/default-ticket.png',
      created_at: ticket.created_at,
    })

  } catch (err) {
    console.error('Unexpected error in /api/buy-ticket:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}