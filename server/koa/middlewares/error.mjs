/**
 * *****************************************************************************
 *
 * Error middleware
 *
 * app-level errors
 *
 * *****************************************************************************
 */

export default () => {
  return async function errorMiddleware (ctx, next) { 
    try { 
      await next();
    } catch (error) {  
      return Promise.reject(error);
    } 
  }
}

