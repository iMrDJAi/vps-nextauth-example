import { PageContext } from '../../../renderer/types'


async function onBeforeRender(pageContext: PageContext) {
  const user = pageContext.session.user
  return {
    pageContext: {
      redirectTo: !user || user.status.EMAIL_VERIFIED ? '/' : undefined
    }
  }
}

export { onBeforeRender }
