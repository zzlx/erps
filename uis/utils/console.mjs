/**
 * *****************************************************************************
 *
 * console对象功能扩展
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

export default new Proxy(console, {
	get: function (target, property, receiver) {

    if (property === 'CLEAR_PAGE') return isWin ?  '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';
    if (property === 'CLEAR_LINE') return '\x1B[0K';
    if (property === 'MOVE_LEFT') return '\x1B[1000D';
    if (property === 'MOVE_UP') return '\x1B[1A';
    if (property === 'BLOCK_EMPTY') return '░';
    if (property === 'BLOCK_CELL') return '▓';

    if (isNode) {
      if (property === 'progressBar') return progressBar;
      if (property === 'divideLine') return divideLine;
    }

		return Reflect.get(target, property, receiver);
	}
});

/**
 * 打印分隔线
 */

function divideLine (symbol = '=') {
  return new Array(process.stdout.columns).join(symbol);
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
