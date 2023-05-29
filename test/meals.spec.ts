import { execSync } from 'child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { app } from '../src/app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  describe('Users', () => {
    it('should be able to create a new user', async () => {
      await request(app.server)
        .post('/users')
        .send({
          email: 'test@test.com',
        })
        .expect(201)
    })

    it('should not be able to create a user that already exists', async () => {
      await request(app.server).post('/users').send({
        email: 'test@test.com',
      })

      await request(app.server)
        .post('/users')
        .send({
          email: 'test@test.com',
        })
        .expect(400)
    })
  })

  it('should be able to create a new meal', async () => {})

  it('should be able to edit a meal', async () => {})

  it('should not be able to edit a meal from another user', async () => {})

  it('should be able to delete a meal', async () => {})

  it('should not be able to delete a meal from another user', async () => {})

  it('should be able to list all meals from a user', async () => {})

  it('should not be able to list all meals from another user', async () => {})

  it('should be able to get a specific meal', async () => {})

  it('should not be able to get a specific meal from another user', async () => {})

  it('should be able to get the metrics from the user', async () => {})

  it('should not be able to get the metrics from another user', async () => {})
  //   - Deve ser possível registrar uma refeição feita, com as seguintes informações:
  //     *As refeições devem ser relacionadas a um usuário.*
  //     - Nome
  //     - Descrição
  //     - Data e Hora
  //     - Está dentro ou não da dieta
  // - Deve ser possível recuperar as métricas de um usuário
  //     - Quantidade total de refeições registradas
  //     - Quantidade total de refeições dentro da dieta
  //     - Quantidade total de refeições fora da dieta
  //     - Melhor sequência por dia de refeições dentro da dieta
  // - O usuário só pode visualizar, editar e apagar as refeições o qual ele criou
})
