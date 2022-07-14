import { useState } from 'react'
import Layout from '../../components/Layout'
import FormGroup from '../../components/FormGroup'
import Alert from '../../components/Alert'
import LoadingButton from '@mui/lab/LoadingButton'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { useSession } from 'next-auth/react'
import { validateLoginForm, type FormErrors } from '../../services/validation/validateForm'
import { type FormInputProps } from '../../components/FormInput'
import { type PageContext } from '../../renderer/types'


const Page: PageContext['Page'] = ({ csrfToken }) => {
  const session = useSession()
  if (typeof self !== 'undefined') console.log('session', session)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formdata = new FormData(event.currentTarget)
    formdata.set('redirect', 'false')
    formdata.set('json', 'true')
    formdata.set('csrfToken', csrfToken)

    const formErrors = validateLoginForm({
      username: formdata.get('username') as string,
      password: formdata.get('password') as string
    })
    setErrors(formErrors)
    if (Object.keys(formErrors).length) return

    setLoading(true)
    let res: Response, json: { url: string }
    try {
      res = await fetch('/auth/callback/login', {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formdata as any).toString()
      })
      json = await res.json()
      console.log(json)
    } catch {
      errors.form = 'REQUEST_FAILED'
      setErrors({...errors})
      return setLoading(false)
    }

    try {
      const data = {
        error: new URL(json.url).searchParams.get('error'),
        csrf: new URL(json.url).searchParams.get('csrf'),
        status: res.status,
        ok: res.ok,
        url: json.url
      }
      if (data.error) {
        setErrors(JSON.parse(data.error))
        return setLoading(false)
      }
      if (data.csrf) {
        errors.form = 'CSRF_ERROR'
        setErrors({...errors})
        return setLoading(false)
      }
      window.location.href = '/'
    } catch {
      errors.form = 'SOMETHING_WENT_WRONG'
      setErrors({...errors})
      setLoading(false)
    }
  }

  const handleChange: FormInputProps['onChange'] = event => {
    const name = event.target.name as keyof FormErrors
    if ((name === 'password') && (errors.password || errors.password2)) {
      delete errors.password
      delete errors.password2
      setErrors({...errors})
    } else if (errors[name]) {
      delete errors[name]
      setErrors({...errors})
    }
  }

  const handleClose = () => {
    delete errors.form
    setErrors({...errors})
  }

  return (
    <Layout title='Login' summary='Login to your account'>
      <form
        noValidate
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <Grid
          container
          spacing={2}
          marginBottom={4}
          sx={{ '& > *': {
            marginTop: theme => `${theme.spacing(2)} !important`
          }}}
        >
          <FormGroup
            title='Credentials'
            errors={errors}
            disabled={loading}
            onChange={handleChange}
            inputs={[
              {
                label: 'Username',
                name: 'username',
                autoComplete: 'username'
              },
              {
                label: 'Password',
                name: 'password',
                autoComplete: 'current-password',
                type: 'password',
                error: !!errors.password || !!errors.username
              }
            ]}
          />
        </Grid>
        <Box marginY={1}>
          <Link href='/register' variant='body1'>New user?</Link>
        </Box>
        <LoadingButton
          type='submit'
          size='large'
          variant='contained'
          disabled={loading || !!Object.keys(errors).length}
          loading={loading}
        >
          Login
        </LoadingButton>
      </form>
      <Alert
        open={!!errors.form}
        onClose={handleClose}
        severity='error'
      >
        {errors.form}
      </Alert>
    </Layout>
  )
}

const documentProps = {
  title: 'Login',
  description: undefined
}

export default { Page }
export { documentProps }
