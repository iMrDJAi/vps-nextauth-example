import { STATUS } from '../../constants'
import  type { Status } from '../../database/schemas/User'


const decode = (status: number) => {
  const all: Record<string, boolean> = {}
  const keys = Object.keys(STATUS) as (keyof typeof STATUS)[]
  for (const key of keys) {
    all[key] = !!(status & STATUS[key])
  }
  return all as Status
}

export default decode
