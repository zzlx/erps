const HomePagePromise = import('./views/HomePage.mjs');
const HomePage = React.lazy(() => HomePagePromise);
const NotFound = React.lazy(() => import('./views/NotFound.mjs'));

export default [
  { 
    "path": "/settings/:module(\\w+)?", 
    "title": "设置",
    "component": HomePage,
    "exact": false
  },
  { 
    "path": [ "/", "/index.html", "/home/:module(\\w+)?" ], 
    "title": "首页|Home",
    "component": HomePage, 
    "exact": true
  },
  {
    "path": "/databases/:tables(\\w+)?",
    "title": "数据库",
    "component": HomePage,
    "exact": true
  },
  { 
    "path": "*", 
    "title": "Error:404|NotFound",
    "component": NotFound,
    "exact": false
  }
]
