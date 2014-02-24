В качестве сервера используется debian wheezy.
Версия PHP 5.4.4-14+deb7u7 (необходимо php >= 5.3).
В качестве фреймворка php используется silex.
Приложение использует curl в качестве api клиента.

Установка
-----------------
1. Дополнительные библиотеки устанавливаются используя Composer.
Выполнить из консоли находясь в корне приложения:
$ curl -sS https://getcomposer.org/installer | php
$ php composer.phar install

Приблизительный лог установки:
Loading composer repositories with package information
Installing dependencies (including require-dev)
  - Installing kriswallsmith/buzz (dev-master 805272a)
    Cloning 805272acb603161f0bc92380bbd801d5ffabf89d

  - Installing symfony/routing (v2.4.2)
    Downloading: 100%
    ...


2. Для корректной работы index файл должен быть public/index.html,
остальные запросы за исключением статики необходимо отправлять на index.php
Пример конфигурации nginx:
   1 server {
   2     listen          80;
   3     server_name     rmr.dev;
   4
   5     index           index.html;
   6     charset         utf-8;
   7     access_log      off;
   8     error_log       /var/log/nginx/rmr.dev.error.log;
   9
  10     set $root_path  '/var/www/rmr.dev/public';
  11
  12     root            $root_path;
  13
  14     location / {
  15         try_files $uri $uri/ /index.php;
  16     }
  17
  18     location ~ \.php {
  19         try_files                           $uri =404;
  20         include                             fastcgi_params;
  21
  22         fastcgi_index                       index.php;
  23         fastcgi_pass                        127.0.0.1:9001;
  24         fastcgi_split_path_info             ^(.+\.php)(/.+)$;
  25         fastcgi_param PATH_INFO             $fastcgi_path_info;
  26         fastcgi_param PATH_TRANSLATED       $root_path$fastcgi_path_info;
  27         fastcgi_param SCRIPT_FILENAME       $root_path$fastcgi_script_name;
  28         fastcgi_param DOCUMENT_ROOT         $root_path;
  29     }
  30 }


Использование
-----------------
В тз говрится, что для url http://digitaled.ru/freeapi/public/api/list/
существует переменная app_id, но на деле запрос
http://digitaled.ru/freeapi/public/api/list/?app_id=52 не дает положительного ответа.
Положительный результат мы получаем при запоросе url вида
http://digitaled.ru/freeapi/public/api/list/app_id/52 в таком случае app_id является сегментом
url, а не его параметром. То есть это надо явно указывать в строке url.

Напоминание
-----------------
Редиректы не будут посещаться автоматически, если включена open_basedir

