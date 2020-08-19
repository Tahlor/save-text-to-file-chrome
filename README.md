Save Text to File (Chrome)
==

Save Text to File saves snippets of text from a web page to a file on the local computer.

![video demo of the extension](demo.gif)


## Installation

The recommended setup is to install both the:
1. [Browser extension](https://chrome.google.com/webstore/detail/save-text-to-file/mkepenkbhepjelljcfiooignmpfgochi), and
2. Host application

**Note:** If installing the host application, ensure the latest version of [Python](https://www.python.org/downloads/) is installed beforehand.

Next, download the `app/` directory, from [Github](https://github.com/bobbyrne01/save-text-to-file-chrome/tree/master/app). 

Save `app/` and its contents to a directory on your computer, example: `C:\savetexttofile\` or `/Users/Robert/savetexttofile/`.

Then follow the steps specific to your platform below ..

### Windows

Assuming you saved `app/` to `C:\savetexttofile\` on your computer.

* Navigate to `C:\savetexttofile\`
* Right click on `install_host.bat`
* Select `Run as administrator`, and confirm any prompt.

The host application should now be installed.


### Mac

Modify `savetexttofile.json`, changing the `path` value to the location used previously:
```
"path": "/path/to/savetexttofile.py"
```
->
```
"path": "/Users/Robert/savetexttofile/savetexttofile.py"
```
Then copy the manifest to this location under the user's home directory:
```
~/.config/google-chrome/NativeMessagingHosts/savetexttofile.json
```

Restart Chrome, and check the browser extension's options.

Save Text to File's options page should indicate the host application has been successfully configured.


### Linux

Modify `savetexttofile.json`, changing the `path` value to the location used previously:
```
"path": "/path/to/savetexttofile.py"
```
->
```
"path": "/home/Robert/savetexttofile/savetexttofile.py"
```
Then copy the manifest to these locations under the user's home directory:
```
~/.mozilla/native-messaging-hosts/savetexttofile.json
~/.mozilla/managed-storage/savetexttofile.json
~/.mozilla/pkcs11-modules/savetexttofile.json
```

Restart Chrome, and check the browser extension's options.

Save Text to File's options page should indicate the host application has been successfully configured.