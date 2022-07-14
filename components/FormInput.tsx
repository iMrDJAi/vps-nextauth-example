import { ReactNode } from 'react'
import { useState, useRef } from 'react'
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Collapse from '@mui/material/Collapse'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Upload from '@mui/icons-material/Upload'
import CircularProgress from '@mui/material/CircularProgress'
import Delete from '@mui/icons-material/Delete'


type FormInputProps = TextFieldProps & {
  hint?: ReactNode
  options?: string[]
  loading?: boolean
  onClear?: (elm: HTMLInputElement) => void
  onCancel?: (elm: HTMLInputElement) => void
}

const FormInput = ({
  options, autoComplete, type, disabled, required, hint,
  loading, defaultValue, onCancel, onClear, ...props
}: FormInputProps) => {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>()

  const handleClose = () => {
    setOpen(false)
  }

  const endAdornment = type === 'password' ? (
    <InputAdornment position='end'>
      <IconButton
        aria-label='toggle password visibility'
        onClick={() => setShowPassword(!showPassword)}
        onMouseDown={event => event.preventDefault()}
        edge='end'
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : type === 'file' ? (
    loading ? (
      <InputAdornment position='end'>
        <IconButton
          onClick={() => onCancel && onCancel(inputRef.current!)}
          edge='end'
        >
          <CircularProgress color='inherit' size={20} />
          <CloseIcon sx={{ position: 'absolute', fontSize: 18 }} />
        </IconButton>
      </InputAdornment>
    ) : defaultValue ? (
      <InputAdornment position='end'>
        <IconButton
          onClick={() => onClear && onClear(inputRef.current!)}
          edge='end'
        >
          <Delete />
        </IconButton>
      </InputAdornment>
    ) : (
      <InputAdornment position='end'>
        <IconButton
          onClick={() => inputRef.current && inputRef.current.click()}
          edge='end'
        >
          <Upload />
        </IconButton>
      </InputAdornment>
    )
  ) : undefined

  return (
    <>
      {
        hint && <Collapse in={open}>
          <Alert
            severity='info'
            variant='outlined'
            sx={{ marginBottom: 2 }}
            action={
              <IconButton
                size='small'
                aria-label='close'
                color='inherit'
                onClick={handleClose}
              >
                <CloseIcon fontSize='small' />
              </IconButton>
            }
          >
            {hint}
          </Alert>
        </Collapse>
      }
      <TextField
        {...props}
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        disabled={type !== 'file' ? disabled : (loading || !!defaultValue ? loading || !!defaultValue : disabled)}
        required={type !== 'file' ? required : (!defaultValue ? required :  !defaultValue)}
        defaultValue={options ? '' : defaultValue}
        select={!!options}
        onFocus={event => {
          if (!open) {
            setOpen(true)
            event.target.blur()
            setTimeout(() => event.target.focus(), 200)
          }
        }}
        sx={{
          '& ::-ms-reveal': {
            display: 'none'
          },
          'input': {
            opacity: type === 'file' && !!defaultValue ? '0 !important' : undefined
          }
        }}
        InputLabelProps={{ shrink: type === 'file' ? !defaultValue : undefined }}
        inputRef={inputRef}
        InputProps={{
          endAdornment
        }}
        children={options ? options.map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        )) : undefined}
      />
    </>
  )
}

export default FormInput
export type { FormInputProps }
