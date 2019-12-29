export default { 
  comments: async ({_id}) => { 
    return (await Comments.find({postId: _id}).toArray()).map(prepare) 
  }
}
