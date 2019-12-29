/**
 *
 *
 * 从map中找到值最大的一个,并返回key
 *
 */
export default function getMaxOne(map) {
	let maxKey = null;
	let maxValue = 0;

	for (let key of map.keys()) {
		const value = map.get(key);
		if (value > maxValue) {
			maxKey = key;
			maxValue = value;
		}
	}

	return maxKey;
}
