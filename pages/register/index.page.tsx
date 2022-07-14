import { useState } from 'react'
import Layout from '../../components/Layout'
import FormGroup from '../../components/FormGroup'
import Alert from '../../components/Alert'
import Grid from '@mui/material/Grid'
import LoadingButton from '@mui/lab/LoadingButton'
import { useSession } from 'next-auth/react'
import { validateRegistrationForm, type FormErrors } from '../../services/validation/validateForm'
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

    const formErrors = validateRegistrationForm({
      email: formdata.get('email') as string,
      username: formdata.get('username') as string,
      password: formdata.get('password') as string,
      password2: formdata.get('password2') as string,
      fullname: formdata.get('fullname') as string,
      companyname: formdata.get('companyname') as string
    })
    setErrors(formErrors)
    if (Object.keys(formErrors).length) return

    setLoading(true)
    let res: Response, json: { url: string }
    try {
      res = await fetch('/auth/callback/register', {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formdata as any).toString()
      })
      json = await res.json()
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
      window.location.href = data.url
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
    <Layout title='Register' summary='Create a new account'>
      <form
        noValidate
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <Grid
          container
          spacing={2}
          marginBottom={6}
          sx={{ '& > *': {
            marginTop: theme => `${theme.spacing(2)} !important`
          }}}
        >
          <FormGroup
            title='Account details'
            errors={errors}
            disabled={loading}
            onChange={handleChange}
            inputs={[
              {
                label: 'Email Address',
                name: 'email',
                autoComplete: 'email'
              },
              {
                label: 'Username',
                name: 'username',
                autoComplete: 'username',
                hint: <>
                  <span>Username:</span>
                  <ul style={{padding: 0}}>
                    <li>Must be 4 to 20 characters long.</li>
                    <li>May only contain Upper and lower case letters, digits and underscore (_).</li>
                    <li>May only begin with a letter.</li>
                    <li>May not have more than one underscore in a row.</li>
                  </ul>
                </>
              },
              {
                label: 'New Password',
                name: 'password',
                autoComplete: 'new-password',
                type: 'password',
                error: !!errors.password || !!errors.password2,
                hint: <>
                  <span>Password must have:</span>
                  <ul style={{padding: 0}}>
                    <li>8 to 20 characters.</li>
                    <li>At least one Upper and one lower case letter, and one digit.</li>
                  </ul>
                </>
              },
              {
                label: 'Confirm Password',
                name: 'password2',
                autoComplete: 'new-password',
                type: 'password',
                error: !!errors.password || !!errors.password2,
                helperText: errors.password ? ' ' : errors.password2
              }
            ]}
          />
          <FormGroup
            title='User details'
            errors={errors}
            disabled={loading}
            onChange={handleChange}
            inputs={[
              {
                label: 'Full Name',
                name: 'fullname',
                autoComplete: 'name'
              },
              {
                label: 'Company Name',
                name: 'companyname',
                autoComplete: 'organization'
              }
            ]}
          />
        </Grid>
        <LoadingButton
          type='submit'
          size='large'
          variant='contained'
          disabled={loading || !!Object.keys(errors).length}
          loading={loading}
        >
          Register
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
  title: 'Register',
  description: undefined
}

export default { Page }
export { documentProps }
