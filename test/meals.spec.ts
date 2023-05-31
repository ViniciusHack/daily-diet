import { execSync } from 'child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

const meals = [
  {
    name: 'Testing meal',
    description: 'My testing meal',
    eatenAt: new Date('2023-01-01T16:00:00.000Z'),
    diet: true,
  },
  {
    name: 'Testing meal',
    description: 'My testing meal',
    eatenAt: new Date('2023-01-01T19:00:00.000Z'),
    diet: true,
  },
  {
    name: 'Testing meal',
    description: 'My testing meal',
    eatenAt: new Date('2023-01-02T01:00:00.000Z'),
    diet: true,
  },
  {
    name: 'Testing meal',
    description: 'My testing meal',
    eatenAt: new Date('2023-01-04T05:00:00.000Z'),
    diet: true,
  },
  {
    name: 'Testing meal part 2',
    description: 'My testing meal part 2',
    eatenAt: new Date('2023-01-05T23:00:00.000Z'),
    diet: false,
  },
]

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
    const response = await request(app.server).post('/users').send({
      email: 'test@test.com',
    })
    cookies = response.get('Set-Cookie')
  })

  let cookies: string[] = []

  describe('Users', () => {
    it('should be able to create a new user', async () => {
      const userResponse = await request(app.server)
        .post('/users')
        .send({
          email: 'testing@test.com',
        })
        .expect(201)

      expect(userResponse.body.user).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      )
    })

    it('should not be able to create a user that already exists', async () => {
      await request(app.server)
        .post('/users')
        .send({
          email: 'test@test.com',
        })
        .expect(400)
    })
  })

  it('should be able to create a new meal', async () => {
    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meals[0])
      .set('Cookie', cookies)
      .expect(201)

    expect(mealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      }),
    )
  })

  it('should be able to edit a meal', async () => {
    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meals[0])
      .set('Cookie', cookies)

    const mealId = mealResponse.body.meal.id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        ...meals[0],
        name: 'My meal edited',
        eatenAt: new Date('2023-05-30T12:00:00.000Z'),
      })
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should not be able to edit a meal from another user', async () => {
    const userResponse = await request(app.server).post('/users').send({
      email: 'testing@test.com',
    })

    const anotherUserCookies = userResponse.get('Set-Cookie')

    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meals[1])
      .set('Cookie', anotherUserCookies)

    const mealId = mealResponse.body.meal.id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        ...meals[1],
        name: 'My meal edited',
        eatenAt: new Date('2023-05-30T12:00:00.000Z'),
      })
      .set('Cookie', cookies)
      .expect(404)
  })

  it('should be able to delete a meal', async () => {
    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meals[0])
      .set('Cookie', cookies)

    const mealId = mealResponse.body.meal.id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should not be able to delete a meal from another user', async () => {
    const userResponse = await request(app.server).post('/users').send({
      email: 'testing@test.com',
    })

    const anotherUserCookies = userResponse.get('Set-Cookie')

    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meals[1])
      .set('Cookie', anotherUserCookies)

    const mealId = mealResponse.body.meal.id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(404)
  })

  it('should be able to list all meals from a user', async () => {
    await request(app.server)
      .post('/meals')
      .send(meals[0])
      .set('Cookie', cookies)

    await request(app.server)
      .post('/meals')
      .send(meals[1])
      .set('Cookie', cookies)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealsToCheck = meals.map((meal) => ({
      name: meal.name,
      description: meal.description,
      diet: meal.diet,
    }))

    expect(listMealsResponse.body.meals).toEqual(
      expect.arrayContaining([
        expect.objectContaining(mealsToCheck[0]),
        expect.objectContaining(mealsToCheck[1]),
      ]),
    )
  })

  it('should be able to get a specific meal', async () => {
    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meals[0])
      .set('Cookie', cookies)

    const mealId = mealResponse.body.meal.id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: meals[0].name,
        description: meals[0].description,
        diet: meals[0].diet,
      }),
    )
  })

  it('should not be able to get a specific meal from another user', async () => {
    const userResponse = await request(app.server).post('/users').send({
      email: 'testing@test.com',
    })

    const anotherUserCookies = userResponse.get('Set-Cookie')

    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meals[0])
      .set('Cookie', anotherUserCookies)

    const mealId = mealResponse.body.meal.id

    await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(404)
  })

  it('should be able to get the metrics from the user', async () => {
    for (const meal of meals) {
      await request(app.server).post('/meals').send(meal).set('Cookie', cookies)
    }

    const metricsResponse = await request(app.server)
      .get('/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(metricsResponse.body.metrics).toEqual({
      total: meals.length,
      onTheDiet: meals.filter((meal) => meal.diet).length,
      offTheDiet: meals.filter((meal) => !meal.diet).length,
      bestStreak: 2,
    })
  })
})
