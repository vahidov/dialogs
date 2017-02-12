_context.invoke('Nittro.Extras.Dialogs', function(Dialog, DOM, Arrays) {

    var FormDialog = _context.extend(Dialog, function(options, form) {
        FormDialog.Super.call(this, options);

        this.on('button', this._handleButton.bind(this));

        if (this._.options.autoFocus) {
            this.on('show', this._autoFocus.bind(this));

        }

        if (form) {
            this.setForm(form);
        }
    }, {
        STATIC: {
            defaults: {
                classes: 'nittro-dialog-form',
                hideOnSuccess: true,
                autoFocus: true
            },
            setDefaults: function(defaults) {
                Arrays.mergeTree(FormDialog.defaults, defaults);

            }
        },

        setForm: function (form) {
            this._.form = form;
            this._.elms.form = form.getElement();
            DOM.addListener(this._.elms.form, 'submit', this._handleSubmit.bind(this));

            if (this._.tabContext) {
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

        _handleSubmit: function(evt) {
            if (!evt.defaultPrevented) {
                if (this._.options.hideOnSuccess) {
                    this.hide();

                }

                this.trigger('success');

            }
        },

        _handleButton: function(evt) {
            if (evt.data.action === 'submit') {
                evt.preventDefault();
                this._.form.submit();

            } else {
                this._.form.reset();

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
