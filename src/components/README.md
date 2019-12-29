组件库
==========

展示型组件(Presentational Components

# 约定

1. 模块统一输出为函数

统一使用(export default function)进行模块输出，
若模块以类书写时，使用函数包裹实例化后再输出,例如

export default function () {
  return new ClassName().render();
}
