#!/bin/bash
# Run script from "app" directory

sed "s|/path/to|$(pwd)|" savetexttofile.json > _savetexttofile.json

CHROME="$HOME/.config/google-chrome/NativeMessagingHosts"
EDGE="$HOME/.config/microsoft-edge-beta/NativeMessagingHosts"

for path in $CHROME $EDGE; do
  if [ -d $path ]; then
    cp "_savetexttofile.json" "$path/savetexttofile.json"
  fi
done
rm _savetexttofile.json
chmod +x savetexttofile.py