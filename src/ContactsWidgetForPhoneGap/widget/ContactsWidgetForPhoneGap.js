define([
    "mxui/widget/_WidgetBase", "mxui/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/_base/lang",
    "dojo/_base/declare"
], function(_WidgetBase, mxuiDom, dojoClass, dojoConstruct, dojoLang, declare) {
    "use strict";

    return declare("ContactsWidgetForPhoneGap.widget.ContactsWidgetForPhoneGap", _WidgetBase, {

        // internal variables.
        _button: null,
        _hasStarted: false,
        _obj: null,
        _imgNode: null,

        // Externally executed mendix function to create widget.
        startup: function() {
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

        update: function(obj, callback) {
            this._obj = obj;
            callback && callback();
        },

        // Setup
        _setupWidget: function() {
            // Set class for domNode
            dojoClass.add(this.domNode, "wx-ContactsWidgetForPhoneGap-container");

            // Empty domnode of this and appand new input
            dojoConstruct.empty(this.domNode);
        },

        // Internal event setup.
        _setupEvents: function() {
            // Attach only one event to dropdown list.
            this.connect(this._button, "click", dojoLang.hitch(this, function(evt) {
                if (!navigator.contacts) {
                    mx.ui.error("Unable to detect contact PhoneGap functionality.");
                    return;
                }
                if (this.getOrCreate === "retrieve") {
                    navigator.contacts.pickContact(dojoLang.hitch(this, this._selectContactSuccess), dojoLang.hitch(this, this._contactFailure));
                } else
                    this._createContact();
            }));
        },

        _createContact: function() {
            // create a new contact object
            var contact = navigator.contacts.create();
            var name = this._obj.get(this.displaynameAttr);
            contact.displayName = name;
            contact.nickname = name;    // specify both to support all devices
            contact.name = {};
            contact.name.givenName = this._obj.get(this.firstnameAttr);
            contact.name.middleName = this._obj.get(this.middlenameAttr);
            contact.name.familyName = this._obj.get(this.lastnameAttr);

            // populate some fields
            var phoneNumbers = [ new ContactField("work", this._obj.get(this.phonenumberAttr), true) ];
            contact.phoneNumbers = phoneNumbers;
            contact.emails = [ new ContactField("work", this._obj.get(this.emailAttr), true) ];

            // save to device
            contact.save(dojoLang.hitch(this, this._createContactSuccess), dojoLang.hitch(this, this._contactFailure));
        },

        _createContactSuccess: function() {
            this._executeMicroflow(this.contactSuccessMf);
        },

        _selectContactSuccess: function(contact) {
            if (contact.photos && contact.photos[0]) {
                this._imgNode.src = contact.photos[0].value;
                mxuiDom.show(this._imgNode);
            } else {
                mxuiDom.hide(this._imgNode);
            }

            var email = contact.emails && contact.emails[0].value;
            var name = contact.displayName || contact.nickname || contact.name.formatted;
            var phonenr = contact.phoneNumbers && contact.phoneNumbers[0].value;

            if (name)
                this._obj.set(this.displaynameAttr, name);

            if (contact.name.givenName && this.firstnameAttr)
                this._obj.set(this.firstnameAttr, contact.name.givenName);

            if (contact.name.familyName && this.lastnameAttr)
                this._obj.set(this.lastnameAttr, contact.name.familyName);

            if (contact.name.middleName && this.middlenameAttr)
                this._obj.set(this.middlenameAttr, contact.name.middleName);

            if (email)
                this._obj.set(this.emailAttr, email);

            if (phonenr)
                this._obj.set(this.phonenumberAttr, phonenr);
        },

        _contactFailure: function(error) {
            switch (error.code) {
                case 0 :
                    window.alert("Found an unknown error while handling the request.");
                    break;
                case 1 :
                    window.alert("Invalid argument found.");
                    break;
                case 2 :
                    window.alert("Operation timed out.");
                    break;
                case 3 :
                    window.alert("Pending operation error.");
                    break;
                case 4 :
                    window.alert("IO error encountered.");
                    break;
                case 5 :
                    window.alert("Operation not supported.");
                    break;
                case 20 :
                    window.alert("Permission denied.");
                    break;
                default : break;
            }
        },

        _executeMicroflow: function(mf) {
            if (mf && this._obj) {
                mx.processor.xasAction({
                    error: function() {},
                    actionname: mf,
                    applyto: "selection",
                    guids: [ this._obj.getGuid() ]
                });
            }
        },

        _createChildnodes: function() {
            // Placeholder container
            this._button = mxuiDom.div({ "class": "wx-ContactsWidgetForPhoneGap-button btn btn-primary" }, this.buttonLabel);
            if (this.buttonClass)
                dojoClass.add(this._button, this.buttonClass);

            this._imgNode = mxuiDom.img({ "width": "64px", "height": "64px" });
            mxuiDom.hide(this._imgNode);

            // Add to wxnode
            this.domNode.appendChild(this._button);
            this.domNode.appendChild(this._imgNode);
        }
    });
});

// Compatibility with older mendix versions.
require([ "ContactsWidgetForPhoneGap/widget/ContactsWidgetForPhoneGap" ], function() {});