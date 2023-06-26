Mac OSX
==========


# Q&A  

## iphone通过USB连接Mac后频繁掉线

sudo killall -STOP -c usbd

# 防火墙

#打开pfctl服务

```
$ sudo pfctl -E
```
#查看pfctl状态
```
$ sudo pfctl -s all
```
#开放端口
```
$ sudo echo "pass in proto tcp from any to any port 端口号" >> /etc/pf.conf
```
#重新加载配置文件
$ sudo pfctl -f /etc/pf.conf
#关闭pfctl服务
$ sudo pfctl -d

# 

sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist

sudo launchctl unload -w /System/Library/LaunchDaemons/org.apache.httpd.plist
