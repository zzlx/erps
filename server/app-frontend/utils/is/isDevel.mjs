/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

export const isDevel = () => 
  globalThis.process && globalThis.process.env.NODE_ENV === 'development'
    ? true
    : globalThis.env && globalThis.env === 'development'
      ? true
      : false;
