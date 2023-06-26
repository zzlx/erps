/**
 * 执行数据库列表查询
 */

export default (root, args, ctx, info) => {
  return ctx.mongodb.connect().then(client => {
    const db = client.db().admin();
    return db.listDatabases().then(dbs => {
      if (dbs.ok) return dbs.databases; 
    });
  });
}
