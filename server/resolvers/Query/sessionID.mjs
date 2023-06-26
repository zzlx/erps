/**
 * 获取
 *
 */

export default function sessionID (obj, args, ctx, info) {
  return ctx.app.server.sessionID || ''; 
}
