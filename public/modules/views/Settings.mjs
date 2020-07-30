/**
 * 系统设置
 *
 */

import {
  Alert, Anchor,
  RootContext as Context,
  Nav,
  List,
  Route,
  Sprite,
  Layout,
} from '../components/index.mjs';

import ModifiHomePage from './ModifiHomePage.mjs';
import Picture from './Picture.mjs';
import SystemInfo from './SystemInfo.mjs';
import Game from './Games.mjs';

const modules = {
  game: Game, 
  picture: Picture, 
  system: SystemInfo, 
  home: ModifiHomePage, // 主页面维护
}

export default class Settings extends React.PureComponent {
  render() {
    const { store } = this.context;
    const theme = this.context.storeState.profiles.theme;
    const navArray = store.getState('navs');

    const lists = [];
    this.context.storeState.navs.map((item, index) => {
      const li = React.createElement('li', {
        key: index,
        'data-collapse': 'tab',
        'data-target': item.href,
      }, item.item);

      lists.push(li);
    });

    const navList = React.createElement(List, { theme: theme }, lists);

    const searchBar = React.createElement('input', { 
      type: 'search',
      className: "form-control",
      placeholder: '查找...',
    });

    const moduleParam = React.createElement('div', 
      null, 
      this.props.match.params.module || 'test'
    );
    const inputGroup = React.createElement('div', { 
      className: 'm-3', 
    }, searchBar);
    const hr = React.createElement('hr');
    const collapse = React.createElement('div', { }, navList, moduleParam);

    const module = this.props.match.params.module || 'home';

    const Router = React.createElement(Route, {
      location: window.location,
      path: this.props.match.url,
      component: modules[module]
    });

    const container = React.createElement(Layout.PWA, { 
      aside: React.createElement(React.Fragment, null, 
        inputGroup, 
        hr, 
        collapse
      ),
    }, Router);

    const logo = React.createElement(Sprite, {id: 'logo'});

    const footer = React.createElement(Layout.Footer, null, 'test', logo);

    const nav = React.createElement(Nav, { 
      position: 'center', 
      pills: true, 
      data: navArray,
    });

    const header = React.createElement(Layout.Header, null, nav);

    return React.createElement(React.Fragment, null, 
      header,
      container, 
      footer
    );
  }

  componentDidMount() {
    const container = document.getElementById('root');
    container.classList.add('d-flex', 'vh-100', 'flex-column');
  }

  componentWillUnmount() {
    const container = document.getElementById('root');
    container.classList.remove('d-flex', 'vh-100', 'flex-column');
  }
}

Settings.contextType = Context;
