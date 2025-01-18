import { useState, useEffect } from 'react'

type LeaderboardEntry = {
  id: string
  name: string
  credits: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Rank</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-right">Credits</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={entry.id} className="border-b">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{entry.name}</td>
              <td className="p-2 text-right">{entry.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

