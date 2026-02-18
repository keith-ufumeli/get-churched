import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HomePage } from '@/pages/HomePage'
import { SetupPage } from '@/pages/SetupPage'
import { RoundPage } from '@/pages/RoundPage'
import { ResultPage } from '@/pages/ResultPage'
import { ScoreboardPage } from '@/pages/ScoreboardPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/round" element={<RoundPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/scoreboard" element={<ScoreboardPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return <AnimatedRoutes />
}

export default App
