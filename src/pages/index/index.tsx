import { Card } from './card'
import { gamepadControllerRoute } from '../../router'

const items = () =>
  [gamepadControllerRoute].map((route) => {
    return {
      id: route.id,
      // @ts-expect-error title should be in
      title: route.options.staticData?.title,
      to: route.to,
    }
  })
export function Index() {
  console.log(gamepadControllerRoute)
  return (
    <main className="mx-auto flex flex-wrap overflow-hidden">
      {items().map((experiment) => (
        <Card key={experiment.id} {...experiment} />
      ))}
    </main>
  )
}
