/**
 * *****************************************************************************
 *
 * Show version infomations
 *
 * *****************************************************************************
 */

import { appinfo } from "./settings/index.mjs";

export const version = () => process.stdout.write(
`ERPs Version: ${appinfo.version}
Current Node.js Version: ${process.version}
`);
