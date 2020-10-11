/**
 *
 *
 */

import assert from 'assert';
import util from 'util';
const debug = util.debuglog('debug');

export default function (root, args, ctx, info) {
  return ctx.db.mongodb.connect().then(client => {
    const adminDb = client.db().admin();

    return adminDb.listDatabases().then(dbs => {
      return dbs.databases;
    }).catch(err => { assert.equal(null, err) });
  });
}
