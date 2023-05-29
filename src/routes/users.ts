import { FastifyInstance } from 'fastify'

export async function userRoutes(app: FastifyInstance) {
  app.get('hello', (req, reply) => {
    return reply.send('Hello!')
  })
}
