/**
 * *****************************************************************************
 *
 * debuglog
 *
 * *****************************************************************************
 */

// debuglogImpl depends on process.pid and process.env.NODE_DEBUG,
// so it needs to be called lazily in top scopes of internal modules
// that may be loaded before these run time states are allowed to be accessed.

export function debuglog(set, cb) {
  let debug = (...args) => {

    // Only invokes debuglogImpl() when the debug function is
    // called for the first time.
    debug = debuglogImpl(set);

    if (typeof cb === 'function') cb(debug);

    debug(...args);
  };

  return (...args) => debug(...args);
}

// `debugs` is deliberately initialized to undefined so any call to
// debuglog() before initializeDebugEnv() is called will throw.

const debugs = {};

let debugEnvRegex = null;

// `debugEnv` is initial value of process.env.NODE_DEBUG
function initializeDebugEnv(debugEnv) {
  if (debugEnv) {
    debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/,/g, '$|^')
      .toUpperCase();
    debugEnvRegex = new RegExp(`^${debugEnv}$`, 'i');
  }
}

// Emits warning when user sets
// NODE_DEBUG=http or NODE_DEBUG=http2.
function emitWarningIfNeeded(set) {

  if ('HTTP' === set || 'HTTP2' === set) {
    process.emitWarning(
      'Setting the NODE_DEBUG environment variable ' +
      'to \'' + set.toLowerCase() + '\' can expose sensitive ' +
      'data (such as passwords, tokens and authentication headers) ' +
      'in the resulting log.');
  }
}

function debuglogImpl(set) {
  const isDev = globalThis.env === 'development' ? true : false;

  const debugImpl = globalThis.process && globalThis.process.env.NODE_DEBUG 
    ? globalThis.process.env.NODE_DEBUG
    : 'debug:*';

  if (debugEnvRegex == null) initializeDebugEnv(debugImpl);

  set = set.toUpperCase();

  if (debugs[set] === undefined) {

    if (debugEnvRegex && debugEnvRegex.test(set) && isDev) {
      const pid = globalThis.process && globalThis.process.pid 
        ? globalThis.process.pid 
        : '';

      emitWarningIfNeeded(set);

      debugs[set] = function debug(...args) {
        //const colors = process.stderr.hasColors && process.stderr.hasColors();
        //const msg = util.formatWithOptions({ colors }, ...args);
        //const coloredPID = util.inspect(pid, { colors });
        //process.stderr.write(util.format('%s %s: %s\n', set, coloredPID, msg));
        console.log('%s %s:', set, pid, ...args);
      };
    } else {
      debugs[set] = () => {};
    }

  }

  return debugs[set];
}
