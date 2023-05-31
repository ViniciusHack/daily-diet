import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { mealRoutes } from './routes/meals'
import { metricRoutes } from './routes/metrics'
import { userRoutes } from './routes/users'

export const app = fastify()

app.register(cookie)

app.register(userRoutes, {
  prefix: 'users',
})

app.register(mealRoutes, {
  prefix: '/meals',
})

app.register(metricRoutes, {
  prefix: '/metrics',
})
