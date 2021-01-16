[The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
======

## 数据帧格式

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

FIN: 1bit

Indicates that this is the final fragment in a message,
The first fragment may also be the final fragment.
FIN为1表示这是消息的最后一部分,如果为0表示后续还有数据

RSV1,RSV2,RSV3: 1bit each

Opcode: 4bits

Defines the interpretation of the payload data. 
If an unknown opcode is received, the receiving endpoint Must fail.

Mask: 1bit

Defines whether the payload data is masked.

Socket 协议头

* Connection: Upgrade
* Upgrade: websocket
* Sec-Websocket-version: 13
* Sec-Websocket-key: 
服务端取到该值后与GUID拼接后计算sha1作为Sec-Websocket-Accept的值返回客户端
