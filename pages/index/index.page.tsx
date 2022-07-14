import Layout from '../../components/Layout'
import { useSession } from 'next-auth/react'
import type { PageContext } from '../../renderer/types'


const Page: PageContext['Page'] = () => {
  const session = useSession()
  if (typeof self !== 'undefined') console.log('session', session)

  return (
    <Layout title='Home Page' summary={`Hello ${session.data!.user.name!}! <3`} />
  )
}

const documentProps = {
  // This title and description will override the defaults
  title: 'Home',
  description: undefined
}

export default { Page }
export { documentProps }
