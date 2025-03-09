import { experiments } from './data/experiments'

export function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">CHROME MUSIC LAB</h1>
          <nav className="space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 underline">Experiments</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map((experiment) => (
            <ExperimentCard key={experiment.id} {...experiment} />
          ))}
        </div>
      </main>
    </div>
  )
}

interface ExperimentCardProps {
  id: string
  title: string
}

function ExperimentCard({ title }: ExperimentCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      <div className="aspect-square relative">
        <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
          {title}
        </div>
      </div>
    </div>
  )
}
