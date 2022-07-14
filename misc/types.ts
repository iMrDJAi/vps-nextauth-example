import type { NextApiRequest, NextApiResponse } from 'next'
import type { Request, Response, NextFunction } from 'express'


type RequestHandler = (
  req: NextApiRequest & Request,
  res: NextApiResponse & Response,
  next: NextFunction
) => any

export type { RequestHandler }
