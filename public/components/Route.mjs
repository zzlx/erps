/**
 * *****************************************************************************
 *
 * Route 路由组件
 *
 * @param {object} props
 * @return {object} element
 *
 * *****************************************************************************
 */

import matchPath from '../utils/matchPath.mjs';
import warning from '../utils/warning.mjs';

export default class Route extends React.Component {
  render() {
    const location = this.props.location;

    const match = this.props.match
      ? this.props.match
      : this.props.path
        ? matchPath(location.pathname, this.props)
        : false;

    if (!match) return null; // 未匹配到路由

    const props = { location, match };

    // 优先级 children >>
    let { children, component, render } = this.props;

    if (children && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }

    if (component) {
      if (typeof component === 'function') {
        return component(props);
      }

      if (typeof component.constructor === 'function') {
        return React.createElement(component, props);
      }
    }

    if (render && typeof render === 'function') {
      return render(props);
    }

    // @todo: 组合输出所有配置的组件 
    return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props == nextProps) return false;
    else return true;
  }

  componentDidMount () {
    const isEmptyChildren = (children) => React.Children.count(children) === 0;

    warning(
      !(
        this.props.children &&
        !isEmptyChildren(this.props.children) &&
        this.props.component
      ),
      "You should not use <Route component> and <Route children> in the same route; <Route component> will be ignored"
    );

    warning(
      !(
        this.props.children &&
        !isEmptyChildren(this.props.children) &&
        this.props.render
      ),
      "You should not use <Route render> and <Route children> in the same route; <Route render> will be ignored"
    );

    warning(
      !(this.props.component && this.props.render),
      "You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored"
    );
  }

  componentDidUpdate (prevProps) {
    warning(
      !(this.props.location && !prevProps.location),
      '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!this.props.location && prevProps.location),
      '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  }
}
