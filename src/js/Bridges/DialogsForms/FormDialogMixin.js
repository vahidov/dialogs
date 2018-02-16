_context.invoke('Nittro.Extras.Dialogs.Bridges.DialogsForms', function (Manager, FormDialog) {

    var FormDialogMixin = {
        setFormLocator: function (formLocator) {
            this._.formLocator = formLocator;
            return this;
        },

        createFormDialog: function (name, options) {
            var dlg = new FormDialog(name, options);
            this._setup(dlg);

            dlg.on('destroy', this._removeDialogForm.bind(this));

            var frm = dlg.getContent().getElementsByTagName('form').item(0);
            frm && dlg.setForm(this._.formLocator.getForm(frm));

            return dlg;
        },

        _removeDialogForm: function (evt) {
            this._.formLocator.removeForm(evt.target.getForm().getElement());
            evt.target.setForm(null);
        }
    };

    _context.mixin(Manager, FormDialogMixin);

}, {
    Manager: 'Nittro.Extras.Dialogs.Manager',
    FormDialog: 'Nittro.Extras.Dialogs.FormDialog'
});
