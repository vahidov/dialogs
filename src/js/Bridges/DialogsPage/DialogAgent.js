_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsPage', function (DOM) {

    var DialogAgent = _context.extend('Nittro.Object', function (dialogManager, snippetManager) {
        DialogAgent.Super.call(this);
        this._.dialogManager = dialogManager;
        this._.snippetManager = snippetManager;

    }, {
        initTransaction: function (transaction, context) {
            var element = context.element,
                snippet,
                data = {};

            if (element) {
                if (snippet = DOM.getData(element, 'dialog')) {
                    data.snippet = snippet;
                }

                var open = this._.dialogManager.getOpenDialogs(),
                    i;

                for (i = 0; i < open.length; i++) {
                    if (DOM.contains(open[i].getElement(), element)) {
                        data.hiding = open[i];
                        break;
                    }
                }
            }

            transaction.on('dispatch', this._dispatch.bind(this, data));
            transaction.on('snippets-apply', this._handleSnippets.bind(this, data));
        },

        _dispatch: function (data, evt) {
            if (data.hiding) {
                data.hiding.off('hidden.cleanup');
                evt.waitFor(data.hiding.hide());
            }
        },

        _handleSnippets: function (data, evt) {
            var changeset = evt.data.changeset;

            if (data.hiding) {
                this._.snippetManager.cleanupDescendants(data.hiding.getElement(), evt.data);
                this._.snippetManager.one('before-update', data.hiding.destroy.bind(data.hiding));
                data.hiding = null;
            }

            if (data.snippet && data.snippet in changeset.update) {
                var snippet = changeset.update[data.snippet],
                    id;

                if (snippet.container) {
                    throw new Error('Dialogs from dynamic snippets aren\'t supported');
                }

                delete changeset.update[data.snippet];

                for (id in changeset.remove) {
                    if (changeset.remove.hasOwnProperty(id) && changeset.remove[id].isDescendant && DOM.contains(snippet.element, changeset.remove[id].element)) {
                        delete changeset.remove[id];

                    }
                }

                this._.snippetManager.one('before-update', this._createDialog.bind(this, snippet.content));

            }
        },

        _createDialog: function (content) {
            var options = {},
                children = DOM.getChildren(content),
                dialog;

            options.content = DOM.create('div');
            options.buttons = null;

            DOM.append(options.content, children);

            if (options.content.getElementsByTagName('form').length) {
                dialog = this._.dialogManager.createFormDialog(options);
            } else {
                dialog = this._.dialogManager.createDialog(options);
            }

            this._.snippetManager.one('after-update', dialog.show.bind(dialog));
            dialog.one('hidden.cleanup', this._destroyDialog.bind(this, dialog));
        },

        _destroyDialog: function (dialog) {
            this._.snippetManager.cleanupDescendants(dialog.getElement());
            dialog.destroy();
        }
    });

    _context.register(DialogAgent, 'DialogAgent');

}, {
    DOM: 'Utils.DOM'
});
