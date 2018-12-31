#!/bin/bash
foldername=$(date +'%Y%m%d%H%M%S')
mkdir -p /var/www/backup/"$foldername"
mv /var/www/html/* /var/www/backup/"$foldername"
