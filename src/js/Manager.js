_context.invoke('Nittro.Extras.Dialogs', function (Dialog, IFrameDialog, DOM) {

    var Manager = _context.extend('Nittro.Object', function(baseZ) {
        Manager.Super.call(this);

        this._.registry = {};
        this._.stack = [];
        this._.zIndex = baseZ || 1000;

        this._handleShow = this._handleShow.bind(this);
        this._handleHide = this._handleHide.bind(this);
        this._handleDestroy = this._handleDestroy.bind(this);

    }, {
        createDialog: function (name, options) {
            var dlg = new Dialog(name, options);
            this._setup(dlg);
            return dlg;
        },

        createIFrameDialog: function (name, url, options) {
            var dlg = new IFrameDialog(name, url, options);
            this._setup(dlg);
            return dlg;
        },

        hasOpenDialog: function () {
            return this._.stack.length > 0;
        },

        getTopmostOpenDialog: function () {
            return this._.stack.length ? this._.stack[0] : null;
        },

        getOpenDialogs: function () {
            return this._.stack.slice();
        },

        getDialog: function (name) {
            return this._.registry[name] || null;
        },

        registerDialog: function (dialog) {
            if (dialog.getName() in this._.registry) {
                throw new Error('A dialog named "' + dialog.getName() + '" already exists');
            }

            this._.registry[dialog.getName()] = dialog;
            return this;
        },

        unregisterDialog: function (name) {
            if (name in this._.registry) {
                delete this._.registry[name];
            }

            return this;
        },

        _setup: function (dialog) {
            this.registerDialog(dialog);
            dialog.on('show', this._handleShow);
            dialog.on('hide', this._handleHide);
            dialog.on('destroy', this._handleDestroy);
            this.trigger('setup', {dialog: dialog});
            document.body.appendChild(dialog.getElement());
        },

        _handleShow: function (evt) {
            if (this._.stack.length) {
                DOM.toggleClass(this._.stack[0].getElement(), 'topmost', false);
            }

            DOM.toggleClass(evt.target.getElement(), 'topmost', true);
            evt.target.getElement().style.zIndex = this._.zIndex + this._.stack.length;
            this._.stack.unshift(evt.target);
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
        },

        _handleDestroy: function (evt) {
            this.unregisterDialog(evt.target.getName());
        }
    });

    _context.register(Manager, 'Manager');

}, {
    DOM: 'Utils.DOM'
});
