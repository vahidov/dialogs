_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsDI', function() {

    var DialogsExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        DialogsExtension.Super.call(this, containerBuilder, config);
    }, {
        setup: function() {
            var builder = this._getContainerBuilder(),
                hasLocator = false;

            if (builder.hasServiceDefinition('formLocator')) {
                builder.addFactory('formDialog', 'Nittro.Extras.Dialogs.FormDialog()');
                hasLocator = true;
            }

            if (builder.hasServiceDefinition('page')) {
                builder.addServiceDefinition('dialogAgent', 'Nittro.Extras.Dialogs.Bridges.DialogsPage.DialogAgent()');

                if (hasLocator) {
                    builder.getServiceDefinition('dialogAgent')
                        .addSetup('::setFormLocator');
                }

                builder.getServiceDefinition('page')
                    .addSetup(function (dialogAgent) {
                        this.on('transaction-created', function (evt) {
                            evt.data.transaction.add('dialogAgent', dialogAgent);
                        });
                    });
            }
        }
    });

    _context.register(DialogsExtension, 'DialogsExtension')

});
