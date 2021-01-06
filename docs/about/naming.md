命名规范
=====

# 命名方法

## 匈牙利命名法：

rray)
 b              布尔值 (Boolean)
  by             字节 (Byte)
   c              有符号字符 (Char)
    cb             无符号字符 (Char Byte，没有多少人用)
     cr             颜色参考值 (ColorRef)
      cx,cy          坐标差（长度 ShortInt）
       dw             Double Word
        fn             函数
         h              Handle（句柄）
          i              整型
           l              长整型 (Long Int)
            lp             Long Pointer
             m_             类的成员
              n              短整型 (Short Int)
               np             Near Pointer
                p              Pointer
                 s              字符串型
                  sz             以null做结尾的字符串型 (String with Zero End)
                   w              Word

## 驼峰命名法

当变量名或函式名是由一个或多个单词连结在一起，而构成的唯一识别字时，第一个单词以小写字母开始；第二个单词的首字母大写或每一个单词的首字母都采用大写字母
小驼峰法:除第一个单词之外，其他单词首字母大写
大驼峰法:相比小驼峰法，大驼峰法把第一个单词的首字母也大写了。常用于类名，函数名，属性，命名空间。 

## 帕斯卡命名法

与大驼峰命名法一致，常用于类名，函数名，属性，命名空间。
