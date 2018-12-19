_context.invoke('Nittro.Extras.Dialogs', function(Dialog, DOM, Arrays) {

    var FormDialog = _context.extend(Dialog, function(name, options, form) {
        FormDialog.Super.call(this, name, options);

        this._.form = null;

        this.on('button', this._handleButton.bind(this));

        if (this._.options.autoFocus) {
            this.on('shown', this._autoFocus.bind(this));
        }

        if (this._.options.resetOnHide) {
            this.on('hidden', this._autoReset.bind(this));
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
                this._.tabContext.clear().addFromContainer(form.getElement(), false, 0);
            }

            return this;
        },

        setValues: function(values) {
            this._.form.setValues(values);
            return this;
        },

        reset: function() {
            this._.form && this._.form.reset();
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
            if (this._.form) {
                try {
                    for (var elems = this._.form.getElements(), i = 0, n = elems.length; i < n; i++) {
                        if (!/^(?:button|submit|reset|hidden)$/i.test(elems.item(i).type || '') && elems.item(i).tabIndex >= 0) {
                            elems.item(i).focus();
                            break;
                        }
                    }
                } catch (e) { /* noop */ }
            }
        },

        _autoReset: function () {
            if (this._.form && this._.form.getElement() && DOM.getData(this._.form.getElement(), 'reset', true)) {
                this.reset();
            }
        }
    });

    _context.register(FormDialog, 'FormDialog');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
