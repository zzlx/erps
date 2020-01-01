/**
 *
 */

import console from '../utils/console.mjs';
import array from '../utils/array.mjs';
import string from '../utils/strings.mjs';
import path from 'path';
import fs from 'fs';

export default async function () {

	// 用到的数据表
    const t_jjdjj = 'OUTPUT.今借到.借据_1576602777990';
	const t_jdbjj = 'Output.借贷宝借据_1576452725938';
	const t_jkr_jjd = 'INFO.借款人_今借到_20191219';
	const t_xyr_md = 'INFO.嫌疑人_名单_20191218';
	const t_jkr_jdb = 'INFO.借款人_借贷宝_20191219';
	const t_jkr_zfb = 'INFO.借款人_支付宝账号_可信度高';
	const t_zfb_zhjl = 'OUTPUT.支付宝.账户记录_1576722573418';
	const t_xyr_zfbzcxx = 'INFO.嫌疑人_支付宝注册信息';
	const t_jjdjj_xdq = 't.今借到借据_新调取';
	const t_out = 'TEMP.暂存数据';


	// 异步队列,装入异步任务，防止任务结束前关闭数据链接
	const DL = [];

	// 工具函数
	const dropCollection = (collection)  => {
		DL.push(this.db.collection(collection).drop());
	}

	const saveDoc = (doc) => {
		DL.push(this.db.collection(t_out).insertOne(doc));
	}

	// 清空暂存表
	DL.push(dropCollection(t_out));

	return;

		// 可信度高的支付宝账户
		const jkr_zfb_array = await this.db.collection(t_jkr_zfb).find({ 
		}, {projection: { _id: 0, '账户可信度': 0}}).toArray();
		const map_jkr_zfb = array.keyMap(jkr_zfb_array, v => v['身份证号']);
		

		// 获取嫌疑人支付宝信息
		const xyr_zfb_array = await this.db.collection(t_xyr_zfbzcxx).find({ 
		}, {projection: { '证件号': 1, '用户Id': 1, _id: 0}}).toArray();
		const map_xyr_zfb = array.keyMap(xyr_zfb_array, v => v['证件号']);
		
		// 获取借款人支付宝账号
		const jjd_zfb_array = await this.db.collection(t_jkr_jjd).find({
			'支付宝账号': {$nin: [null, ""]}
		}, {projection: { '姓名': 1, ID: 1, '支付宝账号': 1, _id: 0}}).toArray();
		const map_jjd_zfb = array.keyMap(jjd_zfb_array, v => v['ID']);

		// 遍历今借到所有借条
		const cursor = await this.db.collection(t_jjdjj).find({}, {
			timeout: 3600000 * 5,
			maxTimeMS: 3600000
		});

		const total = await cursor.count();
		let counter = 0;
		doc = null;
		
		// 匹配，使用zfb账号验证
		while ((doc = await cursor.next()) !== null) {
			console.progressBar(counter++, total);
			const d_jkr_name = doc['借款人姓名'];
			const d_jkr_id   = doc['借款人身份证号'];
			const d_jkr_zfb   = map_jkr_zfb[doc['借款人身份证号']]
				? map_jkr_zfb[doc['借款人身份证号']]['支付宝账号']
				: null;
			const d_cjr_name = doc['出借人姓名'];
			const d_cjr_id   = doc['出借人身份证号'];
			const d_cjr_zfb   = map_jkr_zfb[doc['出借人身份证号']]
				? map_jkr_zfb[doc['出借人身份证号']]['支付宝账号'] 
				: null;
			const d_qjsj     = doc['借条生成时间'];
			const d_dqsj     = doc['应还时间'];
			const d_jtje     = doc['借条金额'];
			const d_yhje     = doc['应还金额'];

			// 如果借款人支付宝账号为null先略过
			if (null == d_jkr_zfb) continue;

			let now = null

			// 按照时间、金额查找支付宝交易记录
			// 验证到的支付宝ID实时存回信息库
			// 匹配借结果存放
			
			// 匹配放款
			const ppfk_cursor = this.db.collection(t_zfb_zhjl).find({
				// 借条生成审核
				// 放款时间在借条生成时间前后8小时内支付 
				'付款时间': {
					$gte: new Date(d_qjsj - 3600000 * 8), 
					$lte: new Date(d_qjsj + 3600000 * 8)
				}, 
				'金额（元）': {$gte: d_jtje * 0.6, $lte: d_jtje * 0.85},
				'收/支': "支出",
			}, {projection: { _id: 0 }});

			// 验证放款
			while((now = await ppfk_cursor.next()) !== null) {
				// 验证指标:
				// 1. 交易对方信息支付宝账户已识别
				const jydfxx = now['交易对方信息'];
				const jkr_zfb = String(jydfxx).replace(/\(.+\)/,'');

				if (
					jydfxx === jkr_zfb && jkr_zfb === d_jkr_zfb
				) {
					// 匹配后如何处理
					saveDoc(now);

				}
			} // 结束放款验证

			// 匹续期时配头息收入
			const ppTXSR_cursor = this.db.collection(t_zfb_zhjl).find({
				'付款时间': {
					// 头息支付在新借条生成前后2小时内支付 
					$gte: new Date(d_qjsj - 3600000 * 6), 
					$lte: new Date(d_qjsj + 3600000 * 6)},
				'金额（元）': {$gte: d_jtje * 0.1, $lte: d_jtje * 0.4},
				'收/支': "收入",
			}, {projection: { _id: 0 }});

			while((now = await ppTXSR_cursor.next()) !== null) {
				const jydfxx = now['交易对方信息'];
				const jkr_zfb = String(jydfxx).replace(/\(.+\)/,'');

				if (
					jydfxx === jkr_zfb &&
					d_jkr_zfb === jkr_zfb
				) {
					saveDoc(now);
				}

			} // 结束验证

			// 匹配本金收回
			const ppBJSH_cursor = this.db.collection(t_zfb_zhjl).find({
				// 本金收回在借条到期日前后一天,或延后几天
				'付款时间': {
					$gte: new Date(d_dqsj - 3600000 * 24), 
					$lte: new Date(d_dqsj + 3600000 * 24 * 3)}, 
				// 考虑分两次还款的情况
				'金额（元）': {$gte: d_jtje * 0.45, $lte: d_yhje}, 
				'收/支': "收入",
			}, {projection: { _id: 0 }});

			// 仅匹配一条时，优先匹配
			while((now = await ppBJSH_cursor.next()) !== null) {
				const jydfxx = now['交易对方信息'];
				const jkr_zfb = String(jydfxx).replace(/\(.+\)/,'');

				if (
					jkr_zfb === jydfxx &&
					d_jkr_zfb === jkr_zfb
				) {
					saveDoc(now);
				}
			} // 结束验证

		} // end of while

		return Promise.all(DL); // 防止有未执行完的异步操作未完成时结束数据链接
}

/**
 * 精确匹配
 */

function JJPP () {
}

function saveCSV(filename, value) {
    return fs.writeFileSync(filename, array(value).toCSV());
}
