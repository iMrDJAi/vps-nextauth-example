const validateUsername = (username: string) => {
  return /^[a-zA-Z][a-zA-Z\d_]{3,19}$/.test(username) && !/__/.test(username)
}

export default validateUsername
