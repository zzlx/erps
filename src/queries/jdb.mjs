/**
 *
 */

import console from '../utils/console.mjs';
export default async function () {
	const jdb = 'Output.借贷宝借据_1576452725938';
	const jkrmd = 'OUTPUT.借款人名单_1576613016109';

	const cursor = this.db.collection(jkrmd).find({
		'支付宝账号': {$nin: ["", null]},
		'身份ID': {$ne: null}
	});
	const ops = [];
	const total = await cursor.count();
	let counter = 0;
	let now = null;
	
	while ((now = await cursor.next()) !== null) {

	}



}
