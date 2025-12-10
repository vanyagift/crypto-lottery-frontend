// app/api/buy-ticket/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address } = await req.json()

    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address is required' }, { status: 400 })
    }

    // Атомарная покупка через RPC
    const {  ticket, error: rpcError } = await supabase
      .rpc('get_and_assign_ticket', { wallet_address })

    if (rpcError) {
      console.error('RPC error:', rpcError)
      return NextResponse.json(
        { error: 'No available tickets or internal error' },
        { status: 500 }
      )
    }

    if (!ticket) {
      return NextResponse.json(
        { error: 'No tickets available. Please mint more.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: ticket.id,
      type: ticket.type,
      status: ticket.status,
      owner: ticket.owner,
      image: ticket.image || '/default-ticket.png',
      bet_amount: ticket.bet_amount,
      created_at: ticket.created_at,
    })

  } catch (err) {
    console.error('Unexpected error in /api/buy-ticket:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}