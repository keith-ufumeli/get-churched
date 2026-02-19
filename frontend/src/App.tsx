import { useState, useCallback } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SplashScreen } from '@/components/SplashScreen'
import { HomePage } from '@/pages/HomePage'
import { SetupPage } from '@/pages/SetupPage'
import { RoundPage } from '@/pages/RoundPage'
import { ResultPage } from '@/pages/ResultPage'
import { ScoreboardPage } from '@/pages/ScoreboardPage'
import { AdminPortalPage, ADMIN_PATH } from '@/pages/AdminPortalPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminWordsPage } from '@/pages/admin/AdminWordsPage'
import { AdminUsagePage } from '@/pages/admin/AdminUsagePage'
import { AdminConfigPage } from '@/pages/admin/AdminConfigPage'
import { AdminSessionsPage } from '@/pages/admin/AdminSessionsPage'

const adminRoutePath = ADMIN_PATH.startsWith('/') ? ADMIN_PATH.slice(1) : ADMIN_PATH

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
        <Route path={adminRoutePath} element={<AdminPortalPage />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="words" element={<AdminWordsPage />} />
          <Route path="usage" element={<AdminUsagePage />} />
          <Route path="config" element={<AdminConfigPage />} />
          <Route path="sessions" element={<AdminSessionsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <AnimatedRoutes />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
