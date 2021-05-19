JSON WEB TOKEN
==============

JSON Web Tokens are an open, industry standard 
[RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.txt)
method for representing claims securely between two parties.
 *
# 格式构成
 *
```
XXX.YYY.ZZZ
```
 *
JWT是由三段信息构成的，将这三段信息文本用.链接一起就构成了Jwt字符串.
第一部分我们称它为头部（header),
第二部分我们称其为载荷（payload, 类似于飞机上承载的物品)，
第三部分是签证（signature).
 *
## header
 *
jwt的头部承载两部分信息：
 *
* 声明类型，这里是jwt
* 声明加密的算法,通常直接使用 HMAC SHA256
 *
```json
{
  'typ': 'JWT',
  'alg': 'HS256'
}
```
 *
对头部进行Base64加密

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
```
 *
## payload
 *
载荷就是存放有效信息的地方。这个名字像是特指飞机上承载的货品，这些有效信息包含三个部分
 *
* 标准中注册的声明
* 公共的声明
* 私有的声明
 *
 *
标准中注册的声明 (建议但不强制使用) ：
 *
* iss: jwt签发者
* sub: jwt所面向的用户
* aud: 接收jwt的一方
* exp: jwt的过期时间，这个过期时间必须要大于签发时间
* nbf: 定义在什么时间之前，该jwt都是不可用的.
* iat: jwt的签发时间
* jti: jwt的唯一身份标识，主要用来作为一次性token,从而回避重放攻击。
 *
公共的声明 ：
 *
公共的声明可以添加任何的信息，一般添加用户的相关信息或其他业务需要的必要信息.
但不建议添加敏感信息，因为该部分在客户端可解密.
 *
私有的声明 ：
 *
私有声明是提供者和消费者所共同定义的声明，
一般不建议存放敏感信息，因为base64是对称解密的，意味着该部分信息可以归类为明文信息。
 *
定义一个payload:
 *
```
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
```
 *
然后将其进行base64加密，得到Jwt的第二部分。
 *
```
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9
```
 *
## signature
 *
jwt的第三部分是一个签证信息，这个签证信息由三部分组成：
 *
* header (base64后的)
* payload (base64后的)
* secret
 *
这个部分需要base64加密后的header和base64加密后的payload使用.连接组成的字符串，
然后通过header中声明的加密方式进行加盐secret组合加密，然后就构成了jwt的第三部分。
 *
```javascript
var encodedString = base64UrlEncode(header) + '.' + base64UrlEncode(payload);
 *
// TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
var signature = HMACSHA256(encodedString, 'secret'); 
```
 *
将这三部分用.连接成一个完整的字符串,构成了最终的jwt:
 *
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

> ##### 注意：
> secret是保存在服务器端的，jwt的签发生成也是在服务器端的，
> secret就是用来进行jwt的签发和jwt的验证，
> 所以，它就是你服务端的私钥，在任何场景都不应该流露出去。
> 一旦客户端得知这个secret, 那就意味着客户端是可以自我签发jwt了。
 *
 *
# 如何应用

一般是在请求头里加入Authorization，并加上Bearer标注：
```
fetch('api/user/1', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```
服务端会验证token，如果验证通过就会返回相应的资源。

请求流程:
1. Browser: POST /users/login username and password
2. Server: create JWT with a secret and return jwt to browser 
3. Browser: Sends the JWT on the Authorization Header
4. Server: check JWT signature, get user information from the jwt
and Sends response to the client.

# 优点

因为json的通用性，所以JWT是可以进行跨语言支持的，
因为有了payload部分，所以JWT可以在自身存储一些其他业务逻辑所必要的非敏感信息。
便于传输，jwt的构成非常简单，字节占用很小，所以它是非常便于传输的。
它不需要在服务端保存会话信息, 所以它易于应用的扩展
 *
# 安全相关

不应该在jwt的payload部分存放敏感信息，因为该部分是客户端可解密的部分。
保护好secret私钥，该私钥非常重要。
使用https协议
