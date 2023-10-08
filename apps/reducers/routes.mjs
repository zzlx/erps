/**
 * *****************************************************************************
 *
 * 路由配置
 *
 *
 * *****************************************************************************
 */

const defaults = [
  { 
    "path": [ "/", "/homepage", "/homepage/:module(\\w+)?" ], 
    "app": "HomePage",
    "title": "首页|Home",
    "keywords": "",
    "exact": true,
  },
  { 
    "path": "/settings/:module(\\w+)?", 
    "app": "HomePage",
    "title": "设置",
    "keywords": "",
    "exact": false,
  },
  {
    "path": "/login",
    "app": "Login",
    "title": "登陆|Login",
    "exact": false,
  },
  {
    "path": "/databases/:tables(\\w+)?",
    "app": "HomePage",
    "title": "数据库",
    "exact": true,
  },
  { 
    "path": "*", 
    "app": "NotFound",
    "title": "Error:404|NotFound",
    "exact": false,
  },
];

export function routes (state = defaults, action) {
  switch(action.type){
    default: 
      return state;
  }
}
