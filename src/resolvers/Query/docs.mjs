/**
 *
 *
 *
 *
 *
 *
 *
 */
import fs from 'fs';
import path from 'path';

export default (root, args, context, info) => {
  const file = args && args.fileName 
    ? args.fileName.replace(/(.html)$/, '.md')
    : 'README.md';

  const filePath = path.join(process.env.ROOT, 'doc', file);

  if (fs.existsSync(filePath)) return fs.promises.readFile(filePath, 'utf8');
  else return '文件不存在';
}
