import './index.scss'
import ReactDOM from 'react-dom'
import App from './App'
import type { PageContext } from './types'


const render = async (pageContext: PageContext) => {
  ReactDOM.hydrate(
    <App pageContext={pageContext} />,
    document.getElementById('page-view')
  )
}

/**
 * To enable Client-side Routing:
 * export const clientRouting = true
 * // !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting
 */

export { render }
