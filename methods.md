<!-- Start src\wysiwyg.js -->

## WYSIWYG

Creates a new WYSIWYG editor with the specified element

### Params:

* **element** the element to use. Can be Vanilla, jQuery, or Zapto

## handleClick(element)

Handles the click on an element.

### Params:

* **element** the element that was clicked

## exec(the)

Executes a command in the document, if it exists.

### Params:

* **role** the role to execute

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

