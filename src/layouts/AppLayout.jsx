import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f5f7f2]">
      <div className="flex min-h-screen">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="min-w-0 flex-1">
          <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1440px] p-5 sm:p-8 lg:p-12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
