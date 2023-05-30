import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

const createUserSchema = z.object({
  email: z.string().email(),
})

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (req, reply) => {
    const body = createUserSchema.parse(req.body)

    const userAlreadyExists = await knex('users')
      .where({
        email: body.email,
      })
      .first()

    if (userAlreadyExists) {
      return reply.status(400).send({
        code: 'user.already-exists',
        error: 'User already exists',
      })
    }

    const userId = randomUUID()

    await knex('users').insert({
      id: randomUUID(),
      email: body.email,
    })

    reply.cookie('sessionId', userId, {
      path: '/',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(201).send({ user: { id: userId } })
  })
}
