

<!-- Start src\wysiwyg.js -->

## keys

A list of keybinds. Currently not modifiable.

## WYSIWYG

Creates a new WYSIWYG editor with the specified element

### Params:

* **lemen** *the* element to use. Can be Vanilla, jQuery, or Zapto

## handleClick(the)

Handles the click on an element.

### Params:

* **lemen** *the* element that was clicked

## exec(the)

Executes a command in the document, if it exists.

### Params:

* **ol** *the* role to execute

## resize()

Called when the window is resize.
Will possibly be used to make a better mobile tools bar.

## getHTML()

Returns the raw HTML of the editor

### Return:

* **string|document.getElementById.innerHTML** 

## onChange()

Abstract.
Called when the editor is changed.

<!-- End src\wysiwyg.js -->

