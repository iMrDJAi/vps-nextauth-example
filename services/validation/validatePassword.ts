import passwordValidator from 'password-validator'


const schema = new passwordValidator()

schema
  .is().min(8)                                    // Minimum length 8
  .is().max(20)                                   // Maximum length 20
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits()                                 // Must have digits

const validatePassword = (password: string) => {
  return schema.validate(password) as boolean
}

export default validatePassword
