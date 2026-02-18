import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { SetupPage } from '@/pages/SetupPage'
import { RoundPage } from '@/pages/RoundPage'
import { ResultPage } from '@/pages/ResultPage'
import { ScoreboardPage } from '@/pages/ScoreboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/round" element={<RoundPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/scoreboard" element={<ScoreboardPage />} />
    </Routes>
  )
}

export default App
