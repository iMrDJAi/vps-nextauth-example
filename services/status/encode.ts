import { STATUS } from '../../constants'
import  type { Status } from '../../database/schemas/User'


const encode = (all: Status) => {
  const keys = Object.keys(STATUS) as (keyof typeof STATUS)[]
  let status = 0
  for (const key of keys) {
    const flag = STATUS[key]
    status = all[key] ? status | flag : status & ~flag
  }
  return status
}

export default encode
