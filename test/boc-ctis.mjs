#!/usr/bin/env node

/**
 * *****************************************************************************
 *
 * 用于处理转换中国银行CTIS交易流水
 *
 * *****************************************************************************
 */

// internal modules
import cp from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import TextParser from '../src/utils/TextParser.mjs';
import toCSV from '../src/utils/toCSV.mjs';

const $1 = process.argv.slice(2);
const newFile = path.join(process.cwd(), Date.now() + '_' + $1);

if ($1.length === 0) {
  process.stdout.write('请提供要处理的CTIS系统交易流水文件路径参数');
  process.exit();
}

// step1: 读入交易流水
process.stdout.write('开始处理中行CTIS系统交易流水...\n');

const ctis = fs.readFileSync($1[0]);
const tp = new TextParser(ctis.toString());
const result = [];
let i = 0;

// 遍历
let it = tp.values[Symbol.iterator]();
let v = it.next()

while (!v.done) {
  const obj = {};
  const keys = v.value;

  if (keys[0] === '') {
    v = it.next(); 
    continue;
  }

  v = it.next();
  if (v.done) break;
  const values = v.value;

  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i] || '';
  }


  v = it.next();

  const keys_2 = v.value;
  v = it.next();
  const values_2 = v.value;

  for (let i = 0; i < keys_2.length; i++) {
    obj[keys_2[i]] = values_2[i] || '';
  }

  result.push(obj);
  v = it.next();

}

const csv = toCSV(result);

fs.writeFileSync(newFile, csv, 'utf8');
