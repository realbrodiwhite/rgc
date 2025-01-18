'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

function generateBingoCard() {
  const card = []
  for (let i = 0; i < 5; i++) {
    const column = []
    for (let j = 0; j < 5; j++) {
      column.push({
        number: Math.floor(Math.random() * 15) + 1 + (i * 15),
        marked: false
      })
    }
    card.push(column)
  }
  card[2][2] = { number: 'FREE', marked: true }
  return card
}

export default function Bingo() {
  const { data: session } = useSession()
  const router = useRouter()
  const [card, setCard] = useState(generateBingoCard())
  const [drawnNumbers, setDrawnNumbers] = useState([])
  const [gameStatus, setGameStatus] = useState('waiting')
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else {
      fetchCredits()
    }
  }, [session, router])

  const fetchCredits = async () => {
    const response = await fetch('/api/credits')
    if (response.ok) {
      const data = await response.json()
      setCredits(data.credits)
    }
  }

  const startGame = async () => {
    if (credits < 10) {
      alert('Not enough credits to play. You need 10 credits.')
      return
    }

    const response = await fetch('/api/credits/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 10 }),
    })

    if (response.ok) {
      const data = await response.json()
      setCredits(data.credits)
      setGameStatus('playing')
      drawNumber()
    } else {
      alert('Failed to start the game. Please try again.')
    }
  }

  const drawNumber = () => {
    if (drawnNumbers.length === 75) {
      endGame(false)
      return
    }

    let number
    do {
      number = Math.floor(Math.random() * 75) + 1
    } while (drawnNumbers.includes(number))

    setDrawnNumbers(prev => [...prev, number])
    checkCard(number)
  }

  const checkCard = (number) => {
    const newCard = card.map(column =>
      column.map(cell =>
        cell.number === number ? { ...cell, marked: true } : cell
      )
    )
    setCard(newCard)

    if (checkWin(newCard)) {
      endGame(true)
    }
  }

  const checkWin = (card) => {
    // Check rows and columns
    for (let i = 0; i < 5; i++) {
      if (card[i].every(cell => cell.marked) || card.every(column => column[i].marked)) {
        return true
      }
    }

    // Check diagonals
    if (card[0][0].marked && card[1][1].marked && card[3][3].marked && card[4][4].marked) return true
    if (card[0][4].marked && card[1][3].marked && card[3][1].marked && card[4][0].marked) return true

    return false
  }

  const endGame = async (won) => {
    setGameStatus('ended')
    if (won) {
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50 }),
      })

      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits)
        alert('Congratulations! You won 50 credits!')
      }
    } else {
      alert('Game over! Better luck next time!')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bingo</h1>
      <p className="mb-4">Credits: {credits}</p>
      {gameStatus === 'waiting' && (
        <button
          onClick={startGame}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Start Game (10 credits)
        </button>
      )}
      {gameStatus === 'playing' && (
        <button
          onClick={drawNumber}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Draw Number
        </button>
      )}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {card.map((column, i) => (
          <div key={i}>
            {column.map((cell, j) => (
              <div
                key={j}
                className={`border p-2 text-center ${cell.marked ? 'bg-yellow-200' : ''}`}
              >
                {cell.number}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Drawn Numbers</h2>
        <div className="flex flex-wrap gap-2">
          {drawnNumbers.map(number => (
            <span key={number} className="bg-gray-200 px-2 py-1 rounded">
              {number}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

