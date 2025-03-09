import { Link } from '@tanstack/react-router'

interface CardProps {
  id: string
  title: string
  to?: string
}
const gradients = [
  'bg-gradient-to-r from-pink-500 to-purple-500',
  'bg-gradient-to-r from-cyan-500 to-blue-500',
  'bg-gradient-to-r from-green-400 to-emerald-500',
  'bg-gradient-to-r from-amber-500 to-orange-500',
  'bg-gradient-to-r from-indigo-500 to-violet-500',
  'bg-gradient-to-r from-rose-500 to-red-500',
  'bg-gradient-to-r from-fuchsia-500 to-pink-500',
  'bg-gradient-to-r from-yellow-400 to-amber-500',
  'bg-gradient-to-r from-lime-400 to-green-500',
  'bg-gradient-to-r from-teal-400 to-cyan-500',
  'bg-gradient-to-r from-blue-500 to-indigo-500',
  'bg-gradient-to-r from-violet-500 to-purple-500',
]
function getGradientFromId(id: string): string {
  // Use the sum of character codes in the id to determine the gradient
  const sum = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = sum % gradients.length
  return gradients[index]
}
export function Card({ title, id, to }: CardProps) {
  return (
    <Link
      to={to}
      className={`${getGradientFromId(
        id,
      )} overflow-hidden duration-300 cursor-pointer w-[33.333%] h-[33vw] shrink-0 hover:brightness-110 hover:scale-[1.02]`}
    >
      <div className="aspect-square relative">
        <div className="h-full flex items-center text-4xl font-bold text-white p-4">
          {title}
        </div>
      </div>
    </Link>
  )
}
