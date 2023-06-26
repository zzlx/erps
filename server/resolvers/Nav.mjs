export default {
  _id: obj => obj._id.toString(),
  href: obj => obj.href,
  title: obj => obj.title,
  item: obj => obj.item,
  src: obj => obj.src,
  parendId: obj => obj.parentId,
  desc: obj => obj.desc,
}
