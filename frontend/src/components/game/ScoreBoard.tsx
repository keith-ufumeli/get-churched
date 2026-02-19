import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Team } from '@/types/game'
import { Trophy } from 'lucide-react'
import { THEME_COLORS } from '@/lib/themeColors'

interface ScoreBoardProps {
  teams: Team[]
  currentTeamIndex: number
  className?: string
}

export function ScoreBoard({ teams, currentTeamIndex, className }: ScoreBoardProps) {
  const sortedTeams = [...teams].sort((a, b) => (b.score || 0) - (a.score || 0))

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-lg font-semibold text-mahogany mb-4">Scores</h3>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedTeams.map((team, index) => {
            const originalIndex = teams.findIndex((t) => t.name === team.name)
            const isCurrent = originalIndex === currentTeamIndex
            const isLeader = index === 0 && (team.score || 0) > 0

            return (
              <motion.div
                key={team.name}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={cn(
                    'p-4 transition-all min-h-[44px] flex items-center',
                    isCurrent && 'ring-2 ring-gold shadow-lg',
                    isLeader && 'bg-gradient-to-r from-gold/10 to-transparent'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isLeader && <Trophy className="h-5 w-5 text-gold" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-mahogany">{team.name}</span>
                          {isCurrent && (
                            <Badge variant="outline" className="border-gold text-gold text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        {team.color && (
                          <div
                            className="h-1 w-12 mt-1 rounded"
                            style={{ backgroundColor: team.color }}
                          />
                        )}
                      </div>
                    </div>
                    <motion.div
                      key={team.score || 0}
                      initial={{ scale: 1.2, color: THEME_COLORS.gold }}
                      animate={{ scale: 1, color: THEME_COLORS.mahogany }}
                      className="text-2xl font-bold text-mahogany tabular-nums"
                    >
                      {team.score || 0}
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
