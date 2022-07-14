import { ReactNode } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'


interface LayoutProps {
  title: ReactNode
  summary: ReactNode
  children?: ReactNode
}

const Layout = ({ title, summary, children }: LayoutProps) => (
  <>
    <AppBar position='static' color='transparent' elevation={0} variant='outlined'>
      <Toolbar>
        <Typography variant='h6' component='div'>{title}</Typography>
      </Toolbar>
    </AppBar>
    <Container>
      <Typography variant='h6' marginTop={2}>{summary}</Typography>
      {children}
    </Container>
  </>
)

export default Layout
export { type LayoutProps }
