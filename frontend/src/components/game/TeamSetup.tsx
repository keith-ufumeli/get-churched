import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Team } from '@/types/game'
import { Plus, Trash2 } from 'lucide-react'

const TEAM_COLORS = [
  { name: 'Gold', value: '#D97706' },
  { name: 'Olive', value: '#6B7C1F' },
  { name: 'Rust', value: '#B45309' },
  { name: 'Ink Blue', value: '#1E3A8A' },
  { name: 'Mahogany', value: '#4A1C0E' },
  { name: 'Warm Brown', value: '#78350F' },
]

interface TeamSetupProps {
  teams: Team[]
  onAddTeam: (team: Team) => void
  onRemoveTeam: (index: number) => void
  onStartGame: () => void
  className?: string
}

export function TeamSetup({ teams, onAddTeam, onRemoveTeam, onStartGame, className }: TeamSetupProps) {
  const [teamName, setTeamName] = useState('')
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)

  const handleAddTeam = () => {
    if (teamName.trim()) {
      onAddTeam({
        name: teamName.trim(),
        color: selectedColor,
        score: 0,
      })
      setTeamName('')
      setSelectedColor(undefined)
    }
  }

  const canStart = teams.length >= 2

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
            className="flex-1"
          />
          <Button onClick={handleAddTeam} disabled={!teamName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {TEAM_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(selectedColor === color.value ? undefined : color.value)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                selectedColor === color.value ? 'border-mahogany scale-110' : 'border-gray-300'
              )}
              style={{ backgroundColor: color.value }}
              aria-label={`Select ${color.name} color`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-mahogany">
          Teams ({teams.length})
        </h3>
        <AnimatePresence mode="popLayout">
          {teams.map((team, index) => (
            <motion.div
              key={`${team.name}-${index}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {team.color && (
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: team.color }}
                      />
                    )}
                    <span className="font-semibold text-mahogany">{team.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveTeam(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {teams.length === 0 && (
          <p className="text-sm text-warmBrown text-center py-8">
            Add at least 2 teams to start the game
          </p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={onStartGame}
          disabled={!canStart}
          className="w-full"
          size="lg"
        >
          Start Game
        </Button>
        {!canStart && teams.length > 0 && (
          <p className="text-sm text-warmBrown text-center mt-2">
            Add at least one more team to start
          </p>
        )}
      </motion.div>
    </div>
  )
}
