import Layout from '../../../components/Layout'
import { useSession } from 'next-auth/react'
import { type PageContext } from '../../../renderer/types'


const Page: PageContext['Page'] = () => {
  const session = useSession()
  if (typeof self !== 'undefined') console.log('session', session)

  return (
    <Layout title='Email Verification' summary='Please check your inbox to confirm your email' />
  )
}

const documentProps = {
  title: 'Email Verification',
  description: undefined
}

export default { Page }
export { documentProps }
