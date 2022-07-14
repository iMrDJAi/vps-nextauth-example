import { PageContext } from '../../renderer/types'

async function onBeforeRender(pageContext: PageContext) {
  const user = pageContext.session.user
  return {
    pageContext: {
      redirectTo: user ? '/' : undefined
    }
  }
}

export { onBeforeRender }
