_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsDI', function() {

    var DialogsExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        DialogsExtension.Super.call(this, containerBuilder, config);
    }, {
        STATIC: {
            defaults: {
                baseZ: 1000,
                whitelistHistory: true,
                disableDefaultTransitions: true
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
            builder.addFactory('iframeDialog', '@dialogManager::createIFrameDialog()');
        },

        setup: function() {
            var builder = this._getContainerBuilder(),
                config = this._getConfig(),
                def = builder.getServiceDefinition('dialogManager');

            if (builder.hasServiceDefinition('formLocator')) {
                def.addSetup('::setFormLocator()');
                builder.addFactory('formDialog', '@dialogManager::createFormDialog()');
            }

            if (builder.hasServiceDefinition('keymapManager')) {
                def.addSetup('::setKeymapManager()');
            }

            if (builder.hasServiceDefinition('page')) {
                builder.addServiceDefinition('dialogAgent', {
                    factory: 'Nittro.Extras.Dialogs.Bridges.DialogsPage.DialogAgent()',
                    args: {
                        options: {
                            whitelistHistory: config.whitelistHistory,
                            disableDefaultTransitions: config.disableDefaultTransitions
                        }
                    },
                    run: true
                });

                if (builder.hasServiceDefinition('formLocator')) {
                    builder.getServiceDefinition('dialogAgent')
                        .addSetup('::setFormLocator()');
                }
            }
        }
    });

    _context.register(DialogsExtension, 'DialogsExtension')

});
