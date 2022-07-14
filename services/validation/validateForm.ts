import { validate as validateEmail } from 'email-validator'
import validatePassword from './validatePassword'
import validateUsername from './validateUsername'
import validateName from './validateName'


interface FormErrors {
  email?: 'BLANK_EMAIL'|'INVALID_EMAIL'|'EMAIL_IN_USE'|'EMAIL_DOESNT_EXIST'
  username?: 'BLANK_USERNAME'|'INVALID_USERNAME'|'USERNAME_TAKEN'|'INCORRECT_USERNAME'
  password?: 'BLANK_PASSWORD'|'INVALID_PASSWORD'|'INCORRECT_PASSWORD'
  password2?: 'BLANK_PASSWORD2'|'PASSWORD_DOESNT_MATCH'
  fullname?: 'BLANK_FULLNAME'|'INVALID_FULLNAME'
  companyname?: 'BLANK_COMPANYNAME'|'INVALID_COMPANYNAME'
  form?: 'SOMETHING_WENT_WRONG'|'REQUEST_FAILED'|'CSRF_ERROR'
}

interface RegistrationForm {
  email: string
  username: string
  password: string
  password2: string
  fullname: string
  companyname: string
}

const validateRegistrationForm = (form: RegistrationForm) => {
  const errors: FormErrors = {}

  if (!form.email) errors.email = 'BLANK_EMAIL'
  else if (!validateEmail(form.email)) errors.email = 'INVALID_EMAIL'

  if (!form.username) errors.username = 'BLANK_USERNAME'
  else if (!validateUsername(form.username)) errors.username = 'INVALID_USERNAME'

  if (!form.password) errors.password = 'BLANK_PASSWORD'
  else if (!validatePassword(form.password)) errors.password = 'INVALID_PASSWORD'

  if (!form.password2) errors.password2 = 'BLANK_PASSWORD2'
  else if (form.password2 !== form.password) errors.password2 = 'PASSWORD_DOESNT_MATCH'

  if (!form.fullname) errors.fullname = 'BLANK_FULLNAME'
  else if (!validateName(form.fullname)) errors.fullname = 'INVALID_FULLNAME'

  if (!form.companyname) errors.companyname = 'BLANK_COMPANYNAME'
  else if (!validateName(form.companyname)) errors.companyname = 'INVALID_COMPANYNAME'

  return errors
}


interface LoginForm {
  username: string
  password: string
}

const validateLoginForm = (form: LoginForm) => {
  const errors: FormErrors = {}

  if (!form.username) errors.username = 'BLANK_USERNAME'
  else if (!validateUsername(form.username)) errors.username = 'INCORRECT_USERNAME'

  if (!form.password) errors.password = 'BLANK_PASSWORD'

  return errors
}

export { validateRegistrationForm, validateLoginForm }
export type { FormErrors, RegistrationForm, LoginForm }
