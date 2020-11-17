/**
 * *****************************************************************************
 *
 * 控制台功能扩展
 *
 *
 * * 增加命令行格式化显示
 * * 整屏打印输出
 * * 进度条打印
 *
 * *****************************************************************************
 */

import global from './global.mjs';

const isNode = global.process && typeof global.process.cwd === 'function';
const isBrowser = global.window && typeof global.window === 'object';
const isWin = !isBrowser && global.process && global.process.platform === 'win32';

const MOVE_LEFT  = '\u001b[1000D';
const MOVE_UP    = '\u001b[1A';
const CLEAR_LINE = '\u001b[0K';
const CLEAR_PAGE = isWin ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';

export default new Proxy(console, {
	get: function (target, property, receiver) {
		if (property === 'monitor') return monitor;
		if (property === 'progressBar') receiver.progressBar = progressBar;
		if (property === 'clearLine') return () => process.stdout.write(CLEAR_LINE);

		return Reflect.get(target, property, receiver);
	}
});

/**
 * 打印
 */

function monitor () {
  // Dividing line
  const dl = new Array(process.stdout.columns).join('=');

  console.log(dl);
  console.log.apply(null, arguments);
  console.log('');
  console.log(dl);
}

/**
 * 进度条
 *
 * @param {number} percent
 * @param {number} length
 * @return {string} 
 */

function progressBar (counter, total, length = 100) {
	const blocks = {
		empty : '░',
		cell  : '▓',
		bold  : '█', 
	};

	let barString = '';

	const percent = Number(counter/total*100).toFixed();

  barString += Array(Number.parseInt(percent)).join(blocks.cell);
  barString += Array(Number.parseInt(length - percent)).join(blocks.empty);
	barString += `进度:[${counter}/${total}]${percent}%`;

	process.stdout.write(MOVE_LEFT + CLEAR_LINE + barString);
}
