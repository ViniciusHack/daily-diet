// eslint-disable-next-line
import { Knex } from "knex"

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      email: string
    }
    meals: {
      id: string
      userId: string
      name: string
      description: string
      eatenAt: string
      diet: boolean
      createdAt: Date
      updatedAt: Date
    }
  }
}
