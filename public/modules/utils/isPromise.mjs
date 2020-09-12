/**
 * *****************************************************************************
 *
 * Returns true if the value acts like a Promise, 
 * i.e. has a "then" function, otherwise returns false.
 *
 * *****************************************************************************
 */

export default value => Boolean(value && typeof value.then === 'function');
