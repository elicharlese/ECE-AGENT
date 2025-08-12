"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Player = "X" | "O" | null
type Board = Player[]

interface TicTacToeAppProps {
  onShare?: (result: string) => void
}

export function TicTacToeApp({ onShare }: TicTacToeAppProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
  const [winner, setWinner] = useState<Player>(null)
  const [gameOver, setGameOver] = useState(false)

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ]

  const checkWinner = (board: Board): Player => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  const handleCellClick = (index: number) => {
    if (board[index] || winner || gameOver) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      setGameOver(true)
    } else if (newBoard.every((cell) => cell !== null)) {
      setGameOver(true)
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setGameOver(false)
  }

  const handleShare = () => {
    let result = ""
    if (winner) {
      result = `🎮 Tic Tac Toe: Player ${winner} wins!`
    } else if (gameOver) {
      result = "🎮 Tic Tac Toe: It's a tie!"
    } else {
      result = `🎮 Tic Tac Toe: Player ${currentPlayer}'s turn`
    }
    onShare?.(result)
  }

  return (
    <Card className="w-full max-w-xs mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tic Tac Toe</CardTitle>
          {!gameOver && <Badge variant="outline">Player {currentPlayer}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Status */}
        {winner && (
          <div className="text-center">
            <Badge className="bg-green-500 text-white">Player {winner} Wins! 🎉</Badge>
          </div>
        )}
        {gameOver && !winner && (
          <div className="text-center">
            <Badge variant="outline">It's a Tie! 🤝</Badge>
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-2 aspect-square">
          {board.map((cell, index) => (
            <Button
              key={index}
              variant="outline"
              className="aspect-square text-2xl font-bold bg-transparent"
              onClick={() => handleCellClick(index)}
              disabled={!!cell || gameOver}
            >
              {cell}
            </Button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={resetGame} variant="outline" className="flex-1 bg-transparent">
            New Game
          </Button>
          <Button onClick={handleShare} className="flex-1">
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
