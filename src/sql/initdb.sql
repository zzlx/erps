/**
 *
 * 数据库初始化
 * 
 */

-- 自定义类型
CREATE TYPE weeks AS ENUM ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');

CREATE TABLE IF NOT EXISTS settings (
  item  text,
  value text
);

CREATE TABLE IF NOT EXISTS products (
  product_no integer UNIQUE NOT NULL,
  name       text,
  price      numeric
);

CREATE TABLE IF NOT EXISTS weather (
    city    varchar(80) references cites(name),
    temp_lo int,
    temp_hi int,
    prcp    real,
    date    date
);

CREATE TABLE IF NOT EXISTS cities ( 
  name     varchar(80) primary key, 
  population real,
  elevation int,
  location point
);

CREATE TABLE IF NOT EXISTS certs ( 
  cert      text,
  timestamp timestamp
);

CREATE TABLE IF NOT EXISTS capitals (
  state char(2) UNIQUE NOT NULL
) INHERITS (cities);

CREATE VIEW myview AS
  SELECT name, temp_lo, temp_hi, prcp, date, location
    FROM weather, cities
    WHERE city = name;
