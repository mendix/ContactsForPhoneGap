(function(){
    'use strict';

    dojo.provide('ContactsWidgetForPhoneGap.widget.ContactsWidgetForPhoneGap');
    
    dojo.declare('ContactsWidgetForPhoneGap.widget.ContactsWidgetForPhoneGap', mxui.widget._WidgetBase, {

        // internal variables.
        _button: null,
        _hasStarted: false,
        _obj: null,
        _imgNode: null,

        // Externally executed mendix function to create widget.
        startup: function () {
            if (this._hasStarted)
                return;

            this._hasStarted = true;

            // Setup widget
            this._setupWidget();

            // Create childnodes
            this._createChildnodes();

            // Setup events
            this._setupEvents();
        },

        update: function (obj, callback) {
            this._obj = obj;
            callback && callback();
        },

        // Setup
        _setupWidget: function () {
            // Set class for domNode
            dojo.addClass(this.domNode, 'wx-ContactsWidgetForPhoneGap-container');

            // Empty domnode of this and appand new input
            dojo.empty(this.domNode);
        },

        // Internal event setup.
        _setupEvents: function () {
            // Attach only one event to dropdown list.
            dojo.connect(this._button, "onclick", dojo.hitch(this, function (evt) {
                if (!navigator.contacts) {
                    mx.ui.error('Unable to detect contact PhoneGap functionality.');
                    return;
                }
                if (this.getOrCreate === 'retrieve') {
                    navigator.contacts.pickContact(dojo.hitch(this, this._selectContactSuccess), dojo.hitch(this, this._contactFailure));
                } else
                    this._createContact();
            }));
        },

        _createContact: function () {
            // create a new contact object
            var contact = navigator.contacts.create();
            var name = this._obj.get(this.displaynameAttr);
            contact.displayName = name;
            contact.nickname = name;    // specify both to support all devices

            // populate some fields
            var phoneNumbers = [];
            phoneNumbers[0] = new ContactField('work', this._obj.get(this.phonenumberAttr), true);
            contact.phoneNumbers = phoneNumbers;

            // save to device
            contact.save(dojo.hitch(this, this._createContactSuccess), dojo.hitch(this, this._contactFailure));
        },

        _createContactSuccess: function () {
            this._executeMicroflow(this.contactSuccessMf);
        },

        _selectContactSuccess: function (contact) {
            if (contact.photos[0]) {
                this._imgNode.src = contact.photos[0].value;
                mxui.dom.show(this._imgNode);
            } else {
                mxui.dom.hide(this._imgNode);
            }

            var email = contact.emails && contact.emails[0].value;
            var name = contact.displayName;
            var phonenr = contact.phoneNumbers && contact.phoneNumbers[0].value;

            this._obj.set(this.displaynameAttr, name);
            this._obj.set(this.emailAttr, email);
            this._obj.set(this.phonenumberAttr, phonenr);
        },

        _contactFailure: function (error) {
            switch (error.code) {
                case 0 :
                    window.alert('Found an unknown error while handling the request.');
                    break;
                case 1 :
                    window.alert('Invalid argument found.');
                    break;
                case 2 :
                    window.alert('Operation timed out.');
                    break;
                case 3 :
                    window.alert('Pending operation error.');
                    break;
                case 4 :
                    window.alert('IO error encountered.');
                    break;
                case 5 :
                    window.alert('Operation not supported.');
                    break;
                case 20 :
                    window.alert('Permission denied.');
                    break;
                default : break;
            }
        },

        _executeMicroflow: function (mf) {
            if (mf && this._obj) {
                mx.processor.xasAction({
                    error: function () {
                    },
                    actionname: mf,
                    applyto: 'selection',
                    guids: [this._obj.getGuid()]
                });
            }
        },

        _createChildnodes: function () {
            // Placeholder container
            this._button = mxui.dom.div({'class': 'wx-ContactsWidgetForPhoneGap-button btn btn-primary'}, this.buttonLabel);
            this._imgNode = mxui.dom.img({'width': '64px', 'height': '64px'});
            mxui.dom.hide(this._imgNode);

            // Add to wxnode
            this.domNode.appendChild(this._button);
            this.domNode.appendChild(this._imgNode);
        }
    });

}());
