UTF-8编码工具
======

UTF8 (UCS Transformation Format 8)

Each character is represented by one to four bytes.
UTF-8 is backward-compatible with ASCII,
and can represent any standard Unicode character.
 *
The first 128 UTF-8 characters precisely match the first 128 ASCII characters
(numbered 0-127), meaning that existing ASCII text is already valid UTF-8.
All other characters use two to four bytes.
 *
Each byte has some bits reserved for encoding purposes.
Since non-ASCII characters require more than one byte for storage, 
they run the risk of being corrupted 
if the bytes are separated and not recombined.
 *
## 字符编码对应表
 *
| Unicode        | UTF-8                               | Byte | 备注      |
| -------        | -----                               | ---- | ----      |
| 0000~007F      | 0XXXXXXX                            | 1    |           |
| 0080~07FF      | 110XXXXX 10XXXXXX                   | 2    |           |
| 0800~FFFF      | 1110XXXX 10XXXXXX 10XXXXXX          | 3    | 0~FFFF    |
| 1 0000~10 FFFF | 11110XXX 10XXXXXX 10XXXXXX 10XXXXXX | 4    | 0~10 FFFF |
