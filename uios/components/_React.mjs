/**
 * *****************************************************************************
 * 
 * React module support
 *
 * *****************************************************************************
 */

const React = globalThis.React;
if (React == null) throw new Error('React module is not available!');
export const Context = React.createContext(null);
export default React;
