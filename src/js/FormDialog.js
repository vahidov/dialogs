_context.invoke('Nittro.Extras.Dialogs', function(Dialog, DOM, Arrays) {

    var FormDialog = _context.extend(Dialog, function(name, options, form) {
        FormDialog.Super.call(this, name, options);

        this._.form = null;

        this.on('button', this._handleButton.bind(this));

        if (this._.options.autoFocus) {
            this.on('shown', this._autoFocus.bind(this));
        }

        if (this._.options.resetOnHide) {
            this.on('hidden', this.reset.bind(this));
        }

        if (form) {
            this.setForm(form);
        }
    }, {
        STATIC: {
            defaults: {
                classes: 'nittro-dialog-form',
                resetOnHide: true,
                autoFocus: true
            },
            setDefaults: function(defaults) {
                Arrays.mergeTree(FormDialog.defaults, defaults);
            }
        },

        setForm: function (form) {
            this._.form = form;

            if (form && this._.tabContext) {
                this._.tabContext.addFromContainer(form.getElement(), false, 0);
            }

            return this;
        },

        setValues: function(values) {
            this._.form.setValues(values);
            return this;
        },

        reset: function() {
            this._.form.reset();
            return this;
        },

        getForm: function() {
            return this._.form;
        },

        _handleButton: function(evt) {
            if (evt.data.action === 'submit') {
                evt.preventDefault();
                this._.form.submit();
            }
        },

        _autoFocus: function () {
            try {
                this._.form.getElements().item(0).focus();

            } catch (e) { /* noop */ }
        }
    });

    _context.register(FormDialog, 'FormDialog');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
