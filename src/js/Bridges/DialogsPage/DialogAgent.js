_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsPage', function (DOM) {

    var DialogAgent = _context.extend('Nittro.Object', function (dialogManager) {
        DialogAgent.Super.call(this);
        this._.dialogManager = dialogManager;

    }, {
        initTransaction: function (transaction, context) {
            var element = context.element,
                snippet,
                data = {};

            if (element && (snippet = DOM.getData(element, 'dialog'))) {
                data.snippet = snippet;
            }

            transaction.on('dispatch', this._dispatch.bind(this));
            transaction.on('snippets-apply', this._handleSnippets.bind(this, data));
        },

        _dispatch: function (evt) {
            if (this._.dialogManager.hasOpenDialog()) {
                evt.waitFor(this._.dialogManager.getTopmostOpenDialog().hide());
            }
        },

        _handleSnippets: function (data, evt) {
            var changeset = evt.data.changeset;

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

                this._openDialog(snippet.content);

            }
        },

        _openDialog: function (content) {
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

            dialog.show();
            dialog.one('hidden', dialog.destroy.bind(dialog));
        }
    });

    _context.register(DialogAgent, 'DialogAgent');

}, {
    DOM: 'Utils.DOM'
});
