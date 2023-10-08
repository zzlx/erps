/**
 * *****************************************************************************
 * 
 * ReactDOM
 *
 * *****************************************************************************
 */

const ReactDOM = globalThis.ReactDOM ? globalThis.ReactDOM : await import('react-dom');

export default ReactDOM;
