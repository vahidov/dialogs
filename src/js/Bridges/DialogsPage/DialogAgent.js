_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsPage', function (DOM, Url, Arrays, undefined) {

    var anonId = 0;

    var DialogAgent = _context.extend('Nittro.Object', function (page, dialogManager, snippetManager, options) {
        DialogAgent.Super.call(this);
        this._.page = page;
        this._.dialogManager = dialogManager;
        this._.snippetManager = snippetManager;
        this._.formLocator = null;
        this._.options = Arrays.mergeTree({}, DialogAgent.defaults, options);

        this._.page.on('before-transaction', this._setupTransactionContext.bind(this));
        this._.page.on('transaction-created', this._initTransaction.bind(this));
    }, {
        STATIC: {
            defaults: {
                whitelistHistory: true,
                disableDefaultTransitions: true,
                disableDefaultScroll: true
            }
        },

        setFormLocator: function (formLocator) {
            this._.formLocator = formLocator;
            return this;
        },

        _setupTransactionContext: function (evt) {
            if (evt.isDefaultPrevented()) {
                return;
            }

            var ctx = evt.data.context,
                def = ctx.element ? DOM.getData(ctx.element, 'dialog', null) : null,
                current = this._.dialogManager.getTopmostOpenDialog(),
                dialogs = {},
                active, iframe, name;

            if (def !== null) {
                this._mergeDefinitions(dialogs, def);
            }

            if (ctx.dialogs) {
                this._mergeDefinitions(dialogs, ctx.dialogs);
            }

            for (name in dialogs) if (dialogs.hasOwnProperty(name)) {
                def = dialogs[name];

                if (name === 'current' || name === 'self') {
                    delete dialogs[name];

                    if (current && (name === 'current' || ctx.element && DOM.contains(current.getContent(), ctx.element))) {
                        name = current.getName();
                        dialogs[name] = def;

                        if (typeof def === 'object') {
                            def.name = name;
                        }
                    } else {
                        continue;
                    }
                }

                if (typeof def === 'object') {
                    active = true;

                    if (def.type === 'iframe') {
                        iframe = name;
                    }
                }
            }

            if (current) {
                if (!(current.getName() in dialogs)) {
                    dialogs[current.getName()] = false;
                } else if (dialogs[current.getName()] === true) {
                    delete dialogs[current.getName()];
                }
            }

            ctx.dialogs = dialogs;

            if (active) {
                if (this._.options.whitelistHistory && !('history' in ctx) && (!ctx.element || !ctx.element.hasAttribute('data-history'))) {
                    ctx.history = false;
                }

                if (this._.options.disableDefaultTransitions && !('transition' in ctx) && (!ctx.element || !ctx.element.hasAttribute('data-transition'))) {
                    ctx.transition = false;
                }

                if (this._.options.disableDefaultScroll && !('scrollTo' in ctx) && (!ctx.element || !ctx.element.hasAttribute('data-scroll-to'))) {
                    ctx.scrollTo = false;
                }
            }

            if (iframe) {
                evt.preventDefault();
                ctx.event && ctx.event.preventDefault();
                def = dialogs[iframe];
                def.source || def.source === '' || (def.source = evt.data.url);
                this._openIframeDialog(def, ctx.element);
            }
        },

        _initTransaction: function (evt) {
            var data = {
                pending: [],
                dialogs: evt.data.context.dialogs
            };

            evt.data.transaction.on('dispatch', this._dispatch.bind(this, data));
            evt.data.transaction.on('ajax-response', this._handleResponse.bind(this, data));
            evt.data.transaction.on('snippets-apply', this._handleSnippets.bind(this, data));
        },

        _openIframeDialog: function (def, elem) {
            var dlg = this._createDialog(def.name, def);

            if (elem && this._.formLocator && elem instanceof HTMLFormElement) {
                var frm = this._.formLocator.getForm(elem),
                    external = true,
                    tmp;

                if (/^get$/i.test(elem.method)) {
                    def.source = Url.from(def.source)
                        .addParams(frm.serialize().exportData(true))
                        .toAbsolute();

                    external = false;
                }

                dlg.setUrl(def.source, external);

                if (external) {
                    tmp = elem.target;
                    elem.target = def.name;
                    frm.submit();
                    window.setTimeout(function() { elem.target = tmp; }, 1);
                }
            } else {
                dlg.setUrl(def.source);
            }

            dlg.show();
        },

        _dispatch: function (data, evt) {
            var name, promise;

            for (name in data.dialogs) if (data.dialogs.hasOwnProperty(name)) {
                if (promise = this._processDialog(name, data.dialogs[name], data, evt.target)) {
                    evt.waitFor(promise);
                }
            }
        },

        _handleResponse: function (data, evt) {
            var payload = evt.data.response.getPayload(),
                merged, i, n;

            if ('dialogs' in payload) {
                merged = this._mergeDefinitions(data.dialogs, payload.dialogs);

                for (i = 0, n = merged.length; i < n; i++) {
                    this._processDialog(merged[i], data.dialogs[merged[i]], data, evt.target);
                }
            }
        },

        _handleSnippets: function (data, evt) {
            var changeset = evt.data.changeset;

            evt.waitFor(Promise.all(data.pending));
            data.pending = [];

            var name, def, id, dlg, snippet, content;

            for (name in data.dialogs) if (data.dialogs.hasOwnProperty(name) && (def = data.dialogs[name]) && this._isSnippetType(def)) {
                dlg = this._.dialogManager.getDialog(name);
                snippet = changeset.update[def.source];

                if (snippet) {
                    if (snippet.container) {
                        throw new Error('Dialogs from dynamic snippets aren\'t supported');
                    }

                    for (id in changeset.remove) if (changeset.remove.hasOwnProperty(id)) {
                        if (changeset.remove[id].isDescendant && DOM.contains(snippet.element, changeset.remove[id].element)) {
                            delete changeset.remove[id];
                        }
                    }

                    id = def.source.replace(/^snippet-/, 'dlg-');
                    delete changeset.update[def.source];

                    if (dlg) {
                        changeset.update[id] = snippet;
                        content = dlg.getContent();
                        content.id = id;
                        snippet.element = content;

                        if (this._.formLocator && def.type === 'form') {
                            evt.target.then(this._injectForm.bind(this, dlg));
                        }

                        evt.target.then(dlg.show.bind(dlg));
                    }
                } else {
                    dlg && evt.waitFor(dlg.destroy());
                }
            }
        },

        _isSnippetType: function (def) {
            return !def.type || def.type === 'form';
        },

        _mergeDefinitions: function (dialogs, defs) {
            var merged = [],
                name, m, def;

            if (typeof defs === 'string') {
                defs = { '': defs };
            } else if ('source' in defs || 'type' in defs) {
                defs = { '': defs };
            }

            for (name in defs) if (defs.hasOwnProperty(name)) {
                def = defs[name];

                if (typeof def === 'string') {
                    m = /^keep-current(?:;\s*|$)/.exec(def);

                    if (m) {
                        def = def.substr(m[0].length);
                        dialogs.current = true;
                    }

                    if (!def) {
                        continue;
                    }

                    def = this._parseDescriptor(def);
                }

                if (typeof def === 'object') {
                    if (!def.name && name) {
                        def.name = name;
                    }

                    if (!def.name || !def.source && def.type !== 'iframe') {
                        throw new Error('Invalid dialog definition: must be an object with the keys "name" and "source" and optionally "type" and / or "options"');
                    }

                    dialogs[def.name] = def;
                    merged.push(def.name);
                } else if (name) {
                    dialogs[name] = def;
                    merged.push(name);
                }
            }

            return merged;
        },

        _parseDescriptor: function (descriptor) {
            var m = /^(?:(self|current)|(?:(form|iframe)(?=[\s:]))?\s*([^:]+?)?)\s*:\s*(.+)$/.exec(descriptor);

            if (!m) {
                window.console && console.warn(
                    'Construction of dialogs using data-dialog="<snippet id>" is deprecated, please update  '
                    + 'your code to use data-dialog="([<type iframe|form> ]<name>|self): (<snippet id>|<url>)".'
                );

                return {
                    name: 'dlg-anonymous-' + (++anonId),
                    source: descriptor
                };
            } else if (m[1]) {
                return {
                    name: m[1],
                    source: m[4]
                };
            } else {
                return {
                    name: m[3],
                    type: m[2] || null,
                    source: m[4]
                };
            }
        },

        _processDialog: function (name, def, data, transaction) {
            var dlg = this._.dialogManager.getDialog(name),
                promise = null;

            if (!def) {
                if (dlg) {
                    promise = dlg.destroy();
                }
            } else {
                if (!dlg) {
                    dlg = this._createDialog(name, def);
                }

                promise = dlg.setBusy();

                if (def.type === 'iframe') {
                    dlg.setUrl(def.source);
                    transaction.then(dlg.show.bind(dlg));
                }
            }

            promise && data.pending.push(promise);
            return promise;
        },

        _createDialog: function (name, def) {
            def.options || (def.options = {});

            if (this._isSnippetType(def)) {
                def.options.content = DOM.create('div');
                def.options.buttons = null;
            }

            var dlg;

            if (def.type === 'form' && this._.formLocator) {
                dlg = this._.dialogManager.createFormDialog(name, def.options);
            } else if (def.type === 'iframe') {
                dlg = this._.dialogManager.createIFrameDialog(name, null, def.options);
            } else {
                dlg = this._.dialogManager.createDialog(name, def.options);
            }

            dlg.one('hidden', dlg.destroy.bind(dlg));

            if (this._isSnippetType(def)) {
                dlg.on('destroyed', this._cleanupDialog.bind(this));
            }

            return dlg;
        },

        _injectForm: function (dlg) {
            var frm = dlg.getContent().getElementsByTagName('form').item(0);
            dlg.setForm(frm ? this._.formLocator.getForm(frm) : null);
        },

        _cleanupDialog: function (evt) {
            this._.snippetManager.cleanupDescendants(evt.target.getElement());
        }
    });

    _context.register(DialogAgent, 'DialogAgent');

}, {
    DOM: 'Utils.DOM',
    Url: 'Utils.Url',
    Arrays: 'Utils.Arrays'
});
