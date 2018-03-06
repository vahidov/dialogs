_context.invoke('Nittro.Extras.Dialogs', function (Dialog, DOM, Arrays, Url) {

    var IFrameDialog = _context.extend(Dialog, function (name, url, options) {
        IFrameDialog.Super.call(this, name, options);

        this._.current = null;

        DOM.addClass(this._.elms.holder, 'nittro-dialog-iframe');
        this._.elms.content = document.createElement('iframe');
        this._.elms.content.name = name;
        DOM.addClass(this._.elms.content, 'nittro-dialog-content');
        DOM.addListener(this._.elms.content, 'load', this._handleLoad.bind(this));
        this._.elms.wrapper.insertBefore(this._.elms.content, this._.elms.wrapper.firstChild);

        if (url) {
            this.setUrl(url);
        }
    }, {
        STATIC: {
            defaults: {
                allowFullscreen: null,
                allowPaymentRequest: null,
                autoHeight: null,
                lazy: true,
                buttons: {
                    'close': 'Close'
                }
            },
            setDefaults: function(defaults) {
                Arrays.mergeTree(IFrameDialog.defaults, defaults);
            }
        },

        getContentDocument: function () {
            return this._.elms.content.contentDocument;
        },

        setUrl: function (url, external) {
            var o = this._.options;
            url = Url.from(url);

            this._.current = {
                url: url,
                allowFullscreen: o.allowFullscreen === null ? url.isLocal() : o.allowFullscreen,
                allowPaymentRequest: o.allowPaymentRequest === null ? url.isLocal() : o.allowPaymentRequest,
                autoHeight: o.autoHeight !== false && url.isLocal(),
                ready: false,
                external: external,
                onload: null
            };

            var promise, busy;

            if ((busy = this.isBusy(true)) || this.isVisible(true)) {
                promise = this.setBusy()
                    .then(this._load.bind(this));

                return busy ? promise : promise.then(this.show.bind(this));
            } else if (!this._.options.lazy) {
                return this._load();
            } else {
                return Promise.resolve();
            }
        },

        getUrl: function () {
            return this._.current ? Url.from(this._.current.url) : null;
        },

        isCurrent: function (url, ignoreHash) {
            return this._.current !== null && this._.current.url.compare(url) < (ignoreHash === false ? Url.PART.HASH : Url.PART.QUERY);
        },

        show: function () {
            if (!this._.current || this._.current.ready) {
                return IFrameDialog.Super.prototype.show.call(this);
            }

            if (!this.isBusy()) {
                return this.setBusy()
                    .then(this._load.bind(this))
                    .then(this.show.bind(this));
            } else {
                return this._load()
                    .then(this.show.bind(this));
            }
        },

        _load: function () {
            return this._setState('loaded', function (done) {
                this._.current.onload = function () {
                    this._.current.onload = null;
                    done('loaded');
                }.bind(this);

                if (!this._.current.external) {
                    this._.elms.content.src = this._.current.url.toAbsolute();
                }

                this._.elms.content.allowFullscreen = this._.current.allowFullscreen;
                this._.elms.content.allowPaymentRequest = this._.current.allowPaymentRequest;
            }, function () {
                this._.current.onload = null;
            }).then(this._applyAutoHeight.bind(this));
        },

        _applyAutoHeight: function () {
            var height = null;

            try {
                height = this.getContentDocument().documentElement.offsetHeight;
            } catch (e) {
                height = null;
            } finally {
                if (!height) {
                    this._.current.autoHeight = false;
                }

                DOM.toggleClass(this._.elms.holder, 'nittro-dialog-iframe-auto', this._.current.autoHeight);
                this._.elms.content.style.height = this._.current.autoHeight
                    ? height + 'px'
                    : '';
            }
        },

        _handleLoad: function () {
            if (this._.current && !this._.current.ready && this.isCurrent(this._.elms.content.src)) {
                this._.current.ready = true;
                this._.current.onload && this._.current.onload();
            }
        }
    });

    _context.register(IFrameDialog, 'IFrameDialog');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays',
    Url: 'Utils.Url'
});
