import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  if (!req.cookies.sessionId) {
    return reply.status(401).send({
      message: 'Unauthorized',
    })
  }
}
