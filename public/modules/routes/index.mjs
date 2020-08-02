export default [
  { 
    "path": "/settings/:module(\\w+)?", 
    "title": "设置",
    "view": "HomePage",
    "exact": false
  },
  { 
    "path": [ "/", "/index.html", "/home/:module(\\w+)?" ], 
    "title": "首页|Home",
    "view": "HomePage", 
    "exact": true
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
]
