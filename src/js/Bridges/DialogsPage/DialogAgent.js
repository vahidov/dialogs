_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsPage', function (DOM, Url, undefined) {

    var DialogAgent = _context.extend('Nittro.Object', function (dialogManager, snippetManager) {
        DialogAgent.Super.call(this);
        this._.dialogManager = dialogManager;
        this._.snippetManager = snippetManager;
        this._.formLocator = null;
        this._.anonId = 0;
    }, {
        setFormLocator: function (formLocator) {
            this._.formLocator = formLocator;
            return this;
        },

        tryIFrameTransaction: function (evt) {
            if (evt.isDefaultPrevented()) {
                return;
            }

            var elem = evt.data.context.element,
                def = elem ? DOM.getData(elem, 'dialog') : null;

            if (typeof def === 'string') {
                if (/^iframe\s+[^:]+$/.test(def)) {
                    def = {
                        name: def.replace(/^iframe\s+/, ''),
                        type: 'iframe'
                    };
                } else {
                    return;
                }
            } else if (!def || def.type !== 'iframe') {
                return;
            }

            evt.preventDefault();
            evt.data.context.event && evt.data.context.event.preventDefault();

            if (!('source' in def)) {
                def.source = evt.data.url;
            }

            var dlg = this._createDialog(def.name, def);

            if (this._.formLocator && elem instanceof HTMLFormElement) {
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

        initTransaction: function (transaction, context) {
            var data = {
                    pending: [],
                    dialogs: {}
                },
                current = this._.dialogManager.getTopmostOpenDialog(),
                def,
                name;

            if (context.dialogs) {
                for (name in context.dialogs) if (context.dialogs.hasOwnProperty(name)) {
                    this._mergeDefinition(data, context.dialogs[name], current, context.element, name);
                }
            } else {
                if (current) {
                    data.dialogs[current.getName()] = false;
                }

                if (context.element && (def = DOM.getData(context.element, 'dialog')) !== undefined) {
                    this._mergeDefinition(data, def, current, context.element);
                }

                if (current && current.__keep) {
                    if (data.dialogs[current.getName()] === false) {
                        delete data.dialogs[current.getName()];
                    }

                    delete current.__keep;
                }
            }

            transaction.on('dispatch', this._dispatch.bind(this, data));
            transaction.on('ajax-response', this._handleResponse.bind(this, data));
            transaction.on('snippets-apply', this._handleSnippets.bind(this, data));
        },

        _dispatch: function (data, evt) {
            var name, promise;

            for (name in data.dialogs) if (data.dialogs.hasOwnProperty(name) && data.dialogs[name] !== null) {
                if (promise = this._processDialog(name, data.dialogs[name], data, evt.target)) {
                    evt.waitFor(promise);
                }
            }
        },

        _handleResponse: function (data, evt) {
            var payload = evt.data.response.getPayload(),
                current = this._.dialogManager.getTopmostOpenDialog(),
                name, def;

            if ('dialogs' in payload) {
                for (name in payload.dialogs) if (payload.dialogs.hasOwnProperty(name)) {
                    def = payload.dialogs[name];

                    if (typeof def === 'string') {
                        def = this._parseDescriptor(def, current, null, name);
                    }

                    if (def !== null && !def !== !data.dialogs[name]) {
                        data.dialogs[name] = def;
                        this._processDialog(name, def, data, evt.target);
                    }
                }
            }
        },

        _handleSnippets: function (data, evt) {
            var changeset = evt.data.changeset;

            evt.waitFor(Promise.all(data.pending));
            data.pending = null;

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

                    content = dlg.getContent();
                    content.id = def.source.replace(/^snippet-/, 'dlg-');
                    delete changeset.update[def.source];
                    changeset.update[content.id] = snippet;
                    snippet.element = content;

                    if (this._.formLocator && def.type === 'form') {
                        evt.target.then(this._injectForm.bind(this, dlg));
                    }

                    evt.target.then(dlg.show.bind(dlg));
                } else {
                    evt.waitFor(dlg.hide());
                }
            }
        },

        _isSnippetType: function (def) {
            return !def.type || def.type === 'form';
        },

        _mergeDefinition: function (data, def, current, elem, name) {
            if (typeof def === 'string') {
                def = this._parseDescriptor(def, current, elem, name);
            } else if (typeof def !== 'object' || !def.name || !def.source) {
                throw new Error('Invalid dialog definition: must be an object with the keys "name" and "source" and optionally "type" and / or "options"');
            }

            if (def) {
                data.dialogs[def.name] = def;
            }
        },

        _parseDescriptor: function (descriptor, current, element, name) {
            var m = /^keep-current(?:;\s*|$)/.exec(descriptor);

            if (m) {
                descriptor = descriptor.substr(m[0].length);
                current && (current.__keep = true);

                if (!descriptor) {
                    return null;
                }
            }

            m = /^(?:(self|current)|(?:(form|iframe)(?=[\s:]))?\s*([^:]+?)?)\s*:\s*(.+)$/.exec(descriptor);

            if (!m) {
                window.console && console.warn(
                    'Construction of dialogs using data-dialog="<snippet id>" is deprecated, please update  '
                    + 'your code to use data-dialog="([<type iframe|form> ]<name>|self): (<snippet id>|<url>)".'
                );

                return {
                    name: 'dlg-anonymous' + (++this._.anonId),
                    source: descriptor
                };
            } else if (m[1]) {
                if (current && (m[1] === 'current' || element && DOM.contains(current.getContent(), element))) {
                    return {
                        name: current.getName(),
                        source: m[4]
                    };
                } else {
                    return null;
                }
            } else {
                if (!m[3] && !name) {
                    throw new Error('Missing dialog name in definition "' + descriptor + '"');
                }

                return {
                    name: m[3] || name,
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
                    promise = dlg.hide();
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

            dlg.on('hidden', this._cleanupDialog.bind(this, this._isSnippetType(def)));

            return dlg;
        },

        _injectForm: function (dlg) {
            var frm = dlg.getContent().getElementsByTagName('form').item(0);
            frm && dlg.setForm(this._.formLocator.getForm(frm));
        },

        _cleanupDialog: function (descendants, evt) {
            if (descendants) {
                this._.snippetManager.cleanupDescendants(evt.target.getElement());
            }

            evt.target.destroy();
        }
    });

    _context.register(DialogAgent, 'DialogAgent');

}, {
    DOM: 'Utils.DOM',
    Url: 'Utils.Url'
});
