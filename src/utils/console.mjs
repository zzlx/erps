/**
 * 控制台工具
 *
 * @file console.mjs
 */

/*****************************************************************************/
import global from 'global';

const isBackend = Boolean(global && global.process);
const isWin = isBackend && process.platform === 'win32';

const MOVE_LEFT  = '\u001b[1000D';
const MOVE_UP    = '\u001b[1A';
const CLEAR_LINE = '\u001b[0K';
const CLEAR_PAGE = isWin ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';

export default new Proxy(console, {
	get: function (target, property, receiver) {
		if (property === 'print') {
      return (str) => process.stdout.write(MOVE_LEFT + CLEAR_LINE+String(str));
		}

		if (property === 'progressBar') receiver.progressBar = progressBar;
		if (property === 'debug') receiver.debug = debug;
		if (property === 'clear') {
			return () => process.stdout.write(CLEAR_PAGE);
		}

		return Reflect.get(target, property, receiver);
	}
});

/**
 * debug
 */

function debug (...args) {
  console.log(args);
}

/**
 *
 */

function print(string) {
  if (isBackend) return process.stdout.write(String(string));
  console.log(string);
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

	print(MOVE_LEFT + CLEAR_LINE + barString);
}
