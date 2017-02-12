_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsForms', function (Manager, FormDialog) {

    var FormDialogMixin = {
        setFormLocator: function (formLocator) {
            this._.formLocator = formLocator;
            return this;
        },

        createFormDialog: function (options) {
            var dlg = new FormDialog(options);
            this._setup(dlg);

            dlg.on('destroy', this._removeDialogForm.bind(this));

            var frm = dlg.getContent().getElementsByTagName('form').item(0);
            dlg.setForm(this._.formLocator.getForm(frm));

            return dlg;
        },

        _removeDialogForm: function (evt) {
            this._.formLocator.removeForm(evt.target.getForm().getElement());
        }
    };

    _context.mixin(Manager, FormDialogMixin);

}, {
    Manager: 'Nittro.Extras.Dialogs.Manager',
    FormDialog: 'Nittro.Extras.Dialogs.FormDialog'
});
