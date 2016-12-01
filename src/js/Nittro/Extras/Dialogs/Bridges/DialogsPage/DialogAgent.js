_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsPage', function (Dialog, FormDialog, DOM) {

    var DialogAgent = _context.extend('Nittro.Object', function () {
        DialogAgent.Super.call(this);
        this._.formLocator = null;

    }, {
        setFormLocator: function (formLocator) {
            this._.formLocator = formLocator;
        },

        init: function (transaction, context) {
            var element = context.element,
                snippet,
                data = {};

            if (element && (snippet = DOM.getData(element, 'dialog'))) {
                data.snippet = snippet;
                data.form = DOM.getData(element, 'form');
            }

            return data;
        },

        dispatch: function (transaction, data) {

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

                this._openDialog(snippet.content, data.form);

            }
        },

        _openDialog: function (content, form) {
            var options = {},
                children = DOM.getChildren(content),
                dialog;

            if (children.length < 1 || children.length > 2) {
                throw new Error('Invalid dialog content: must have 1 or 2 element child nodes');
            }

            options.content = children.shift();

            if (children.length) {
                options.buttons = children.shift();
            } else {
                options.buttons = null;
            }

            dialog = form ? new FormDialog(options, this._.formLocator) : new Dialog(options);
            dialog.show();

            dialog.one('hide', function () {
                window.setTimeout(dialog.destroy.bind(dialog), 1000);
            });

        }
    });

    _context.register(DialogAgent, 'DialogAgent');

}, {
    DOM: 'Utils.DOM',
    Dialog: 'Nittro.Extras.Dialogs.Dialog',
    FormDialog: 'Nittro.Extras.Dialogs.FormDialog'
});
