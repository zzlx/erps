

export function setMap (map, key_1, key_2, qz) {
	qz = qz ? qz : 1;
	if (null == map.get(key_1)) {
		return map.set(key_1, new Map().set(key_2, qz));
	}

	if (null == map.get(key_1).get(key_2)) {
		map.get(key_1).set(key_2, qz);
	}

	map.get(key_1).set(
		key_2,
		map.get(key_1).get(key_2) + qz
	);
}
