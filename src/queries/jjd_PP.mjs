/**
 * 今借到匹配
 */

export default async function () {
	const jdb = 'Output.借贷宝借据_1576452725938';
	const jjd = 'OUTPUT.今借到.借据_1576602777990';

	const cursor = this.db.collection(jjd).find({});
	const ops = [];
	const total = await cursor.count();
	let counter = 0;
	let doc = null;
	
	while ((doc = await cursor.next()) !== null) {
		let hasZFB = doc['借款人支付宝账号']


	}

}
