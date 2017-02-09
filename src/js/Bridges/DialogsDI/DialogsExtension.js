_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsDI', function() {

    var DialogsExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        DialogsExtension.Super.call(this, containerBuilder, config);
    }, {
        load: function () {
            var builder = this._getContainerBuilder();

            builder.addServiceDefinition('dialogManager', 'Nittro.Extras.Dialogs.Manager()');
            builder.addFactory('dialog', '@dialogManager::createDialog()');
        },

        setup: function() {
            var builder = this._getContainerBuilder(),
                def = builder.getServiceDefinition('dialogManager');

            if (builder.hasServiceDefinition('formLocator')) {
                def.addSetup('::setFormLocator()');
                builder.addFactory('formDialog', '@dialogManager::createFormDialog()');
            }

            if (builder.hasServiceDefinition('page')) {
                builder.addServiceDefinition('dialogAgent', 'Nittro.Extras.Dialogs.Bridges.DialogsPage.DialogAgent()');

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
