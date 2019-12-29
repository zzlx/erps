/**
 *
 */

export default { 
  subscribe: () => pubsub.asyncIterator('commentAdded') 
}
