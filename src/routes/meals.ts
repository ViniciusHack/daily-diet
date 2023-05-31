import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'

const createMealSchema = z.object({
  name: z.string(),
  description: z.string(),
  eatenAt: z.string().datetime(),
  diet: z.boolean(),
})

const specificParamSchema = z.object({
  id: z.string().uuid(),
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

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const body = createMealSchema.parse(req.body)
      const { id: mealId } = specificParamSchema.parse(req.params)

      const { sessionId } = req.cookies

      const updated = await knex('meals')
        .where({
          id: mealId,
          userId: sessionId,
        })
        .update({
          ...body,
          id: mealId,
          userId: sessionId,
          updatedAt: new Date().toISOString(),
        })
        .returning('*')

      if (!updated || updated.length === 0) {
        return reply.status(404).send()
      }

      return reply.status(200).send()
    },
  )

  app.delete(
    `/:id`,
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { id: mealId } = specificParamSchema.parse(req.params)

      const { sessionId } = req.cookies

      const deleted = await knex('meals')
        .where({
          id: mealId,
          userId: sessionId,
        })
        .delete()
        .returning('*')

      if (!deleted || deleted.length === 0) {
        return reply.status(404).send()
      }

      return reply.status(200).send()
    },
  )

  app.get(
    `/:id`,
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { id: mealId } = specificParamSchema.parse(req.params)

      const { sessionId } = req.cookies

      const meal = await knex('meals')
        .where({
          id: mealId,
          userId: sessionId,
        })
        .first()

      if (!meal) {
        return reply.status(404).send()
      }

      meal.diet = !!meal.diet

      return reply.status(200).send({ meal })
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies

      const meals = await knex('meals').where({
        userId: sessionId,
      })

      return reply
        .status(200)
        .send({ meals: meals.map((meal) => ({ ...meal, diet: !!meal.diet })) })
    },
  )
}
