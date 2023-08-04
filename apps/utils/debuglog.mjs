/**
 * *****************************************************************************
 *
 * debuglog
 *
 * *****************************************************************************
 */

const debugs = {};
let debugEnvRegex = null;

export function debuglog(set, cb) {
  let debug = (...args) => {

    // Only invokes debuglogImpl() when the debug function is
    // called for the first time.
    debug = debuglogImpl(set);

    if (typeof cb === "function") cb(debug);

    debug(...args);
  };

  return (...args) => debug(...args);
}

function initializeDebugEnv(debugEnv) {
  if (debugEnv) {
    debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&")
      .replace(/\*/g, ".*")
      .replace(/,/g, "$|^")
      .toUpperCase();
    debugEnvRegex = new RegExp(`^${debugEnv}$`, "i");
  }
}

function debuglogImpl(set) {
  const isDev = globalThis.env === "development" ? true : false;

  const debugImpl = globalThis.process && globalThis.process.env.NODE_DEBUG 
    ? globalThis.process.env.NODE_DEBUG
    : "debug:*";

  if (debugEnvRegex == null) initializeDebugEnv(debugImpl);

  set = set.toUpperCase();

  if (debugs[set] === undefined) {

    if (debugEnvRegex && debugEnvRegex.test(set) && isDev) {
      debugs[set] = function debug () {
        console.log("%s:", set, ...arguments);
      };
    } else {
      debugs[set] = () => {};
    }

  }

  return debugs[set];
}
