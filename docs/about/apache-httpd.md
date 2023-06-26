

# Enforce https
重定向访问协议

RewriteCond %{HTTPS} !=on
RewriteCond %{SERVER_PORT} 80 [OR]
RewriteCond %{SERVER_PORT} !^443$
RewriteRule ^.*$ https://%{SERVER_NAME}%{REQUEST_URI} [L,R=301]
RewriteRule ^/?(.*)$ https://%{SERVER_NAME}/$1 [L,R=301]

