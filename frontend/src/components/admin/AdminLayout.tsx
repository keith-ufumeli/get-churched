import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar'
import { LayoutDashboard, BookOpen, Cpu, Settings, Users, LogOut } from 'lucide-react'
import { ADMIN_PATH } from '@/lib/adminConstants'
import { adminSignOut, clearAdminToken } from '@/lib/adminApi'
import { useQueryClient } from '@tanstack/react-query'

const adminBase = ADMIN_PATH.startsWith('/') ? ADMIN_PATH : `/${ADMIN_PATH}`

const navItems = [
  { to: `${adminBase}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
  { to: `${adminBase}/words`, label: 'Words', icon: BookOpen },
  { to: `${adminBase}/usage`, label: 'AI Usage', icon: Cpu },
  { to: `${adminBase}/config`, label: 'Config', icon: Settings },
  { to: `${adminBase}/sessions`, label: 'Sessions', icon: Users },
]

function isNavActive(pathname: string, to: string) {
  if (to === `${adminBase}/dashboard`) {
    return pathname === to || pathname === adminBase || pathname === `${adminBase}/`
  }
  return pathname === to || pathname.startsWith(to + '/')
}

export function AdminLayout() {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    try {
      const res = await adminSignOut()
      clearAdminToken()
      queryClient.removeQueries({ queryKey: ['admin'] })
      if (res.redirect) {
        window.location.href = res.redirect
      } else {
        navigate(adminBase)
      }
    } catch {
      clearAdminToken()
      queryClient.removeQueries({ queryKey: ['admin'] })
      navigate(adminBase)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarRail />
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="px-2 py-2 font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Get Churched Admin
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isNavActive(pathname, item.to)
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <NavLink to={item.to}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="p-2 space-y-2">
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
            <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              Admin portal
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-muted-foreground">Admin</span>
        </header>
        <div className="flex flex-1 flex-col p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
