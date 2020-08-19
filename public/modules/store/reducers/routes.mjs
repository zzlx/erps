/**
 *
 */

import { types } from '../actions/index.mjs';
import getIn from '../../utils/getIn.mjs';

const routes = [
  { 
    "path": "/settings/:module(\\w+)?", 
    "title": "设置",
    "view": "HomePage",
    "exact": false
  },
  { 
    "path": [ "/", "/index.html", "/homepage", "/homepage/:module(\\w+)?" ], 
    "title": "首页|Home",
    "view": "HomePage",
    "exact": true,
  },
  {
    "path": "/login",
    "title": "登陆",
    "view": "Login",
    "exact": false
  },
  {
    "path": "/databases/:tables(\\w+)?",
    "title": "数据库",
    "view": "HomePage",
    "exact": true
  },
  { 
    "path": "*", 
    "title": "Error:404|NotFound",
    "view": "NotFound",
    "exact": false
  }
];

export default (state = routes, action) => {
  return state;
}
