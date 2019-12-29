/**
 *
 * 借贷宝砍头息及续借分析
 */
import console from '../utils/console.mjs';

export default async function () {
  const jdb = 'Output.借贷宝借据_1576452725938';

	const cursor = this.db.collection(jdb).find({});
	const total = await cursor.count();
	const ops = [];
	let counter = 0;
	let now = null;
	let last = null;
	let lastest = null;
	
	while ((now = await cursor.next()) !== null) {
		console.progressBar(counter++, total);
		if (last == null) { last = now; continue; }
		let rate = 0;
		let isBigNow = null;
		let isKTX = false;
		let totalJE = 0;

		if (
			now['发标方'] === last['发标方'] &&
			(now['借出时间'] - last['借出时间']) <= 3600000 * 2 &&
			(now['到期日'] - last['到期日']) === 0
		) {
			isBigNow = now['本金'] > last['本金'];
			totalJE = now['本金'] + last['本金'];
			
			rate = isBigNow ? last['本金']/totalJE : now['本金']/totalJE; 
			if (rate >= 0.10 && rate <= 0.45) isKTX = true;
		}

		ops.push({updateOne: {
			filter: {_id: last._id},
			update: { $set: {
				'是否头息借据': isBigNow ? true : false,
				'是否本金借据': isBigNow ? false : true,
				'头息利率': rate, 
				'对应借据ID': isBigNow 
					? '[' + now['债权ID'] + '+' + last['债权ID'] + ']'
					: '[' + last['债权ID'] + '+' + now['债权ID'] + ']'
			}}
		}});

		ops.push({updateOne: {
			filter: {_id: now._id},
			update: { $set: {
				'是否头息借据': isBigNow ? false : true,
				'是否本金借据': isBigNow ? true : false,
				'头息利率': rate, 
				'对应借据ID': isBigNow 
					? '[' + now['债权ID'] + '+' + last['债权ID'] + ']'
					: '[' + last['债权ID'] + '+' + now['债权ID'] + ']'
			}}
		}});

		lastest = last
		last = now;
	}


	await this.db.collection(jdb).bulkWrite(ops).then(res => {
		console.log(res);
	});;


}

// 字段排列

