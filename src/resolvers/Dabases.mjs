export default {
  name: (obj, args, context, info) => {
    return obj.name
  },
  sizeOnDisk: obj => obj.sizeOnDisk,
  empty: obj => obj.empty,
}
