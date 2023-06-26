SSL
==========

openssl req -new -x509 -days 365 -nodes -text -out server.crt \ -keyout server.key -subj "/CN=dbhost.yourdomain.com"
