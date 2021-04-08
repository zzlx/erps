SSH
==========

生成ssh密钥
ssh-keygen -t rsa

[](https://wiki.centos.org/HowTos/Network/SecuringSSH)

## 1. Use Strong Passwords/Usernames

## 2. Disable Root Logins

## 3. Limit User Logins

## 4. Disable Protocol 1

## 5. Use a Non-Standard Port

## 6. Filter SSH at the Firewall

## 7. Use Public/Private Keys for Authentication

# SELinux配置
semanage port -a -t ssh_port_t -p tcp 2345
