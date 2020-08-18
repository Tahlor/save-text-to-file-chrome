Save Text to File (Chrome)
==

Save Text to File saves snippets of text from a web page to a file on the local computer.

![](demo.gif)

The recommended setup is to install both:
* Browser extension, and
* Host application.

## Step 1. Installing the Browser Extension

Download and install from [Chrome Web Store](https://chrome.google.com/webstore/detail/save-text-to-file/mkepenkbhepjelljcfiooignmpfgochi).

## Step 2. Install host application

**Note:** If installing the host application, ensure the latest version of [Python](https://www.python.org/downloads/) is installed beforehand.

Download the `app/` directory, from [Github](https://github.com/bobbyrne01/save-text-to-file-chrome/tree/master/app). 

Save `app/` and its contents to a directory on your computer, example: `C:\savetexttofile\` or `/Users/Robert/savetexttofile/`.

Then follow the steps specific to your platform below ..

### Windows

Assuming you saved `app/` to `C:\savetexttofile\` on your computer.

Open a command prompt as Administrator (Start menu -> cmd -> Run as admin).

Change directory to where the saved `app/` contents are e.g:

```
cd C:\savetexttofile
```

Run the Windows installer:
```
install_host.bat
```

The host application should now be installed.

Restart Chrome, and check the browser extension's options.

Save Text to File's options page should indicate the host application has been successfully configured.

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
