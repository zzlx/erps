/**
 * *****************************************************************************
 *
 * Argv Parser
 * ===========
 *
 * parser arguments and value, return param map.
 *
 * @params {array|string} argvs
 * @return {object} state
 * @api public
 * *****************************************************************************
 */

export function argvParser (argvs) {
  if ('string' === typeof argvs) argvs = argvStr.split(/\s+/);

  const params = new Map();
	const it = argvs[Symbol.iterator]();

	let argv = null;
	let i = -1;

	while ((argv = it.next().value) != null) {
		i++; 
    // @todo: 是否有必要改正则匹配逻辑为字串匹配? 对性能影响极小,暂时不作修改.
    const matcher = argv => /^(?:--(\w+)(?:=(.+))?)|(?:-(\w+))|(.+)/g.exec(argv);

		const match = matcher(argv);
		if (null == match) continue; // bypass if no match

    const key = match[1];
    const value = match[2];
		const commands = match[3];
    const command = match[4];
		
    if (key) {
      params.set(key, value == null ? true : value);
      
      if (params.get(key) === true && argvs[i+1] && null == matcher(argvs[i+1])) {
        params.set(key, argvs[i+1]);
      }
    }

		if (commands) {
      // 单参数情况时, eg. -o /home/test.txt
			if (commands.length === 1 && argvs[i+1] && null == matcher(argvs[i+1])) {
				params.set(commands, argvs[i+1]);
			} else {
        for (let v of commands ) params.set(v, true); // multi params, eg. -abc
      }
		}

    if (command) params.set(command, true);
  }

  return params;
}
