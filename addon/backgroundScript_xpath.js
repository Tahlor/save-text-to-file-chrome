'use strict';
/*******************************************************************************
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

const HOST_APPLICATION_NAME = 'savetexttofile';
const TEST_CONNECTIVITY_ACTION = 'TEST_CONNECTIVITY';
const SAVE_TEXT_ACTION = 'SAVE';
const MENU_ITEM_ID = 'save-text-to-file-menu-item';
const NOTIFICATION_ID = 'save-text-to-file-notification';
const EXTENSION_TITLE = 'Save Text to File';
const DEFAULT_FILE_NAME_PREFIX = 'save-text-to-file--';
const DDMMYYYY = '1';
const MMDDYYYY = '2';
const YYYYMMDD = '3';
const YYYYDDMM = '4';
const NONE = '5';
const DATE_CUSTOM_TITLE = '0';
const DATE_TITLE_CUSTOM = '1';
const CUSTOM_DATE_TITLE = '2';
const CUSTOM_TITLE_DATE = '3';
const TITLE_CUSTOM_DATE = '4';
const TITLE_DATE_CUSTOM = '5';

var BKG = chrome.extension.getBackgroundPage();
var fileNamePrefix;
var dateFormat;
var fileNameComponentOrder;
var prefixPageTitleInFileName;
var fileNameComponentSeparator = '-';
var pageTitleInFile;
var urlInFile;
var templateText;
var positionOfTemplateText;
var directory;
var directorySelectionDialog;
var notifications;
var conflictAction;
var testConnectivityPayload = {
  action: TEST_CONNECTIVITY_ACTION
};

function saveTextViaApp(directory, sanitizedFileName, fileContents) {
  var payload = {
    action: SAVE_TEXT_ACTION,
    filename: sanitizedFileName,
    directory: directory,
    fileContent: fileContents,
    conflictAction: conflictAction
  };

  chrome.runtime.sendNativeMessage(
    HOST_APPLICATION_NAME,
    payload, function(response) {
      if (chrome.runtime.lastError) {
        notify('Error occured communicating with host application. Check browser console.');
        console.log(chrome.runtime.lastError);
      } else {
        var json = JSON.parse(response);
        if (json.status === 'Success') {
            notify('Text saved.');
        } else {
          notify('Error occured saving text via host application. Check browser console.');
          console.log("SaveTextToFile: Native application response: " + response);
        }
      }
  });
}

function get_xpath_OLD(next_function) {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    function xpath_from_url(url) {
      if (url.includes("wsj")) {
        BKG.console.log("WSJ");
        return WSJ_XPATH;
      } else if (url.includes("nationalreview")) {
        BKG.console.log("NR");
        return NR_XPATH;
      } else {
        BKG.console.log("No XPATH found for URL");
      }
    }
    let url3 = tabs[0].url;
    return next_function(xpath_from_url(url3));
  });
}

function get_xpath(next_function) {
    // This will be executed as a script, as though from console
    // This is a stupid way of doing this
    const NR_TITLE = "//h1[@class=\'article-header__title\']/text()";

    // The //text() is needed for hyperlinks, but it might also grab ads
    const NR_BODY = "//div[@class=\'article-header__subtitle\']/text() | //div[contains(@class,\'content\')]/div[contains(@class,\'content\')]/*[self::p or self::blockquote]//text()"
    // *[self::em|self::p| self::a|.]/text()
    // const NR_BODY = "//div[@class=\'article-header__subtitle\']/text() | //div[@class=\'section-content--primary\']/div[@class=\'article-content\']/*[self::p or self::blockquote]/text()";
    // //div[@class='section-content--primary']/div[@class='article-content']/p/text()

    const WSJ_TITLE = "//h1[@class=\'wsj-article-headline\']/text()";
    //const WSJ_BODY = "//body[@id=\'article_body\']//div[@id=\'article_sector\']//*[not(self::div[@class=\'media-object-rich-text\'])]//p//text()";
    const WSJ_BODY = "//body[@id=\'article_body\']//div[@id=\'article_sector\']//div[contains(@class,\'article-content\')]/p/text()|//body[@id=\'article_body\']//div[@id=\'article_sector\']//div[contains(@class,\'article-content\')]//div[@class=\'paywall\']/p// text()";

    var url3 = document.URL;
    function xpath_from_url(url) {
      if (url.includes("wsj")) {
        console.log("WSJ");
        return [WSJ_TITLE, WSJ_BODY];
      } else if (url.includes("nationalreview")) {
        console.log("NR2");
        return [NR_TITLE, NR_BODY];
      } else {
        console.log("No XPATH found for URL");
      }
    }
    var xpath_array = xpath_from_url(url3);
    if (xpath_array) {
      return next_function(...xpath_array);
    }
  };

function getElementByXpath(xpath_title, xpath_body) {
  var text=''; var node;
  console.log(xpath_title, xpath_body);
  var body=document.evaluate(xpath_body, document, null, XPathResult.ANY_TYPE, null);
  while(node=body.iterateNext()) {
    text += node.data + "\n";
  }
 var title=document.evaluate(xpath_title, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
 return [title + '. \n' + text, title];
}

function saveTextToFile(info) {

  chrome.tabs.executeScript({
    code: '(' + get_xpath.toString() + ')(' + getElementByXpath.toString() + ')',
    //code: 'XPATH="' + get_xpath() + '"; (' + getElementByXpath.toString() + ')("'+get_xpath()+'")',
    //code: get_xpath().toString() + ')(,
    allFrames: true,
    matchAboutBlank: true
  }, function (results) {
    if (results[0]) {
      // Clean text
      var text = results[0][0];
      text = text.replace(/[\u2018\u2019]/g, "'")
                 .replace(/[\u201C\u201D]/g, '"')
                 .replace(/[^\x00-\x7F]/g, ' ');
      //var text = results[0][0].replace(/[\u{0080}-\u{FFFF}]/gu,'');

      var title = results[0][1];
      createFileContents(text, function(fileContents) {
        var blob = new Blob([fileContents], {
          type: 'text/plain'
        });
        var url = URL.createObjectURL(blob);
        createFileName(function(fileName) {
          //var sanitizedFileName = sanitizeFileName(fileName);
          var sanitizedFileName = sanitizeFileName(title)+"_ARTICLE.txt";
          var new_url = "https://students.cs.byu.edu/~tarch/articles/" + encodeURIComponent(sanitizedFileName);
          chrome.tabs.update({url: new_url});
          chrome.runtime.sendNativeMessage(HOST_APPLICATION_NAME, testConnectivityPayload, function(response) {
            if (chrome.runtime.lastError) {
              console.log('SaveTextToFile: Error communicating between the native application and web extension.');
              console.log(chrome.runtime.lastError.message);
              startDownloadOfTextToFile(url, sanitizedFileName);
            } else {
              var responseObject = JSON.parse(response);
              if (responseObject.status === 'Success') {
                saveTextViaApp(directory, sanitizedFileName, fileContents);
              }
            }
          });
        });
      });
    }
  });
}

function sanitizeFileName(fileName) {
  fileName = fileName.replace(/(?:\r\n|\r|\n)/g, '');
  fileName = fileName.replace(/\s+/g, ' ').trim();
  return fileName.replace(/[\/\\|":*?<>]/g, '_');
}

function createFileContents(selectionText, callback) {

  if (positionOfTemplateText == 0) {
    selectionText = templateText + '\n\n' + selectionText;
  } else {
    selectionText = selectionText + '\n\n' + templateText;
  }

  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
    var title = tabs[0].title;
    var url = tabs[0].url;
    var text = selectionText;

    if (pageTitleInFile) {
      text = title + '\n\n' + text;
    }
    if (urlInFile) {
      text = url + '\n\n' + text;
    }

    callback(text);
  });
}

function createFileName(callback) {
  var fileName = '';
  var pageTitle = '';
  var date = _getDate();
  var extension = _getExtension();
  var customText = fileNamePrefix;
  _getPageTitleToFileName(function() {
    if (fileNameComponentOrder === DATE_CUSTOM_TITLE) {
      fileName = date + (date === '' ? '' : fileNameComponentSeparator) + customText + (pageTitle === '' ? '' : fileNameComponentSeparator) + pageTitle;
    } else if (fileNameComponentOrder === DATE_TITLE_CUSTOM) {
      fileName = date + (date === '' ? '' : fileNameComponentSeparator) + pageTitle + (pageTitle === '' ? '' : fileNameComponentSeparator) + customText;
    } else if (fileNameComponentOrder === CUSTOM_DATE_TITLE) {
      fileName = customText + (date === '' ? '' : fileNameComponentSeparator) + date + (pageTitle === '' ? '' : fileNameComponentSeparator) + pageTitle;
    } else if (fileNameComponentOrder === CUSTOM_TITLE_DATE) {
      fileName = customText + (pageTitle === '' ? '' : fileNameComponentSeparator) + pageTitle + (date === '' ? '' : fileNameComponentSeparator) + date;
    } else if (fileNameComponentOrder === TITLE_CUSTOM_DATE) {
      fileName = pageTitle + (pageTitle === '' ? '' : fileNameComponentSeparator) + customText + (date === '' ? '' : fileNameComponentSeparator) + date;
    } else if (fileNameComponentOrder === TITLE_DATE_CUSTOM) {
      fileName = pageTitle + (pageTitle === '' ? '' : fileNameComponentSeparator) + date + (date === '' ? '' : fileNameComponentSeparator) + customText;
    }
    if (fileName === '') {
      notify('Error: Filename cannot be empty, please review preferences.');
    } else {
      fileName += extension;
      callback(fileName);
    }
  });

  function _getPageTitleToFileName(callback) {
    if (prefixPageTitleInFileName) {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function(tabs) {
        pageTitle = tabs[0].title;
        callback();
      });
    } else {
      callback();
    }
  }

  function _getDate() {
    var currentDate = new Date();
    var day = _determineDay();
    var month = _determineMonth();
    var year = currentDate.getFullYear();
    if (dateFormat === DDMMYYYY) {
      return day + '-' + month + '-' + year;
    } else if (dateFormat === MMDDYYYY) {
      return month + '-' + day + '-' + year;
    } else if (dateFormat === YYYYMMDD) {
      return year + '-' + month + '-' + day;
    } else if (dateFormat === YYYYDDMM) {
      return year + '-' + day + '-' + month;
    } else if (dateFormat === NONE) {
      return '';
    } else {
      return currentDate.getTime();
    }

    function _determineDay() {
      var dayPrefix = currentDate.getDate() < 10 ? '0' : '';
      return dayPrefix + currentDate.getDate();
    }

    function _determineMonth() {
      var monthPrefix = (currentDate.getMonth() + 1) < 10 ? '0' : '';
      return monthPrefix + (currentDate.getMonth() + 1);
    }
  }

  function _getExtension() {
    return '.txt';
  }
}

function startDownloadOfTextToFile(url, fileName) {
  var options = {
    filename: fileName,
    url: url,
    conflictAction: conflictAction
  };
  if (!directorySelectionDialog) {
    options.saveAs = false;
  } else {
    options.saveAs = true;
  }
  chrome.downloads.download(options, function(downloadId) {
    if (downloadId) {
      if (notifications) {
        notify('Text saved.');
      }
    } else {
      var error = chrome.runtime.lastError.toString();
      if (error.indexOf('Download canceled by the user') >= 0) {
        if (notifications) {
          notify('Save canceled.');
        }
      } else {
        notify('Error occured.');
        console.log(error);
      }
    }
  });
}

chrome.contextMenus.create({
  id: MENU_ITEM_ID,
  title: EXTENSION_TITLE,
  contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener(function(info) {
  if (info.menuItemId === MENU_ITEM_ID) {
    saveTextToFile(info);
  }
});

function notify(message) {
  chrome.notifications.clear(NOTIFICATION_ID, function() {
    chrome.notifications.create(NOTIFICATION_ID, {
      title: EXTENSION_TITLE,
      type: 'basic',
      message: message,
      iconUrl: chrome.runtime.getURL('images/ico.png')
    });
  });
}

chrome.storage.sync.get({
  fileNamePrefix: DEFAULT_FILE_NAME_PREFIX,
  dateFormat: '0',
  fileNameComponentOrder: '0',
  prefixPageTitleInFileName: false,
  fileNameComponentSeparator: '-',
  pageTitleInFile: false,
  urlInFile: false,
  templateText: '',
  positionOfTemplateText: 0,
  directory: '',
  directorySelectionDialog: false,
  notifications: true,
  conflictAction: 'uniquify'
}, function(items) {
  fileNamePrefix = items.fileNamePrefix;
  dateFormat = items.dateFormat;
  fileNameComponentOrder = items.fileNameComponentOrder;
  prefixPageTitleInFileName = items.prefixPageTitleInFileName;
  fileNameComponentSeparator = items.fileNameComponentSeparator;
  pageTitleInFile = items.pageTitleInFile;
  urlInFile = items.urlInFile;
  templateText = items.templateText;
  positionOfTemplateText = items.positionOfTemplateText;
  directory = items.directory;
  directorySelectionDialog = items.directorySelectionDialog;
  notifications = items.notifications;
  conflictAction = items.conflictAction;
});

function getSelectionText() {
  var text = '';
  var activeEl = document.activeElement;
  var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
  if (window.getSelection) {
    text = window.getSelection().toString();
  }
  return text;
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'save-text-to-file') {
    chrome.tabs.executeScript({
      code: '(' + getSelectionText.toString() + ')()',
      allFrames: true,
      matchAboutBlank: true
    }, function (results) {
      if (results[0]) {
          saveTextToFile({
            selectionText: results[0]
          });
      }
    });
  }
});

chrome.storage.onChanged.addListener(function(changes) {
  _updatePrefixOnChange();
  _updateDateFormatOnChange();
  _updateFileNameComponentOrderOnChange();
  _updatePageTitleInFileNameOnChange();
  _updateFileNameComponentSeparatorOnChange();
  _updatePageTitleInFileOnChange();
  _updateUrlInFileOnChange();
  _updateTemplateTextOnChange();
  _updatePositionOfTemplateTextOnChange();
  _updateDirectoryOnChange();
  _updateDirectorySelectionOnChange();
  _updateNotificationsOnChange();
  _updateConflictActionOnChange();

  function _updatePrefixOnChange() {
    if (changes.fileNamePrefix) {
      if (changes.fileNamePrefix.newValue !== changes.fileNamePrefix.oldValue) {
        fileNamePrefix = changes.fileNamePrefix.newValue;
      }
    }
  }

  function _updateDateFormatOnChange() {
    if (changes.dateFormat) {
      if (changes.dateFormat.newValue !== changes.dateFormat.oldValue) {
        dateFormat = changes.dateFormat.newValue;
      }
    }
  }

  function _updateFileNameComponentOrderOnChange() {
    if (changes.fileNameComponentOrder) {
      if (changes.fileNameComponentOrder.newValue !== changes.fileNameComponentOrder.oldValue) {
        fileNameComponentOrder = changes.fileNameComponentOrder.newValue;
      }
    }
  }

  function _updatePageTitleInFileNameOnChange() {
    if (changes.prefixPageTitleInFileName) {
      if (changes.prefixPageTitleInFileName.newValue !== changes.prefixPageTitleInFileName.oldValue) {
        prefixPageTitleInFileName = changes.prefixPageTitleInFileName.newValue;
      }
    }
  }

  function _updateFileNameComponentSeparatorOnChange() {
    if (changes.fileNameComponentSeparator) {
      if (changes.fileNameComponentSeparator.newValue !== changes.fileNameComponentSeparator.oldValue) {
        fileNameComponentSeparator = changes.fileNameComponentSeparator.newValue;
      }
    }
  }

  function _updatePageTitleInFileOnChange() {
    if (changes.pageTitleInFile) {
      if (changes.pageTitleInFile.newValue !== changes.pageTitleInFile.oldValue) {
        urlInFile = changes.pageTitleInFile.newValue;
      }
    }
  }

  function _updateUrlInFileOnChange() {
    if (changes.urlInFile) {
      if (changes.urlInFile.newValue !== changes.urlInFile.oldValue) {
        urlInFile = changes.urlInFile.newValue;
      }
    }
  }

  function _updateTemplateTextOnChange() {
    if (changes.templateText) {
      if (changes.templateText.newValue !== changes.templateText.oldValue) {
        templateText = changes.templateText.newValue;
      }
    }
  }

  function _updatePositionOfTemplateTextOnChange() {
    if (changes.positionOfTemplateText) {
      if (changes.positionOfTemplateText.newValue !== changes.positionOfTemplateText.oldValue) {
        positionOfTemplateText = changes.positionOfTemplateText.newValue;
      }
    }
  }

  function _updateDirectoryOnChange() {
    if (changes.directory) {
      if (changes.directory.newValue !== changes.directory.oldValue) {
        directory = changes.directory.newValue;
      }
    }
  }

  function _updateDirectorySelectionOnChange() {
    if (changes.directorySelectionDialog) {
      if (changes.directorySelectionDialog.newValue !== changes.directorySelectionDialog.oldValue) {
        directorySelectionDialog = changes.directorySelectionDialog.newValue;
      }
    }
  }

  function _updateNotificationsOnChange() {
    if (changes.notifications) {
      if (changes.notifications.newValue !== changes.notifications.oldValue) {
        notifications = changes.notifications.newValue;
      }
    }
  }

  function _updateConflictActionOnChange() {
    if (changes.conflictAction) {
      if (changes.conflictAction.newValue !== changes.conflictAction.oldValue) {
        conflictAction = changes.conflictAction.newValue;
      }
    }
  }
});

chrome.runtime.sendNativeMessage(HOST_APPLICATION_NAME, testConnectivityPayload, function(response) {
  if (chrome.runtime.lastError) {
    console.log('ERROR: ' + chrome.runtime.lastError.message);
  } else {
    var responseObject = JSON.parse(response);
    if (responseObject.status === 'Success') {
      console.log('SaveTextToFile: Successfully tested communication between native application and webextension.');
    }
  }
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.extension.getURL('options.html')
    });
  }
});
