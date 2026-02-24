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
  className?: string
}

export function TeamSetup({ teams, onAddTeam, onRemoveTeam, className }: TeamSetupProps) {
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

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
            className="flex-1 border-mahogany/20 focus-visible:ring-gold bg-white/50 backdrop-blur-sm"
          />
          <Button 
            onClick={handleAddTeam} 
            disabled={!teamName.trim()}
            className="bg-olive hover:bg-[#5C6B3D] text-cream"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Team</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {TEAM_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(selectedColor === color.value ? undefined : color.value)}
              className={cn(
                'w-9 h-9 rounded-full transition-all duration-200 shadow-sm relative',
                selectedColor === color.value 
                  ? 'scale-110 ring-2 ring-offset-2 ring-gold' 
                  : 'hover:scale-110 ring-1 ring-mahogany/10'
              )}
              style={{ backgroundColor: color.value }}
              aria-label={`Select ${color.name} color`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-mahogany">
          Teams ({teams.length})
        </h3>
        <AnimatePresence mode="popLayout">
          {teams.map((team, index) => (
            <motion.div
              key={`${team.name}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 bg-white/70 backdrop-blur-sm border-mahogany/10 hover:border-gold/40 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {team.color ? (
                      <div
                        className="w-8 h-8 rounded-full shadow-inner border border-black/5"
                        style={{ backgroundColor: team.color }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-black/5 border border-dashed border-black/20" />
                    )}
                    <span className="font-semibold text-mahogany text-lg">{team.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveTeam(index)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-60 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {teams.length === 0 && (
          <p className="text-sm text-warmBrown/70 text-center py-8 italic">
            Add at least 2 teams to start the game
          </p>
        )}
      </div>

    </div>
  )
}
