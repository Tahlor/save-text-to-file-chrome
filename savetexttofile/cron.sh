#!/bin/bash

source="/media/BYUCS/public_html/articles"
destination="/media/BYUCS/public_html/articles/archive"

mkdir $destination -p

sshfs tarch@schizo.cs.byu.edu:/users/grads/tarch /media/BYUCS/

find $source -maxdepth 1 -mtime +14 -type f -exec mv "{}" $destination \;
