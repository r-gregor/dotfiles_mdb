var btn = document.getElementById("mainBtn");
var domainBtn = document.getElementById("domainBtn");

var hostname = function(a) {
    a = a.replace("www.", "");
    var b = a.indexOf("//") + 2;
    if (1 < b) {
        var c = a.indexOf("/", b);
        return 0 < c ? a.substring(b, c) : (c = a.indexOf("?", b), 0 < c ? a.substring(b, c) : a.substring(b))
    }
    return a
};

btn.addEventListener("click", function() {
    chrome.storage.local.get("status", function(result) {
        if (result.status == 1) {
            btn.innerHTML = chrome.i18n.getMessage("enable");
            chrome.storage.local.set({"status": 0}, null);
        } else {
            btn.innerHTML = chrome.i18n.getMessage("disable");
            chrome.storage.local.set({"status": 1}, null);
        }
    });
});

domainBtn.addEventListener("click", function() {
    chrome.storage.local.get(['blacklist'], function(result) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (result.blacklist === undefined) {
                chrome.storage.local.set({"blacklist": [hostname(tabs[0].url)]}, null);
                domainBtn.innerHTML = chrome.i18n.getMessage("removeFromBlacklist");
            } else {
                var blacklist = result.blacklist;
                if (blacklist.indexOf(hostname(tabs[0].url)) > -1) {
                    blacklist = blacklist.filter(function(value, index, arr) {
                        return value !== hostname(tabs[0].url);
                    });
                    chrome.storage.local.set({"blacklist": blacklist}, null);
                    domainBtn.innerHTML = chrome.i18n.getMessage("addToBlacklist");
                } else {
                    blacklist.push(hostname(tabs[0].url));
                    chrome.storage.local.set({"blacklist": blacklist}, null);
                    domainBtn.innerHTML = chrome.i18n.getMessage("removeFromBlacklist");
                }
            }
        });
    });
});


chrome.storage.local.get("status", function(result) {
    if (result.status == 1) {
        btn.innerHTML = chrome.i18n.getMessage("disable");
    } else {
        btn.innerHTML = chrome.i18n.getMessage("enable");
    }
});


chrome.storage.local.get(['blacklist'], function(result) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (result.blacklist === undefined) {
            domainBtn.innerHTML = chrome.i18n.getMessage("addToBlacklist");
        } else {
            var blacklist = result.blacklist;
            if (blacklist.indexOf(hostname(tabs[0].url)) > -1) {
                domainBtn.innerHTML = chrome.i18n.getMessage("removeFromBlacklist");
            } else {
                domainBtn.innerHTML = chrome.i18n.getMessage("addToBlacklist");
            }
        }
    });
});