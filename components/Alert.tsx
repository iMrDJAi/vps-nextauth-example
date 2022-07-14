import type { ReactNode } from 'react'
import Snackbar from '@mui/material/Snackbar'
import MUIAlert, { AlertProps as MUIAlertProps } from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'


interface AlertProps {
  open: boolean
  onClose: () => void
  severity: MUIAlertProps['severity']
  children: ReactNode
}

const Alert = ({ open, onClose, severity, children }: AlertProps) => (
  <Snackbar
    open={open}
    onClose={onClose}
    autoHideDuration={6 * 1000}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    sx={{ minWidth: 288 }}
  >
    <MUIAlert
      severity={severity}
      variant='filled'
      elevation={6}
      sx={{ width: '100%' }}
      action={
        <IconButton
          size='small'
          aria-label='close'
          color='inherit'
          onClick={onClose}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      }
    >
      {children}
    </MUIAlert>
  </Snackbar>
)

export default Alert
export { type AlertProps }
