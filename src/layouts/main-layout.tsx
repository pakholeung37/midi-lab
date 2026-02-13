import { Link, Outlet, useLocation, useMatches } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { PROJECT_NAV_ITEMS } from '../projects'
import { MIDIOutputSelect } from './midi-output-select'

export function MainLayout() {
  const matches = useMatches()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // @ts-expect-error expect
  const secTitle = matches[matches.length - 1]?.staticData?.title
  const title = secTitle ? `MIDI Lab | ${secTitle}` : 'MIDI Lab'

  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="relative min-h-screen">
      <button
        type="button"
        aria-label="Open project sidebar"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-md border border-slate-600/70 bg-slate-900/70 text-slate-100 shadow-md backdrop-blur transition hover:bg-slate-800/90"
      >
        <span className="relative block h-4 w-4">
          <span className="absolute left-0 top-0.5 block h-0.5 w-4 bg-current" />
          <span className="absolute left-0 top-1.5 block h-0.5 w-4 bg-current" />
          <span className="absolute left-0 top-2.5 block h-0.5 w-4 bg-current" />
        </span>
      </button>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px]"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 border-r border-slate-700/70 bg-slate-900/95 p-5 text-slate-100 shadow-2xl backdrop-blur transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-wide">MIDI Lab</h1>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="h-8 w-8 rounded-lg border border-slate-600 text-slate-300 transition hover:bg-slate-800"
          >
            X
          </button>
        </div>

        <nav className="space-y-2">
          {PROJECT_NAV_ITEMS.map((project) => {
            const isPianoWaterfallRoot =
              project.path === '/piano-waterfall' && location.pathname === '/'
            const isActive =
              location.pathname === project.path || isPianoWaterfallRoot

            return (
              <Link
                key={project.id}
                to={project.path}
                className={`block rounded-lg border px-3 py-2 text-sm transition ${
                  isActive
                    ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70'
                }`}
              >
                {project.title}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 border-t border-slate-700/80 pt-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
            MIDI Output
          </p>
          <MIDIOutputSelect />
        </div>
      </aside>

      <Outlet />
    </div>
  )
}
