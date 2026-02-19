import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAdminSession, getSignInUrl, setAdminToken } from '@/lib/adminApi'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ADMIN_PATH } from '@/lib/adminConstants'

export function AdminPortalPage() {
  const [tokenInput, setTokenInput] = useState('')
  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'session'],
    queryFn: getAdminSession,
    retry: false,
  })
  const authenticated = Boolean(session?.user)

  const handleTokenSignIn = async () => {
    const token = tokenInput.trim()
    if (!token) {
      toast.error('Enter an admin token')
      return
    }
    setAdminToken(token)
    setTokenInput('')
    const result = await refetch()
    if (result.data?.user) {
      toast.success('Signed in with token')
    } else {
      setAdminToken('')
      toast.error('Invalid admin token')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 font-sans flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <p className="text-muted-foreground">Checking session…</p>
        </Card>
      </div>
    )
  }

  if (!authenticated) {
    const base = ADMIN_PATH.replace(/^\/+|\/+$/g, '')
    const callbackUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/${base}`
      : ''
    const signInUrl = getSignInUrl(callbackUrl)
    return (
      <div className="min-h-screen bg-background p-6 font-sans flex items-center justify-center">
        <Card className="p-8 max-w-md w-full space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <Lock className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin access</h1>
          </div>
          <p className="text-sm text-muted-foreground">Sign in with GitHub or use an admin token.</p>
          <Button asChild className="w-full">
            <a href={signInUrl}>Sign in with GitHub</a>
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
              <span className="bg-card px-2">or</span>
            </div>
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Admin token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTokenSignIn()}
            />
            <Button variant="outline" onClick={handleTokenSignIn} className="w-full">
              Sign in with token
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <AdminLayout />
}
