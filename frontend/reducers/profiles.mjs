/**
 * *****************************************************************************
 *
 * profiles 配置文件
 *
 * *****************************************************************************
 */

const initialState = [
  { name: 'themeList', value: [
    'primary', 'secondary', 'success', 'info', 'warning', 'light', 'dark'] },
  { name: 'theme', value: 'default'},
  { name: 'location', value: { pathname: '/' } },
  { name: 'routes', value: [
    { "app": "HomePage",
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
  ] },
];

export default function profiles (state = initialState, action) {

  switch(action.type){
    case 'GET_API_ADDRESS':
      return Object.assign({}, state, {api_address: action.payload.api_address}); 
    case 'PROFILES_THEME_UPDATE':
      const newTheme = action.payload || 'secondary';
      return Object.assign({}, state, {theme: newTheme});
    case 'PROFILES_THEME_UPDATE':
      return state;
    case 'SET_PAGE_FOOTER':
      return Object.assign({}, state, {footer: action.payload});
    case 'LOGIN_SUCCESS':
      return action.payload.id;
    case 'LOGOUT':
    case 'GRAPHQL_API_QUERY':
      if (!action.payload) return state;
      if (action.payload.data['docs']) {
        return Object.assign({}, state, {
          welcome: action.payload.data.docs,
        });
      }
      return state;
    default: 
    return state;
  }
}
