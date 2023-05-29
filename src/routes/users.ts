import { FastifyInstance } from "fastify";


export function userRoutes(app: FastifyInstance) {
  app.get('hello', (req, reply) => {
    return reply.send("Hello!")
  })
}