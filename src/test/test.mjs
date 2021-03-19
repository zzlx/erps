#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * *****************************************************************************
 */


import pg from 'pg';
const Pool = pg.Pool;
const Client = pg.Client;


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'erps',
  password: 'secretpassword',
  port: 5432,
})
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})

const client = new Client({
  user: 'dbuser',
  host: 'database.server.com',
  database: 'mydb',
  password: 'secretpassword',
  port: 3211,
})
client.connect()
client.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  client.end()
})
