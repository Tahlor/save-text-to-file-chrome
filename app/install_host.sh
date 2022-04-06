#!/bin/bash
# Run script from "app" directory

# Enter destination; assume current directory otherwise
destination="$HOME/bashrc/ext/savetexttofile" # ../savetexttofile
cp . $destination -r
destination=$(readlink -f $destination)

sed "s|/path/to|$destination|" savetexttofile.json > _savetexttofile.json

CHROME="$HOME/.config/google-chrome/NativeMessagingHosts"
EDGE="$HOME/.config/microsoft-edge-beta/NativeMessagingHosts"
CHROMIUM="$HOME/.config/chromium/NativeMessagingHosts"

for path in $CHROME $EDGE $CHROMIUM; do
  if [ -d $path ]; then
    cp "_savetexttofile.json" "$path/savetexttofile.json"
  fi
done
rm _savetexttofile.json

chmod +x "$destination/savetexttofile.py"

echo "FILE: $path/savetexttofile.json"
echo "CONTENTS: " && cat "$path/savetexttofile.json"