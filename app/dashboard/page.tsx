'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Leaderboard from '@/components/Leaderboard'
import { uploadToBlob } from '@/lib/blob'

const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'

export default function Dashboard() {
  const { data: session } = useSession()
  const [credits, setCredits] = useState(0)
  const [purchaseAmount, setPurchaseAmount] = useState(100)
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    const response = await fetch('/api/credits')
    if (response.ok) {
      const data = await response.json()
      setCredits(data.credits)
    }
  }

  const handlePurchase = async () => {
    const response = await fetch('/api/credits/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: purchaseAmount }),
    })

    if (response.ok) {
      const data = await response.json()
      setCredits(data.credits)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const url = await uploadToBlob(file)
        setAvatarUrl(url)
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
      <p className="mb-4">Welcome back, {session.user?.name}! Your current balance is: {credits} credits</p>
      <p className="mb-4">Current environment: {environment}</p>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Purchase Credits</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24"
          />
          <button onClick={handlePurchase} className="bg-green-600 text-white px-4 py-2 rounded">
            Purchase
          </button>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Upload Avatar</h3>
        <input type="file" onChange={handleFileUpload} accept="image/*" />
        {avatarUrl && (
          <img src={avatarUrl || "/placeholder.svg"} alt="User Avatar" className="mt-4 w-32 h-32 rounded-full object-cover" />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Available Games:</h3>
          <div className="space-y-4">
            <Link href="/games/slot-machine" className="block bg-indigo-100 p-4 rounded">
              <h4 className="font-bold">Slot Machine</h4>
              <p>Try your luck with our exciting slot machine!</p>
            </Link>
            <Link href="/games/bingo" className="block bg-green-100 p-4 rounded">
              <h4 className="font-bold">Bingo</h4>
              <p>Join a bingo room and win big!</p>
            </Link>
            <Link href="/games/quick-math" className="block bg-yellow-100 p-4 rounded">
              <h4 className="font-bold">Quick Math</h4>
              <p>Test your math skills and earn credits!</p>
            </Link>
          </div>
        </div>
        <Leaderboard />
      </div>
    </div>
  )
}

