# Contacts Widget For PhoneGap

The contacts widget is a widget that enables PhoneGap native contacts functionality within your Mendix mobile application.
This is a widget that will be functional from Mendix 5.10.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Configuration

Place the widget in a dataview where you want the button to be placed. Make sure this form is reachable from a mobile application.

### Behavior
#### Contact type
This option let's you switch the widget between 'Retrieve Contact' and 'Create Contact'.

### Button
#### Label
The label text that is shown on the button.

#### Class
An optional class to be placed directly on the button dom node.

### Data source
#### Attributes
All these attributes are the mapping between your application and the mobile contact.

### Events
#### Contact added success
An optional microflow that will be triggered once contact has been added successfully to the phone.