/**
 *
 */

const routes = [
  { 
    "app": "HomePage",
    "path": "/settings/:module(\\w+)?", 
    "title": "设置",
    "exact": false
  },
  { 
    "app": "HomePage",
    "path": [ "/", "/index.html", "/homepage", "/homepage/:module(\\w+)?" ], 
    "title": "首页|Home",
    "exact": true,
  },
  {
    "app": "Login",
    "path": "/login",
    "title": "登陆",
    "exact": false
  },
  {
    "app": "HomePage",
    "path": "/databases/:tables(\\w+)?",
    "title": "数据库",
    "exact": true
  },
  { 
    "app": "NotFound",
    "path": "*", 
    "title": "Error:404|NotFound",
    "exact": false
  }
];

export default (state = routes, action) => {
  return state;
}
