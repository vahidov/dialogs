_context.invoke('Nittro.Extras.Dialogs', function(DOM, CSSTransitions, Arrays, ReflectionClass) {

    var Dialog = _context.extend('Nittro.Object', function(options) {
        Dialog.Super.call(this);

        this._.options = Arrays.mergeTree({}, Dialog.getDefaults(this.constructor), options);
        this._.visible = false;
        this._.scrollPosition = null;
        this._.keyMap = null;
        this._.tabContext = null;

        this._.elms = {
            holder : DOM.createFromHtml(this._.options.templates.holder),
            wrapper : DOM.createFromHtml(this._.options.templates.wrapper),
            content : null,
            buttons : null
        };

        this._.elms.holder.appendChild(this._.elms.wrapper);

        if (this._.options.classes) {
            DOM.addClass(this._.elms.holder, this._.options.classes);

        }

        if (this._.options.content) {
            this._.elms.content = this._.options.content;
            DOM.toggleClass(this._.elms.content, 'nittro-dialog-content', true);
            this._.options.content = null;

        } else if (this._.options.text) {
            this._.elms.content = DOM.createFromHtml(this._.options.templates.content);

            var content = DOM.create('p');
            content.textContent = this._.options.text;
            this._.elms.content.appendChild(content);

        } else if (this._.options.html) {
            this._.elms.content = DOM.createFromHtml(this._.options.templates.content);
            DOM.html(this._.elms.content, this._.options.html);

        }

        if (this._.elms.content) {
            this._.elms.wrapper.appendChild(this._.elms.content);
        }

        if (this._.options.buttons) {
            if (this._.options.buttons instanceof HTMLElement) {
                this._.elms.buttons = this._.options.buttons;
                DOM.toggleClass(this._.elms.buttons, 'nittro-dialog-buttons', true);
                this._.options.buttons = null;
            } else {
                this._.elms.buttons = DOM.createFromHtml(this._.options.templates.buttons);
                this._createButtons();
            }

            this._.elms.wrapper.appendChild(this._.elms.buttons);

        }

        try {
            var keymap = ReflectionClass.from('Nittro.Extras.Keymap.Keymap'),
                tabContext = ReflectionClass.from('Nittro.Extras.Keymap.TabContext');

            this._.keyMap = keymap.newInstance();
            this._.tabContext = tabContext.newInstance();
        } catch (e) {}


        if (this._.keyMap && this._.options.keyMap) {
            this._handleKey = this._handleKey.bind(this);

            for (var key in this._.options.keyMap) {
                if (this._.options.keyMap.hasOwnProperty(key)) {
                    this._.keyMap.add(key, this._handleKey);
                }
            }
        }

        if (this._.tabContext && this._.elms.buttons) {
            this._.tabContext.addFromContainer(this._.elms.buttons, true);
        }

        this.on('button:default', function() {
            this.hide();

        });

        DOM.addListener(this._.elms.wrapper, 'click', this._handleButton.bind(this));
        DOM.addListener(this._.elms.holder, 'touchmove', this._handleTouchScroll.bind(this));
        this._handleScroll = this._handleScroll.bind(this);

    }, {
        STATIC: {
            defaults: {
                classes: null,
                content: null,
                html: null,
                text: null,
                buttons: null,
                keyMap: {
                    'Escape': 'cancel'
                },
                templates: {
                    holder : '<div class="nittro-dialog-holder"></div>',
                    wrapper : '<div class="nittro-dialog-inner"></div>',
                    content : '<div class="nittro-dialog-content"></div>',
                    buttons : '<div class="nittro-dialog-buttons"></div>',
                    button : '<button></button>'
                }
            },
            getDefaults: function (type) {
                var defaults = {},
                    k;

                do {
                    if (type.defaults) {
                        for (k in type.defaults) {
                            if (type.defaults.hasOwnProperty(k) && !defaults.hasOwnProperty(k)) {
                                defaults[k] = type.defaults[k];

                            }
                        }
                    }

                    type = type.Super;

                } while (type && type !== Dialog.Super);

                return defaults;

            },
            setDefaults: function(options) {
                Arrays.mergeTree(Dialog.defaults, options);

            }
        },

        isVisible: function() {
            return this._.visible;

        },

        show: function() {
            if (this._.visible) {
                return;

            }

            this._.visible = true;

            this._.scrollLock = {
                left: window.pageXOffset,
                top: window.pageYOffset
            };

            if (/ipod|ipad|iphone/i.test(navigator.userAgent)) {
                this._.scrollPosition = window.pageYOffset;
                window.scrollTo(0, 0);
                this._.scrollLock.left = 0;
                this._.scrollLock.top = 0;

            }

            DOM.addListener(window, 'scroll', this._handleScroll);
            DOM.addClass(this._.elms.holder, 'visible');

            this.trigger('show');

            return CSSTransitions.run(this._.elms.holder)
                .then(function () {
                    this.trigger('shown');
                    return this;
                }.bind(this));
        },

        hide: function() {
            if (!this._.visible) {
                return;

            }

            this._.visible = false;

            DOM.removeListener(window, 'scroll', this._handleScroll);

            if (/ipod|ipad|iphone/i.test(navigator.userAgent)) {
                window.scrollTo(0, this._.scrollPosition);
                this._.scrollPosition = null;

            }

            this.trigger('hide');

            DOM.removeClass(this._.elms.holder, 'visible');

            return CSSTransitions.run(this._.elms.holder)
                .then(function () {
                    this.trigger('hidden');
                    return this;
                }.bind(this));
        },

        getElement: function () {
            return this._.elms.holder;

        },

        getContent: function() {
            return this._.elms.content;

        },

        getButtons: function() {
            return this._.elms.buttons;

        },

        getKeyMap: function () {
            return this._.keyMap;
        },

        getTabContext: function () {
            return this._.tabContext;
        },

        destroy: function () {
            if (this._.visible) {
                this.hide().then(this.destroy.bind(this));

            } else {
                this.trigger('destroy');

                if (this._.elms.holder.parentNode) {
                    this._.elms.holder.parentNode.removeChild(this._.elms.holder);
                }

                this.off();

                for (var k in this._.elms) {
                    this._.elms[k] = null;
                }
            }
        },

        _createButtons: function () {
            var action, btn, def;

            for (action in this._.options.buttons) {
                if (this._.options.buttons.hasOwnProperty(action)) {
                    btn = DOM.createFromHtml(this._.options.templates.button);

                    def = this._.options.buttons[action];

                    if (typeof def === 'string') {
                        def = {label: def, type: 'button'};

                    }

                    DOM.setData(btn, 'action', action);
                    DOM.addClass(btn, 'nittro-dialog-button', def.type === 'text' ? 'nittro-dialog-button-text' : '');
                    btn.textContent = def.label;

                    this._.elms.buttons.appendChild(btn);
                }
            }
        },

        _handleButton: function (evt) {
            var action = DOM.getData(evt.target, 'action');

            if (action) {
                evt.preventDefault();

                this.trigger('button', {
                    action: action
                });
            }
        },

        _handleKey: function (key, evt) {
            if (evt.target && evt.target.tagName && evt.target.tagName.match(/^(input|button|textarea|select)$/i) && DOM.contains(this._.elms.wrapper, evt.target)) {
                return false;
            } else {
                this.trigger('button', {
                    action: this._.options.keyMap[key]
                });
            }
        },

        _handleTouchScroll: function (evt) {
            if (this._.elms.holder === evt.target) {
                evt.preventDefault();

            }
        },

        _handleScroll: function () {
            window.scrollTo(this._.scrollLock.left, this._.scrollLock.top);

        }
    });

    _context.register(Dialog, 'Dialog');

}, {
    DOM: 'Utils.DOM',
    CSSTransitions: 'Utils.CSSTransitions',
    Arrays: 'Utils.Arrays',
    ReflectionClass: 'Utils.ReflectionClass'
});
