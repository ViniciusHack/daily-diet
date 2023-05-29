import fastify from "fastify";
import { env } from './env';
import { userRoutes } from "./routes/users";

const app = fastify()

app.register(userRoutes)

app.listen({
  host: '0.0.0.0',
  port: env.PORT
})