import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { useMutation, useQuery } from '@tanstack/react-query'
import { saveSession, fetchLeaderboard } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types/game'
import { Trophy, Play, Home } from 'lucide-react'
import Confetti from 'react-confetti'
import toast from 'react-hot-toast'

export function ScoreboardPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const [showConfetti, setShowConfetti] = useState(() => state.status === 'finished')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [teamName, setTeamName] = useState('')

  const isPostGame = state.status === 'finished'

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => fetchLeaderboard(10),
  })

  const sortedTeams = [...state.teams].sort((a, b) => (b.score || 0) - (a.score || 0))
  const winner = sortedTeams[0]

  const saveMutation = useMutation({
    mutationFn: async (data: { displayName: string; teamName?: string }) => {
      const hasTie = state.teams.length >= 2 && sortedTeams[0] && sortedTeams[1] && (sortedTeams[0].score ?? 0) === (sortedTeams[1].score ?? 0)
      await saveSession({
        sessionId: state.sessionId!,
        teams: state.teams,
        rounds: state.rounds,
        playedAt: new Date().toISOString(),
        winner: hasTie ? undefined : winner?.name,
        selectedMode: state.selectedMode ?? undefined,
        roundsPerMode: state.totalRoundsForMode || undefined,
        difficulty: state.difficulty,
      })
      return fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: data.displayName,
          teamName: data.teamName,
          score: winner?.score || 0,
          sessionId: state.sessionId,
        }),
      }).then((res) => res.json())
    },
    onSuccess: () => {
      toast.success('Saved to leaderboard!')
      setShowSaveDialog(false)
      setDisplayName('')
      setTeamName('')
    },
    onError: () => {
      toast.error('Failed to save to leaderboard')
    },
  })

  useEffect(() => {
    if (!isPostGame) return
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [isPostGame])

  const handleSaveToLeaderboard = () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name')
      return
    }
    saveMutation.mutate({ displayName: displayName.trim(), teamName: teamName.trim() || undefined })
  }

  const handleNewGame = () => {
    dispatch({ type: 'RESET' })
    navigate('/setup')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('min-h-screen bg-parchment p-4 sm:p-6 font-sans relative')}
    >
      {isPostGame && showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-mahogany mb-4">
            {isPostGame ? 'Game Over!' : 'Leaderboard'}
          </h1>
          {isPostGame && <p className="text-warmBrown text-lg">Final Standings</p>}
        </motion.div>

        {isPostGame && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-gradient-to-br from-gold/20 to-transparent border-2 border-gold">
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                    className="flex justify-center mb-4"
                  >
                    <Trophy className="h-16 w-16 text-gold" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-mahogany">Winner!</h2>
                  <p className="text-2xl font-semibold text-mahogany">{winner?.name}</p>
                  <motion.p
                    key={winner?.score}
                    initial={{ scale: 1.2, color: '#C9963A' }}
                    animate={{ scale: 1, color: '#4A1C0E' }}
                    className="text-4xl font-bold text-mahogany"
                  >
                    {winner?.score || 0} points
                  </motion.p>
                </div>
              </Card>
            </motion.div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-mahogany">Final Scores</h3>
              <AnimatePresence>
                {sortedTeams.map((team, index) => {
                  const isWinner = index === 0

                  return (
                    <motion.div
                      key={team.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={cn(
                          'p-4',
                          isWinner && 'ring-2 ring-gold bg-gradient-to-r from-gold/10 to-transparent'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isWinner && <Trophy className="h-6 w-6 text-gold" />}
                            <span className="font-semibold text-mahogany text-lg">{team.name}</span>
                          </div>
                          <span className="text-2xl font-bold text-mahogany tabular-nums">
                            {team.score || 0}
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setShowSaveDialog(true)} variant="outline" size="lg" className="min-h-[44px]">
                Save to Leaderboard
              </Button>
              <Button onClick={handleNewGame} size="lg" className="min-h-[44px]">
                <Play className="h-4 w-4 mr-2" />
                New Game
              </Button>
            </div>
          </>
        )}

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-mahogany">
            {isPostGame ? 'Global Leaderboard' : 'Top Scores'}
          </h3>
          {leaderboard.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-warmBrown">No entries yet. Be the first!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                  <motion.div
                    key={entry.sessionId || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-mahogany">{entry.displayName}</p>
                          {entry.teamName && (
                            <p className="text-sm text-warmBrown">{entry.teamName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-mahogany">{entry.score}</p>
                          <p className="text-xs text-warmBrown">points</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {!isPostGame && (
          <div className="flex justify-center">
            <Button onClick={() => navigate('/')} variant="outline" size="lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        )}
      </div>

      {isPostGame && (
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save to Leaderboard</DialogTitle>
              <DialogDescription>
                Enter your name to save this game to the leaderboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-mahogany mb-2">
                  Display Name *
                </label>
                <Input
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mahogany mb-2">
                  Team Name (optional)
                </label>
                <Input
                  placeholder={winner?.name}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveToLeaderboard} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  )
}
