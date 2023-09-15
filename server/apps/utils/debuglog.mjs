/**
 * *****************************************************************************
 *
 * debuglog: 打印调试信息
 *
 * @todos: 增加按模块调试
 *
 * *****************************************************************************
 */

const debugs = {};
let debugEnvRegex = null;

export function debuglog(set, cb) {
  // const debug = debuglogImpl(set);
  // return (...args) => debug(...args);

  let debug = (...args) => {
    debug = debuglogImpl(set);
    if (typeof cb === "function") cb(debug);
    debug(...args);
  };

  return debug;
}

function initializeDebugEnv(debugEnv) {
  if (debugEnv) {
    const debugImpl = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&")
      .replace(/\*/g, ".*") // 
      .replace(/,/g, "$|^")
      .toUpperCase();
    debugEnvRegex = new RegExp(`^${debugImpl}$`, "i");
  }
}

function debuglogImpl(setString) {

  const debugImpl = globalThis.process && globalThis.process.env.NODE_DEBUG 
    ? globalThis.process.env.NODE_DEBUG
    : globalThis.debug ? "debug:*" : ""; //

  if (debugEnvRegex == null) initializeDebugEnv(debugImpl);

  const set = setString.toUpperCase();

  if (debugs[set] === undefined) {
    if (debugEnvRegex && debugEnvRegex.test(set)) {
      debugs[set] = function debug () {
        const args = Array.prototype.slice.call(arguments); 

        if (typeof arguments[0] === "string") {
          args[0] = set + " " + args[0];
        } else {
          args.unshift(set + " ");
        }
        
        console.log.apply(null, args); // eslint-disable-line
      };
    } else {
      debugs[set] = () => { /* empty function  */ };
    }
  }

  return debugs[set]; // return the set function
}
