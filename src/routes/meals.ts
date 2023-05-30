import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

const createMealSchema = z.object({
  name: z.string(),
  description: z.string(),
  eatenAt: z.date().transform((date) => date.toISOString()),
  diet: z.boolean(),
})

export async function mealRoutes(app: FastifyInstance) {
  app.post('/', async (req, reply) => {
    const body = createMealSchema.parse(req.body)
    const mealId = randomUUID()

    const { sessionId } = req.cookies

    await knex('meals').insert({
      ...body,
      id: mealId,
      userId: sessionId,
    })

    return reply.status(201).send({ meal: { id: mealId } })
  })
}
