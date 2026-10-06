import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-20 items-center justify-between border-b border-[#dfe6d9] bg-[#f5f7f2]/95 px-5 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe6d9] bg-white text-[#18221d] lg:hidden"
          aria-label="Open navigation menu"
          onClick={onMenuToggle}
        >
          <span className="flex w-4 flex-col gap-1" aria-hidden="true">
            <span className="h-0.5 w-full bg-current" />
            <span className="h-0.5 w-3/4 bg-current" />
            <span className="h-0.5 w-full bg-current" />
          </span>
        </button>
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-[#18221d]">
          FitTrack<span className="text-[#719b35]"> AI</span>
        </Link>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <span className="hidden text-sm text-[#718078] sm:block">Your progress, in focus.</span>
        <button type="button" onClick={logout} className="text-sm font-semibold text-[#527b20] hover:underline">Log out</button>
        <Link
          to="/profile"
          className="grid h-10 w-10 place-items-center rounded-full bg-[#18221d] text-sm font-bold text-[#e7f4c7]"
          aria-label="Open profile"
        >
          {user?.email?.slice(0, 2).toUpperCase() || 'FT'}
        </Link>
      </div>
    </header>
  )
}
