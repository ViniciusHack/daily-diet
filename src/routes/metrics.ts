import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'

export async function metricRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (req, reply) => {
      const { sessionId } = req.cookies

      const meals = await knex('meals')
        .where({
          userId: sessionId,
        })
        .select('diet', 'eatenAt')
        .orderBy('eatenAt')

      const { allStreaks, currentStreak } = meals.reduce(
        (acc, meal) => {
          const mealDate = new Date(meal.eatenAt)
          const mealDay = `${mealDate.getFullYear()}-${
            mealDate.getMonth() + 1
          }-${mealDate.getDate()}`

          if (acc.lastDay && mealDay === acc.lastDay) {
            if (!meal.diet) {
              acc.allStreaks.push(acc.currentStreak)
              acc.currentStreak = 0
            }
          } else {
            if (acc.lastDay) {
              acc.allStreaks.push(acc.currentStreak)
              const lastDate = new Date(acc.lastDay)
              lastDate.setDate(lastDate.getDate() + 1)
              // eslint-disable-next-line no-unmodified-loop-condition
              while (lastDate < mealDate) {
                acc.allStreaks.push(0)
                lastDate.setDate(lastDate.getDate() + 1)
              }
            }
            acc.currentStreak = meal.diet ? acc.currentStreak + 1 : 0
          }

          acc.lastDay = mealDay
          return acc
        },
        {
          currentStreak: 0,
          allStreaks: [],
          lastDay: null,
        } as {
          currentStreak: number
          allStreaks: Array<number>
          lastDay: string | null
        },
      )

      allStreaks.push(currentStreak)

      return reply.status(200).send({
        metrics: {
          total: meals.length,
          onTheDiet: meals.filter((meal) => meal.diet).length,
          offTheDiet: meals.filter((meal) => !meal.diet).length,
          bestStreak: Math.max(...allStreaks),
        },
      })
    },
  )
}
