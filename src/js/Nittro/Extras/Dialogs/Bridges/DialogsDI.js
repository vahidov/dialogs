_context.invoke('Nittro.Extras.Dialogs.Bridges', function(Nittro) {

    if (!Nittro.DI) {
        return;
    }

    var DialogsDI = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        DialogsDI.Super.call(this, containerBuilder, config);
    }, {
        load: function() {
            this._getContainerBuilder().addFactory('formDialog', 'Nittro.Extras.Dialogs.FormDialog()');
        }
    });

    _context.register(DialogsDI, 'DialogsDI')

});
