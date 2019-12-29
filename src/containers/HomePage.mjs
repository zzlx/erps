/**
 * 首页面前端程序
 */

import React from 'react';
import { 
    Alert, Anchor,
    Barcode,
    Badge, Breadcrumb, Button,
    Clock, Card, Carousel,
    Layout,
    Tables,
    Markdown, Nav,
    Pagination, Picture,
    QRCode, Route,
    RootContext as Context, 
    Sprite, Spinner, 
} from '../components/index.mjs';

import graphql from '../actions/graphql.mjs';

export default class HomePage extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
    };
    this.needQuery = false;
  }
}

HomePage.contextType = Context;

HomePage.prototype.render = function () {
  const { store } = this.context;
  const navArray = store.getState('navs');

  const Li = (props) => React.createElement('li', null, props.children);
  const databases = Tables.DataTable({ data: this.state.dbs, striped: true, });

	return (
		<React.Fragment>
			<Layout.Header>
				<Nav position="center">
						<li>test</li>
				</Nav>
			</Layout.Header>
			<Layout.Container>
				{databases}
				<ul>
					<li>列表
							<ul>
								<li>嵌套表格</li>
								<li>嵌套表格</li>
								<li>嵌套表格</li>
								<li>嵌套表格</li>
								<li>嵌套表格</li>
							</ul>
					</li>

					<li>列表</li>
					<li>列表</li>
					<li>列表</li>
					<li>列表</li>
				</ul>
			</Layout.Container>
			<Layout.Footer>
				{ store.getState('profiles', 'footer') }
    {'test'}
			</Layout.Footer>
		</React.Fragment>
	);
}

// 
HomePage.prototype.componentDidMount = function () {
		let needQuery = true
		const store = this.context.store;
		const footer = store.getState('profiles', 'footer');
		if (null == footer) {
		}

		// 查询字符串
		const query = `{ 
			random 
			dbs {
				Name: name
				Size: sizeOnDisk
				empty
			}
		}`;
}
