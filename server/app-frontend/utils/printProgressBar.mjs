/**
 * *****************************************************************************
 * 
 * 进度条
 *
 * @param {number} percent
 * @param {number} length
 * @return {string} 
 *
 * *****************************************************************************
 */

export function progressBar (counter, total, length = 100) {
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
