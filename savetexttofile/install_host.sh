#!/bin/bash
# Run script from "app" directory

cp . ../savetexttofile -r
destination=$(readlink -f ../savetexttofile)

sed "s|/path/to|$destination|" savetexttofile.json > _savetexttofile.json

CHROME="$HOME/.config/google-chrome/NativeMessagingHosts"
EDGE="$HOME/.config/microsoft-edge-beta/NativeMessagingHosts"

for path in $CHROME $EDGE; do
  if [ -d $path ]; then
    cp "_savetexttofile.json" "$path/savetexttofile.json"
  fi
done
rm _savetexttofile.json

chmod +x "$destination/savetexttofile.py"