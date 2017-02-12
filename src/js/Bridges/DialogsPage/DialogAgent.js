_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsPage', function (DOM) {

    var DialogAgent = _context.extend('Nittro.Object', function (dialogManager) {
        DialogAgent.Super.call(this);
        this._.dialogManager = dialogManager;

    }, {
        init: function (transaction, context) {
            var element = context.element,
                snippet,
                data = {};

            if (element && (snippet = DOM.getData(element, 'dialog'))) {
                data.snippet = snippet;
            }

            return data;
        },

        dispatch: function (transaction, data) {
            if (this._.dialogManager.hasOpenDialog()) {
                return this._.dialogManager.getTopmostOpenDialog().hide();

            }
        },

        abort: function (transaction, data) {

        },

        handleAction: function (transaction, agent, action, actionData, data) {
            if (data.snippet && agent === 'snippets' && action === 'apply-changes' && data.snippet in actionData.update) {
                var snippet = actionData.update[data.snippet],
                    id;

                if (snippet.container) {
                    throw new Error('Dialogs from dynamic snippets aren\'t supported');
                }

                delete actionData.update[data.snippet];

                for (id in actionData.remove) {
                    if (actionData.remove.hasOwnProperty(id) && actionData.remove[id].isDescendant && DOM.contains(snippet.element, actionData.remove[id].element)) {
                        delete actionData.remove[id];

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
