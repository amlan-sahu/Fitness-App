import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Overview', path: '/dashboard', icon: '01' },
  { label: 'Workouts', path: '/workouts', icon: '02' },
  { label: 'Nutrition', path: '/nutrition', icon: '03' },
  { label: 'Progress', path: '/progress', icon: '04' },
  { label: 'Goals', path: '/goals', icon: '05' },
  { label: 'Supplements', path: '/supplements', icon: '06' },
  { label: 'Exercise library', path: '/exercises', icon: '07' },
  { label: 'AI assistant', path: '/assistant', icon: '08' },
]

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-[#18221d]/35 lg:hidden"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-[#18221d] px-5 py-6 text-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-12 flex items-center justify-between lg:hidden">
          <span className="font-display text-lg font-bold">Menu</span>
          <button type="button" className="text-2xl text-[#d8e5ca]" onClick={onClose} aria-label="Close navigation menu">
            &times;
          </button>
        </div>
        <div className="mb-10 hidden lg:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#91aa76]">Workspace</p>
          <p className="font-display text-2xl font-bold tracking-tight">Move with intent.</p>
        </div>
        <nav className="flex-1 space-y-2" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-[#d8ef9d] text-[#18221d]' : 'text-[#b7c4b5] hover:bg-white/10 hover:text-white'}`}
            >
              <span className="w-5 font-mono text-[10px] opacity-60">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) => `border-t border-white/10 pt-5 text-sm font-semibold ${isActive ? 'text-[#d8ef9d]' : 'text-[#b7c4b5] hover:text-white'}`}
        >
          Profile settings
        </NavLink>
      </aside>
    </>
  )
}
