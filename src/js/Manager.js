_context.invoke('Nittro.Extras.Dialogs', function (Dialog, FormDialog, DOM) {

    var Manager = _context.extend(function() {
        this._ = {
            stack: [],
            formLocator: null,
            keymapManager: null,
            zIndex: 1000
        };

        this._handleShow = this._handleShow.bind(this);
        this._handleHide = this._handleHide.bind(this);
        this._handleDestroy = this._handleDestroy.bind(this);

    }, {
        setFormLocator: function (formLocator) {
            this._.formLocator = formLocator;
            return this;
        },

        setKeymapManager: function (keymapManager) {
            this._.keymapManager = keymapManager;
            return this;
        },

        createDialog: function (options) {
            var dlg = new Dialog(options);
            this._setup(dlg);
            return dlg;
        },

        createFormDialog: function (options) {
            var dlg = new FormDialog(options);
            this._setup(dlg);

            var frm = dlg.getContent().getElementsByTagName('form').item(0);
            dlg.setForm(this._.formLocator.getForm(frm));

            return dlg;
        },

        hasOpenDialog: function () {
            return this._.stack.length > 0;
        },

        getTopmostOpenDialog: function () {
            return this._.stack.length ? this._.stack[0] : null;
        },

        _setup: function (dialog) {
            dialog.on('show', this._handleShow);
            dialog.on('hide', this._handleHide);
            dialog.on('destroy', this._handleDestroy);
            document.body.appendChild(dialog.getElement());
        },

        _handleShow: function (evt) {
            if (this._.stack.length) {
                DOM.toggleClass(this._.stack[0].getElement(), 'topmost', false);
            }

            DOM.toggleClass(evt.target.getElement(), 'topmost', true);
            evt.target.getElement().style.zIndex = this._.zIndex + this._.stack.length;
            this._.stack.unshift(evt.target);

            if (this._.keymapManager && evt.target.getKeyMap()) {
                this._.keymapManager.push(evt.target.getKeyMap());
            }
        },

        _handleHide: function (evt) {
            DOM.toggleClass(evt.target.getElement(), 'topmost', false);

            var index = this._.stack.indexOf(evt.target);

            if (index > -1) {
                this._.stack.splice(index, 1);
            }

            if (this._.stack.length) {
                DOM.toggleClass(this._.stack[0].getElement(), 'topmost', true);
            }

            if (this._.keymapManager && evt.target.getKeyMap()) {
                this._.keymapManager.pop(evt.target.getKeyMap());
            }
        },

        _handleDestroy: function (evt) {
            if (evt.target instanceof FormDialog) {
                this._.formLocator.removeForm(evt.target.getForm().getElement());
            }
        }
    });

    _context.register(Manager, 'Manager');

}, {
    DOM: 'Utils.DOM'
});
