/**
 * *****************************************************************************
 * 
 * /graphql
 *
 * *****************************************************************************
 */

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { Router } from '../koa/Router.mjs'; 
//import * as _graphql from '../../apps/graphql/index.mjs';
//

export default function (ctx, next) {
  ctx.body = `<html>
  <h1>GraphQL API</h2>
  <ul>
    <li><a href="/">返回首页🔙</a></li>
  </ul>
</html>`;
  return next();
}
