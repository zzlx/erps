/**
 * *****************************************************************************
 *
 * 读取并解析JSON文件
 *
 * *****************************************************************************
 */

import fs from 'fs';

export const readJSON = jsonFile => JSON.parse(fs.readFileSync(jsonFile));
