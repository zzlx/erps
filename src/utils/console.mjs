/**
 * 控制台工具
 *
 */

const MOVE_LEFT  = '\u001b[1000D';
const MOVE_UP    = '\u001b[1A';
const CLEAR_LINE = '\u001b[0K';
const CLEAR_PAGE = process.platform === 'win32' 
  ? '\x1B[2J\x1B[0f' 
  : '\x1B[2J\x1B[3J\x1B[H';

export default new Proxy(console, {
	get: function (target, prop, receiver) {
		if (prop === 'print') {
      return (str) => process.stdout.write(MOVE_LEFT + CLEAR_LINE+String(str));
		}

		if (prop === 'progressBar') {
			receiver.progressBar = progressBar;
		}

		if (prop === 'clear') {
			return () => process.stdout.write(CLEAR_PAGE);
		}

		if (prop === 'debug') {
			return console.log;
		}

		return prop in target ? target[prop] : undefined;
	},

});

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

	const percent = Number(counter/total*100).toFixed();
	let barString = '';

	for (let i = 0; i < length; i++) {
		if (i < percent) barString += blocks.cell;
		else barString += blocks.empty;
	}

	barString += '进度:' 
		+ '['
		+ String(counter) 
		+ '/'
		+ String(total) 
		+ ']'
		+ String(percent) + "%";

	process.stdout.write(MOVE_LEFT + CLEAR_LINE);
	process.stdout.write(barString);
}
