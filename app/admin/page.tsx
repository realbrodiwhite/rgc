'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function AdminPanel() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [newGame, setNewGame] = useState({ name: '', description: '', type: 'SLOT_MACHINE' })

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers()
      fetchGames()
    }
  }, [session])

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
    }
    setLoading(false)
  }

  const fetchGames = async () => {
    const response = await fetch('/api/admin/games')
    if (response.ok) {
      const data = await response.json()
      setGames(data)
    }
  }

  const handleDeleteUser = async (userId) => {
    const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (response.ok) {
      fetchUsers()
    }
  }

  const handleAddGame = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGame),
    })
    if (response.ok) {
      fetchGames()
      setNewGame({ name: '', description: '', type: 'SLOT_MACHINE' })
    }
  }

  const handleDeleteGame = async (gameId) => {
    const response = await fetch(`/api/admin/games/${gameId}`, { method: 'DELETE' })
    if (response.ok) {
      fetchGames()
    }
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div>Access denied. Admin only.</div>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">User Management</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Credits</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.credits}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Game Management</h3>
        <form onSubmit={handleAddGame} className="mb-4">
          <input
            type="text"
            placeholder="Game Name"
            value={newGame.name}
            onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
            className="border p-2 mr-2"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newGame.description}
            onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
            className="border p-2 mr-2"
            required
          />
          <select
            value={newGame.type}
            onChange={(e) => setNewGame({ ...newGame, type: e.target.value })}
            className="border p-2 mr-2"
          >
            <option value="SLOT_MACHINE">Slot Machine</option>
            <option value="BINGO">Bingo</option>
            <option value="SKILL_BASED">Skill Based</option>
          </select>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Add Game
          </button>
        </form>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td className="border p-2">{game.id}</td>
                <td className="border p-2">{game.name}</td>
                <td className="border p-2">{game.description}</td>
                <td className="border p-2">{game.type}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

