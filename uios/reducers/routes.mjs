/**
 * *****************************************************************************
 *
 *
 *
 * *****************************************************************************
 */

const routes = [
  { 
    "app": "HomePage",
    "path": [ "/", "/index.html", "/homepage", "/homepage/:module(\\w+)?" ], 
    "title": "首页|Home",
    "keywords": "",
    "exact": true,
  },
  { "app": "HomePage",
    "path": "/settings/:module(\\w+)?", 
    "title": "设置",
    "keywords": "",
    "exact": false
  },
  {
    "app": "Login",
    "path": "/login",
    "title": "登陆|Login",
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

export default function (state = routes, action) {

  switch(action.type){
    default: 
    return state;
  }
}
