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
      if (ctx.app.env === 'development') console.error(error);
      ctx.state.errors.push(error.message); // store error
      Promise.reject(error); // reject error
    } 
  }
}

