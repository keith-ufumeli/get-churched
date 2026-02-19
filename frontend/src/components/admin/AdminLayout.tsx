import { Outlet, NavLink, useLocation } from 'react-router-dom'
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
} from '@/components/ui/sidebar'
import { LayoutDashboard, BookOpen, Cpu, Settings, Users } from 'lucide-react'
import { ADMIN_PATH } from '@/lib/adminConstants'

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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="px-2 py-2 font-semibold text-sidebar-foreground">
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
                    <SidebarMenuButton asChild isActive={active}>
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
          <div className="p-2 text-xs text-muted-foreground">
            Admin portal
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-1 flex-col p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
