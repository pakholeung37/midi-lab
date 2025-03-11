import { Link, Outlet, useMatches } from '@tanstack/react-router'
import { useEffect } from 'react'
import { MIDIOutputSelect } from './midi-output-select'

export function MainLayout() {
  const matches = useMatches()

  // @ts-expect-error expect
  const secTitle = matches[matches.length - 1].staticData?.title
  const title = secTitle ? `MIDI Lab ｜ ${secTitle}` : 'MIDI Lab'

  console.log('match', matches)
  // Update document title
  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link className="text-2xl font-semibold font-mono" to="/">
              MIDI Lab
            </Link>
            {secTitle ? (
              <>
                <span className="text-cyan-500">/</span>
                <span className="font-light relative text-gray-600">
                  {secTitle}
                </span>
              </>
            ) : null}
          </div>
          <nav className="space-x-6">
            <a
              href="https://github.com/pakholeung37/midi-lab"
              className="text-gray-600 hover:text-gray-900"
            >
              github
            </a>
            <MIDIOutputSelect />
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
