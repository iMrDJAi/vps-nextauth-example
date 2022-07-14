import nodemailer from 'nodemailer'
import { encode, decode, type JWT } from 'next-auth/jwt'


const validateToken = async (token: string, sessionToken: JWT) => {
  try {
    const emailToken = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET! + sessionToken.email!
    })
    if (!emailToken || sessionToken.sub !== emailToken.sub) return false
  } catch {
    return false
  }
  return true
}

const verificationRequest = async (id: string, email: string) => {
  const server = {
    host: process.env.EMAIL_SERVER_HOST,
    port: + process.env.EMAIL_SERVER_PORT!,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD
    }
  }
  const transport = nodemailer.createTransport(server)
  const { host } = new URL(process.env.NEXTAUTH_URL!)
  const token = await encode({
    token: { sub: id },
    secret: process.env.NEXTAUTH_SECRET + email,
    maxAge: 60 * 60 * 24 * 30 * 12 * 99 // 99 years
  })
  const url = process.env.NEXTAUTH_URL + '/callback/verify-email?token=' + token
  console.log(url)
  await transport.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: `Confirm your email - ${host}`,
    text: text({ url, host }),
    html: html({ url, host })
  })
}

function html({ url, host }: Record<'url' | 'host', string>) {
  const escapedHost = `${host.replace(/\./g, '&#8203;.')}`

  const backgroundColor = '#f9f9f9'
  const textColor = '#444444'
  const mainBackgroundColor = '#ffffff'
  const buttonBackgroundColor = '#346df1'
  const buttonBorderColor = '#346df1'
  const buttonTextColor = '#ffffff'

  return `
<body style="background: ${backgroundColor};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        <strong>${escapedHost}</strong>
      </td>
    </tr>
  </table>
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        Confirm your email address
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Confirm now!</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`
}

function text({ url, host }: Record<'url' | 'host', string>) {
  return `Confirm your email - ${host}\n${url}\n\n`
}

export { verificationRequest, validateToken }
