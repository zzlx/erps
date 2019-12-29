/**
 * 参数解析器
 *
 * 接收命令列表数组,解析后返回参数对象
 *
 * @params {array} argvs
 * @return {object} state
 */

export default function argvParser (argvs) {
  const params = {};

	const it = argvs[Symbol.iterator]();
	let argv = null;
	let i = -1;

	while ((argv = it.next().value) != null) {
		i++; 
    const matcher = argv => /^(?:--(\w+)(?:=(.+))?)|(?:-(\w+))/g.exec(argv);
		const match = matcher(argv);
		if (null == match) continue; // bypass if no match

    const key = match[1];
    const value = match[2];
		const commands = match[3];
		
    if (key) params[key] = value ? value : true;

		if (commands) {
			for (let v of commands ) params[v] = true;

			if (commands.length === 1 && null == matcher(argvs[i+1])) {
				params[commands] = argvs[i+1];
			}
		}
  }

  return params;
}
