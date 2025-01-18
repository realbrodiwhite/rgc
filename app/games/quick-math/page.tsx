'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getEdgeConfig } from '@/lib/edgeConfig'

function generateProblem() {
  const operators = ['+', '-', '*']
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const operator = operators[Math.floor(Math.random() * operators.length)]
  
  let answer
  switch (operator) {
    case '+':
      answer = num1 + num2
      break
    case '-':
      answer = num1 - num2
      break
    case '*':
      answer = num1 * num2
      break
  }

  return { problem: `${num1} ${operator} ${num2}`, answer }
}

export default function QuickMath() {
  const { data: session } = useSession()
  const router = useRouter()
  const [credits, setCredits] = useState(0)
  const [problem, setProblem] = useState({ problem: '', answer: 0 })
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStatus, setGameStatus] = useState('waiting')

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else {
      fetchCredits()
    }
  }, [session, router])

  useEffect(() => {
    if (gameStatus === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            endGame()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStatus])

  const fetchCredits = async () => {
    const response = await fetch('/api/credits')
    if (response.ok) {
      const data = await response.json()
      setCredits(data.credits)
    }
  }

  const startGame = async () => {
    const gameCost = await getEdgeConfig('quickMathCost') || 5
    if (credits < gameCost) {
      alert(`Not enough credits to play. You need ${gameCost} credits.`)
      return
    }

    const response = await fetch('/api/credits/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: gameCost }),
    })

    if (response.ok) {
      const data = await response.json()
      setCredits(data.credits)
      setGameStatus('playing')
      setScore(0)
      setTimeLeft(60)
      newProblem()
    } else {
      alert('Failed to start the game. Please try again.')
    }
  }

  const newProblem = () => {
    setProblem(generateProblem())
    setUserAnswer('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (parseInt(userAnswer) === problem.answer) {
      setScore((prevScore) => prevScore + 1)
    }
    newProblem()
  }

  const endGame = async () => {
    setGameStatus('ended')
    const creditsWon = score * 2
    const response = await fetch('/api/credits/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: creditsWon }),
    })

    if (response.ok) {
      const data = await response.json()
      setCredits(data.credits)
      alert(`Game over! You solved ${score} problems and won ${creditsWon} credits!`)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Quick Math</h1>
      <p className="mb-4">Credits: {credits}</p>
      {gameStatus === 'waiting' && (
        <button
          onClick={startGame}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Start Game (5 credits)
        </button>
      )}
      {gameStatus === 'playing' && (
        <div>
          <p className="mb-2">Time left: {timeLeft} seconds</p>
          <p className="mb-2">Score: {score}</p>
          <p className="text-2xl font-bold mb-4">{problem.problem} = ?</p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="border p-2 flex-grow"
              autoFocus
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Submit
            </button>
          </form>
        </div>
      )}
      {gameStatus === 'ended' && (
        <button
          onClick={() => setGameStatus('waiting')}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Play Again
        </button>
      )}
    </div>
  )
}

