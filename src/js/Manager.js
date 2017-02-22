_context.invoke('Nittro.Extras.Dialogs', function (Dialog, DOM) {

    var Manager = _context.extend('Nittro.Object', function(baseZ) {
        Manager.Super.call(this);

        this._.stack = [];
        this._.zIndex = baseZ || 1000;

        this._handleShow = this._handleShow.bind(this);
        this._handleHide = this._handleHide.bind(this);

    }, {
        createDialog: function (options) {
            var dlg = new Dialog(options);
            this._setup(dlg);
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
        }
    });

    _context.register(Manager, 'Manager');

}, {
    DOM: 'Utils.DOM'
});
