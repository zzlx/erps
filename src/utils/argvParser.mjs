/**
 * *****************************************************************************
 *
 * 参数解析器
 *
 * 解析获取到的命令行参数列表，返回参数对象
 *
 * @todo: 添加对无效参数的处理
 *
 * @params {array|string} argvs
 * @return {object} state
 * @api public
 *
 * @file: argvParser.mjs
 * *****************************************************************************
 */

export default function argvParser (argvs, validArgvs = []) {

  // 如果提供的参数列表为字符,则先转为数组后再解析
  if ('string' === typeof argvs) argvs = argvs.split(/\s+/);

  const params = {};
	const it = argvs[Symbol.iterator]();

	let argv = null;
	let i = -1;

	while ((argv = it.next().value) != null) {
		i++; 

    // @todo: 是否有必要改正则匹配逻辑为字串匹配? 对性能影响极小,暂时不作修改.
    const matcher = argv => /^(?:--(\w+)(?:=(.+))?)|(?:-(\w+))/g.exec(argv);

		const match = matcher(argv);
		if (null == match) continue; // bypass if no match

    const key = match[1];
    const value = match[2];
		const commands = match[3];
		
    if (key) {
      params[key] = value ? value : true;
      if (true === params[key] && argvs[i+1] && null == matcher(argvs[i+1])) {
        params[key] = argvs[i+1];
      }
    }

		if (commands) {
      // 单参数情况时, eg. -o /home/test.txt
			if (commands.length === 1 && argvs[i+1] && null == matcher(argvs[i+1])) {
				params[commands] = argvs[i+1];
			} else {
        for (let v of commands ) params[v] = true; // 多参数情况时，eg. -abc
      }
		}
  }

  return params;
}
