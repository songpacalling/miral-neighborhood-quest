import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const room=sqliteTable('room',{id:integer('id').primaryKey(),seed:integer('seed').notNull(),revealed:integer('revealed').notNull().default(0)});
export const answers=sqliteTable('answers',{seed:integer('seed').notNull(),student:text('student').notNull(),qid:text('qid').notNull(),choice:text('choice').notNull(),correct:integer('correct').notNull(),created:text('created').notNull()},t=>[primaryKey({columns:[t.seed,t.student,t.qid]})]);
