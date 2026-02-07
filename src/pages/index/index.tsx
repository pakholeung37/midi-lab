import { Card } from './card'
import { gamepadControllerRoute, pianoWaterfallRoute } from '../../router'

const items = () =>
  [gamepadControllerRoute, pianoWaterfallRoute].map((route) => {
    return {
      id: route.id,
      // @ts-expect-error title should be in
      title: route.options.staticData?.title,
      to: route.to,
    }
  })
export function Index() {
  return (
    <main className="mx-auto flex flex-wrap overflow-hidden">
      {items().map((experiment) => (
        <Card key={experiment.id} {...experiment} />
      ))}
    </main>
  )
}
