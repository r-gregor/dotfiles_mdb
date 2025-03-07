class Relax {
    constructor() {
        this.storage = {
            state: true,
            range: 15,
            color: '#fac563',
        };
        this.init();
        this.onStorageChanged();
        this.relaxerListener();
    }

    init() {
        chrome.storage.local.get(this.storage, storage => {
            this.storage = storage;
            this.start();
        });
    }

    saveStorage() {
        chrome.storage.local.set(this.storage);
    }

    start() {
        this.injectRelaxer();
        this.checkTime();
    }

    relaxerListener() {
        chrome.runtime.onMessage.addListener(request => {
            if( request.message === "disable_light" ) {
                this.storage.state = false;
                this.saveStorage();
            }
        });
    }

    checkTime() {
        const time = this.checkTimeOnValid('22', '7');

        if(this.storage.state !== time) {
            this.storage.state = time;
            this.saveStorage();
        }
    }

    checkTimeOnValid(from, to) {
        const currentDate = new Date()
        if (currentDate.getHours() >= from){
            return true;
        }
        else if (currentDate.getHours() < to) {
            return true;
        } else {
            return false;
        }
    }

    injectRelaxer() {
        const div = document.createElement('div');
        div.id = 'relaxer';
        div.setAttribute('style', this.styles);
        if(!document.getElementById('relaxer')) {
            document.documentElement.appendChild(div);
        }
    }

    get styles() {
        return `
            transition: opacity 0.1s ease 0s; 
            z-index: 2147483647;
            margin: 0; 
            border-radius: 0; 
            padding: 0; 
            background: ${this.storage.color}; 
            pointer-events: none; 
            position: fixed; 
            top: -10%; 
            right: -10%; 
            width: 120%; 
            height: 120%; 
            opacity: ${(this.storage.range * 0.008 + 0.2).toFixed(4)};
            mix-blend-mode: multiply; 
            display: ${this.storage.state ? 'block' : 'none'};
        `;
    }

    onStorageChanged() {
        chrome.storage.onChanged.addListener(changes => {
            for(let key in changes) {
                this.storage[key] = changes[key].newValue;
            }
            document.getElementById('relaxer').setAttribute('style', this.styles);
        });
    }
}

if (!document.getElementById("dark-style-link")) {
    var head = document.documentElement || document.head || document.querySelector("head");
    var link = document.createElement("link");
    link.setAttribute("type", "text/css")
    link.setAttribute("id", "dark-style-link")
    link.setAttribute("rel", "stylesheet")

    var hostname = function(a) {
        a = a.replace("www.", "");
        var b = a.indexOf("//") + 2;
        if (1 < b) {
            var c = a.indexOf("/", b);
            return 0 < c ? a.substring(b, c) : (c = a.indexOf("?", b), 0 < c ? a.substring(b, c) : a.substring(b))
        }
        return a
    };

    var custom = {
        ebay: ".ebay.com",
        yahoo: "www.yahoo.",
        twitch: ".twitch.tv",
        github: "github.com",
        docs: "docs.google.",
        bing: "www.bing.com",
        amazon: "www.amazon.",
        gmail: "mail.google.",
        tumblr: "www.tumblr.",
        twitter: "twitter.com",
        inbox: "inbox.google.",
        drive: "drive.google.",
        sites: "sites.google.",
        youtube: "www.youtube.",
        dropbox: "www.dropbox.",
        reddit: "www.reddit.com",
        maps: ".google.com/maps/",
        facebook: "www.facebook.",
        wikipedia: "wikipedia.org",
        instagram: "www.instagram.",
        duckduckgo: "duckduckgo.com",
        stackoverflow: "stackoverflow.com",
        google:"google.com"
    };

    var tabUrl = hostname(document.location.href);

    function setStyles () {
        if (tabUrl.indexOf("/chrome/newtab") == -1) {
            for (var customSite in custom) {
                if (tabUrl.indexOf(customSite) > -1) {
                    link.setAttribute("href", chrome.runtime.getURL("/css/" + customSite + ".css"));
                    return;
                }
            }

            const relax = new Relax();
            // link.setAttribute("href", chrome.runtime.getURL("/css/main.css"));
            return;
        }
    }

    chrome.storage.local.get("status", function(result) {
        if (result.status == 1) {
            chrome.storage.local.get(['blacklist'], function(result) {
                if (result.blacklist !== undefined) {
                    blacklist = result.blacklist;
                    if (blacklist.indexOf(tabUrl) <= -1) {
                        setStyles();
                        head && head.appendChild(link)
                    }
                } else {
                    setStyles();
                    head && head.appendChild(link)
                }
            });
        }
    })
}