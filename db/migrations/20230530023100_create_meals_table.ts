import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('userId').references('id').inTable('users').index()
    table.string('name')
    table.string('description')
    table.dateTime('eatenAt')
    table.boolean('diet')
    table.dateTime('createdAt').defaultTo(knex.fn.now())
    table.dateTime('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
