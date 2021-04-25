/**
 * *****************************************************************************
 *
 * Nav组件
 *
 * *****************************************************************************
 */

import { React } from './React.mjs';

export class Nav extends React.PureComponent {
    constructor(props) {
				super(props);

			  this.state = { 
					activeItem: -1, // active指针
        }

				// 绑定事件处理器
		    this.activeHandler = this.activeHandler.bind(this);
			  this.tabHandler = this.tabHandler.bind(this);
			  this.navLinkAction = this.navLinkAction.bind(this);
    }

    render () {
      const { 
          data,
          pills, fill, justified, tabs, position,
          className, children, onClick, ...rests
      } = this.props;

      // 构造className
      const nav_c = [
        'nav',
        pills && !tabs && 'nav-pills',
        fill && 'nav-fill',
        tabs && 'nav-tabs',
        justified && 'nav-justified',
        position === 'center' && 'justify-content-center',
        position === 'right' && 'justify-content-end',
        position === 'vertical' && 'flex-column',
        className,
      ].filter(Boolean).join(' ');

      // 设置 
      let type = 'nav';

      // @tasks: 
      // 1. 为子项目应用class类
      // 2. 为子项目应用动作控制器
      // new children
      const newChildren = React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;
        const isActive = i === this.state.activeItem;

        // @task1: 子项目添加nav-item\nav-link
        //  item className
        const item_nc = ['nav-item']; 

        // @Condition_1: 子组件为li时
        if (child.type === 'li') {
          type = 'ul';
          // child's chidren
          const CC = React.Children.map(child.props.children, child => {
            if (React.isValidElement(child) && child.type === 'a') {
              child = applyNavLink(child, isActive);
            }

            return child; 
          });

          child = React.cloneElement(child, null, CC);
        }

        // @Condition_2: 子组件为a时
        if (child.type === 'a') {
          child = applyNavLink(child, isActive);
        }

        if (child.props.className) item_nc.push(child.props.className);

        // 子组件应用className
        return React.cloneElement(child, { 
          className: item_nc.join(' '),
          onClick: (e) => {
            this.activeHandler(i);
            this.tabHandler(e);
            //child.props.onClick && child.props.onClick(e);
          },
        });
      });

      return React.createElement(type, {
        className: nav_c, 
        role: tabs ? 'tablist' : null,
        ...rests,
        onClick: (e) => { 
          this.navLinkAction(e);
          onClick && onClick(e);
        },
      }, newChildren);
  }
}


function applyNavLink (child) {
  const cn = [
    'nav-link',
    child.props.active && 'active',
    child.props.disabled && 'disabled',
    child.props.className,
  ].filter(Boolean).join(' ');

  return React.cloneElement(child, { className: cn }); 
}

/**
 *
 */

Nav.prototype.activeHandler = function (key) {
  this.setState({activeItem: key});
  return;

  const nav = event.currentTarget;

  // 取消动作处理
  if (event.target === nav) return;

  // 获取links列表
  const links = nav.querySelectorAll('a.nav-link');

  // 遍历links,取消active状态
  for (let item of links) {
    if (item === event.target) item.classList.add('active');
    else item.classList.remove('active');
  }
}

/**
 *
 */

Nav.prototype.tabHandler = function (event) {
  const selectors = event.target.hash;
  if (null == selectors || '' === selectors) return;

  const target = document.querySelector(selectors);

  // 获取不到target时,return
  if (null == target) return;

  const tabContent = target.parentNode;
  for (let item of tabContent.children) {
    item.classList.remove('active');
  }

  target.classList.add('active');
}

/**
 *
 *
 */

Nav.prototype.navLinkAction = function (e) {
  const link = e.target;
  if (link.href == null) return;
  const isBlank = link.target === '_blank';

  // 阻止默认页面刷新动作
  if (!isBlank) e.preventDefault();

  const loc = new URL(link.href);

  // 仅在pathname发生变化时触发PUSHSTATE动作
  if (window.location.pathname !== loc.pathname) {
  }
}

/**
 * Tab Content
 */

Nav.TabContent = function (props) {
  const { className, children, ...rests } = props;

  // 设置className
  const cn = ['tab-content'];
  if (className) cn.push(className);

  // apply tab-pane className to children
  const newChildren = React.Children.map(children, child => {
    const cn = ['tab-pane'];
    if (child.props.className) cn.push(child.props.className);
    return React.cloneElement(child, {className: cn.join(' ')});
  });

  return React.createElement('div', { 
    className: cn.join(' '), 
    ...rests 
  }, newChildren);
}

