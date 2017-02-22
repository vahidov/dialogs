_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsDI', function() {

    var DialogsExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        DialogsExtension.Super.call(this, containerBuilder, config);
    }, {
        STATIC: {
            defaults: {
                baseZ: 1000
            }
        },

        load: function () {
            var builder = this._getContainerBuilder(),
                config = this._getConfig(DialogsExtension.defaults);

            builder.addServiceDefinition('dialogManager', {
                factory: 'Nittro.Extras.Dialogs.Manager()',
                args: {
                    baseZ: config.baseZ
                }
            });

            builder.addFactory('dialog', '@dialogManager::createDialog()');
        },

        setup: function() {
            var builder = this._getContainerBuilder(),
                def = builder.getServiceDefinition('dialogManager');

            if (builder.hasServiceDefinition('formLocator')) {
                def.addSetup('::setFormLocator()');
                builder.addFactory('formDialog', '@dialogManager::createFormDialog()');
            }

            if (builder.hasServiceDefinition('keymapManager')) {
                def.addSetup('::setKeymapManager()');
            }

            if (builder.hasServiceDefinition('page')) {
                builder.addServiceDefinition('dialogAgent', 'Nittro.Extras.Dialogs.Bridges.DialogsPage.DialogAgent()');

                builder.getServiceDefinition('page')
                    .addSetup(function (dialogAgent) {
                        this.on('transaction-created', function (evt) {
                            dialogAgent.initTransaction(evt.data.transaction, evt.data.context);
                        });
                    });
            }
        }
    });

    _context.register(DialogsExtension, 'DialogsExtension')

});
