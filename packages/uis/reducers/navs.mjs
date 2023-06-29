/**
 * *****************************************************************************
 *
 * 管理nav数据状态
 *
 *
 * *
 *
 *
 * *****************************************************************************
 */

const initialState = {
  page: {
 // Header: {
    Navbar: { className: 'navbar-light',
      style: { backgroundColor: "#fff" },
      brand: { 
        className: "navbar-brand",
        height: '28',
        src: "https://www.pekingcpahn.com/img/logo.jpg",
        alt: '事务所ERP综合业务管理系统',
        text: "综合业务平台",
        href: '#',
      },
      menu: {
        data: [
          { href: '#', text: '首页'},
          { href: '#', text: '函证管理', subMenu: {
            className: '',
            data: [
              { href: '#', text: '函证制单', className: 'test', src: '/assets/icons/file.svg'},
              { href: '#', text: '发函管理', className: 'test', src: '/assets/icons/mailbox.svg'},
              { divider: true },
              { href: '#', text: '函证统计', src: '/assets/icons/table.svg'},
            ]
          }},
          { href: '#', text: '财务管理', subMenu: {
            data: [
              { href: '#', text: '费用报销', className: 'test', src: '/assets/icons/file.svg'},
              { href: '#', text: '借支现金', className: 'test', src: '/assets/icons/file.svg'},
              { href: '#', text: '借支现金', className: 'test', src: '/assets/icons/file.svg'},
              { href: '#', text: '业务回款', className: 'test', src: '/assets/icons/mailbox.svg'},
              { divider: true },
              { href: '#', text: '个人报销统计', src: '/assets/icons/table.svg'},
              { href: '#', text: '项目收支统计', src: '/assets/icons/table.svg'},
            ]
          }},
          { href: '#', text: 'TEST', disabled: true},
          { href: '#', text: '帮助文档'},
        ],
      },
      search: true,
      shortcuts: {
        data: [
          { href: '#', text: '注册', src: "/assets/icons/hr.svg"  },
          { href: '#', text: '登录', src: "/assets/icons/person-fill.svg"  },
        ]
      }
    },
    //},
    Carousel: {
      touch: false,
      interval: false,
      data: [
        { src: 'https://www.pekingcpahn.com/img/banner4.jpg', alt: 'ttttt' },
        { src: 'https://www.pekingcpahn.com/img/banner5.jpg', alt: 'ttttt' },
        { src: 'https://www.pekingcpahn.com/img/banner6.jpg', alt: 'ttttt' },
      ]
    },
    Card: {
      header: 'HEADER',
      body: ``, 
      footer: 'FOOTER',
    }
  }
};

export const navs = (state = initialState, action) => {
  switch (action.type) {
    case 'QUERY_NAVS':
    case 'REVEIVE_NAVS':
      return Object.assign({}, state, action.payload.stats);
    default:
      return state;
  }
}

/**
 * 设置活动项
 *
 */

function setActive (state) {
  // 获取active项目
  for (let item of state) {
  }
}
