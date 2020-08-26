#!/usr/bin/env node

/**
 * *****************************************************************************
 *
 * 处理中行CTIS系统交易流水
 *
 * *****************************************************************************
 */

// internal modules
import cp from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

process.stdout.write('处理中行CTIS系统交易流水');

// 
