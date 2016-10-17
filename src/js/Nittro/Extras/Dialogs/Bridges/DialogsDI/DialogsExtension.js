_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsDI', function() {

    var DialogsExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        DialogsExtension.Super.call(this, containerBuilder, config);
    }, {
        load: function() {
            this._getContainerBuilder().addFactory('formDialog', 'Nittro.Extras.Dialogs.FormDialog()');
        }
    });

    _context.register(DialogsExtension, 'DialogsExtension')

});
