export default [
  { 
    "app": "HomePage",
    "path": "/settings/:module(\\w+)?", 
    "title": "设置",
    "exact": false
  },
  { 
    "app": "HomePage", 
    "path": [ "/", "/index.html", "/home/:module(\\w+)?" ], 
    "title": "首页|Home",
    "exact": true
  },
  {
    "app": "HomePage",
    "path": "/databases/:tables(\\w+)?",
    "title": "数据库",
    "exact": true
  },
  { 
    "app": "Test",
    "path": "*", 
    "title": "Test|组件测试",
    "exact": false
  },
  { 
    "app": "NotFound",
    "path": "*", 
    "title": "Error:404|NotFound",
    "exact": false
  }
]
