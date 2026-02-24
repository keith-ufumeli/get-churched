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
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-5 h-5 text-gold" />
        <h3 className="text-xl font-bold text-mahogany uppercase tracking-wider">Scoreboard</h3>
      </div>
      <div className="space-y-3">
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
                className={cn(isCurrent && 'z-10 relative')}
              >
                <Card
                  className={cn(
                    'p-5 transition-all duration-300 flex items-center border border-mahogany/10 relative overflow-hidden',
                    isCurrent ? 'ring-2 ring-gold shadow-xl scale-105 bg-white bg-opacity-95 backdrop-blur-md' : 'bg-white/70 hover:bg-white/90 backdrop-blur-sm hover:border-gold/40',
                    isLeader && !isCurrent && 'bg-gradient-to-br from-gold/5 via-white/80 to-transparent'
                  )}
                >
                  <div className="relative z-10 flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {isLeader ? (
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-gold blur-sm opacity-40 rounded-full" />
                          <Trophy className="h-6 w-6 text-gold relative z-10 drop-shadow-sm" />
                        </div>
                      ) : (
                        <div className="w-6 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 relative">
                          <span className={cn("font-bold text-mahogany tracking-tight truncate", isCurrent ? 'text-xl' : 'text-lg')}>
                            {team.name}
                          </span>
                          {isCurrent && (
                            <Badge variant="outline" className="shrink-0 border-gold bg-gold/10 text-gold text-[10px] uppercase font-bold tracking-wider px-2 py-0 border drop-shadow-sm">
                              Current
                            </Badge>
                          )}
                        </div>
                        {team.color ? (
                          <div
                            className="h-1.5 w-12 mt-1.5 rounded-full shadow-inner border border-black/5"
                            style={{ backgroundColor: team.color }}
                          />
                        ) : (
                          <div className="h-1.5 w-12 mt-1.5 rounded-full bg-black/5 border border-dashed border-black/20" />
                        )}
                      </div>
                    </div>
                    
                    {/* Score display */}
                    <div className="shrink-0 text-right">
                      <motion.div
                        key={team.score || 0}
                        initial={{ scale: 1.5, color: THEME_COLORS.gold }}
                        animate={{ scale: 1, color: THEME_COLORS.mahogany }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className={cn(
                          "font-black tabular-nums transition-all drop-shadow-sm", 
                          isCurrent ? 'text-4xl text-mahogany' : 'text-3xl text-mahogany/90'
                        )}
                      >
                        {team.score || 0}
                      </motion.div>
                    </div>
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
