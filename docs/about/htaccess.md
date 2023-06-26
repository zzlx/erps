.htaccess
=========

如果可以修改httpd主配置文件，应该避免使用.htaccess,使用.htaccess文件会slows-down httpd服务器.
任何可以在htaccess中设置的命令，均可以在<Directory>中配置,且比htaccess更有效率.

# Apache Httpd配置项

```
Options -MultiViews

<IfModule mod_rewrite.c> 
    RewriteEngine On 
    RewriteBase /

    #RewriteCond %{REQUEST_FILENAME}.br -s
    #AddEncoding x-gzip .gz
    #RewriteRule ^(.+) $1.br [L]

 
</IfModule>
```
