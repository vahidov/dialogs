_context.invoke(function (Manager) {

    var KeymapMixin = {
        setKeymapManager: function (keymapManager) {
            this._.keymapManager = keymapManager;
            this.on('setup', this._setupKeymap.bind(this));
            this._pushKeymap = this._pushKeymap.bind(this);
            this._popKeymap = this._popKeymap.bind(this);
            return this;
        },

        _setupKeymap: function (evt) {
            if (evt.data.dialog.getKeyMap()) {
                evt.data.dialog.on('show', this._pushKeymap);
                evt.data.dialog.on('hide', this._popKeymap);
            }
        },

        _pushKeymap: function (evt) {
            this._.keymapManager.push(evt.target.getKeyMap());
        },

        _popKeymap: function (evt) {
            this._.keymapManager.pop(evt.target.getKeyMap());
        }
    };

    _context.mixin(Manager, KeymapMixin);

}, {
    Manager: 'Nittro.Extras.Dialogs.Manager'
});
