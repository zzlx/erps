/**
 * list databases, excluding templates:
 */

SELECT datname FROM pg_database WHERE datistemplate = false;
