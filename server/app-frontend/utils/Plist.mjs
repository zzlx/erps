/**
 * *****************************************************************************
 * 
 * Plist Object
 *
 * 用于生成plist配置文件内容
 *
 * *****************************************************************************
 */

import { isBoolean } from './is/isBoolean.mjs';

export class Plist {
  constructor (props = {}) {
    this.version = props.version || '1.0';
    this.type = props.type;
    this.settings = Object.assign({}, {
      Label: props.Label || 'unamed.test.plist',
      Disabled: props.Disabled,
      UserName: props.UserName,
      GroupName: props.GroupName,
      Program: props.Program,
      ProgramArguments: props.ProgramArguments,
      RootDirectory: props.RootDirectory,
      WorkingDirectory: props.WorkingDirectory,
      StandardErrorPath: props.StandardErrorPath,
      StandardOutPath: props.StandardOutPath,
      StartCalendarInterval: props.StartCalendarInterval,
      StartInterval: props.StartInterval,
      LimitLoadToSessionType: props.LimitLoadToSessionType,
      RunAtLoad: props.RunAtLoad,
      KeepAlive: props.KeepAlive,
    });
  }

  toString () {
    return  `<?xml version="${this.version}" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="${this.version}">
${dict(this.settings)}
</plist>`;
  }
}

function dict (obj, indents = 0) {
  const indent = Array(indents).join(' ');
  let retval = `${indent}<dict>\n`;

  for (const k of Object.keys(obj)) {
    const indent = Array(indents+2).join(' ');
    const v = obj[k];

    if (typeof v === 'string' || isBoolean(v)) {
      retval += `${indent}<key>${k}</key>\n`;
      if (v === false) retval += `${indent}<false/>\n`;
      if (v === true)  retval += `${indent}<true/>\n`;
      if (typeof v === 'string') retval += `${indent}<string>${v}</string>\n`;
    } else if (Array.isArray(v) && v.length > 0) {
      retval += `${indent}<key>${k}</key>\n`;
      retval += `${indent}<array>\n`;
      const indentP = Array(indents+4).join(' ');
      for (const i of v) {
        retval += `${indentP}<string>${i}</string>\n`;
      }
      retval += `${indent}</array>\n`;
    } else if (v !== null && typeof v === 'object') {
      retval += dict(v, indents+2) + '\n';
    }
  }

  retval += `${indent}</dict>`;

  return retval;
}
