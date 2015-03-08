(function (global) {

    /**
     * A list of keybinds. Currently not modifiable.
     * @type {{undo: string, redo: string, bold: string, italic: string, underline: string, strikeThrough: string, justifyLeft: string[], justifyCenter: string[], justifyRight: string[], justifyFull: string[], indent: {control: boolean, keys: string[]}, outdent: {control: boolean, keys: *[]}, insertUnorderedList: string, insertOrderedList: string, h1: string, h2: string, h3: string, h4: string, h5: string, p: string, subscript: string, superscript: string}}
     */
    var keys = {
        'undo': 'z',
        'redo': 'y',
        'bold': 'b',
        'italic': 'i',
        'underline': 'u',
        'strikeThrough': 's',
        'justifyLeft': [
            'arrowleft',
            'left'
        ],
        'justifyCenter': [
            'arrowup',
            'up'
        ],
        'justifyRight': [
            'arrowright',
            'right'
        ],
        justifyFull: [
            'arrowdown',
            'down'
        ],
        'indent': {
            control: false,
            keys: [
                'tab'
            ]
        },
        'outdent': {
            control: false,
            keys: [
                [
                    'tab',
                    'shift'
                ]
            ]
        },
        'insertUnorderedList': 'u',
        'insertOrderedList': 'o',
        'h1': '1',
        'h2': '2',
        'h3': '3',
        'h4': '4',
        'h5': '5',
        'p': 'p',
        'subscript': 'e',
        'superscript': 'r'
    };

    var customRoles = {
        image: function imageRole(object) {
            var selection = object.getSelection();
            if (!selection) {
                console.error('We do not currently support this browser.');
                return;
            }
            var container = object.getSelection().startContainer;
            var image = new Image();
            image.onload = function () {
                var nodes = object.element.childNodes;
                var length = nodes.length;
                while (length--) {
                    var node = nodes[length];
                    if (node == container) {
                        container.parentNode.insertBefore(image, container);
                        return;
                    }
                }
                object.element.appendChild(image);
            };
            image.onerror = function () {
                alert('Invalid image!');
            };
            image.src = prompt('Please enter image URL');
        }
        /* fixme - nodes get appended weirdly, and we need to be able to undo links
        ,
        link: function linkRole(object) {
            var container = object.getSelection().startContainer;
            if (container.nodeName == 'A') {
                // we need to undo it
                return;
            }
            var link = document.createElement('a');
            link.href = prompt('Please enter link URL');
            link.appendChild(container);
            var nodes = object.element.childNodes;
            var length = nodes.length;
            while (length--) {
                var node = nodes[length];
                if (node == container) {
                    container.parentNode.insertBefore(link, container);
                    return;
                }
            }
            object.element.appendChild(link);
            console.log(object.getSelection());
        }*/
    };

    /**
     * Creates a new WYSIWYG editor with the specified element
     * @param element the element to use. Can be Vanilla, jQuery, or Zapto
     * @constructor
     */
    function WYSIWYG(element) {
        var $this = this;
        if (typeof element == 'string') {
            element = document.querySelector(element);
        } else if (element instanceof jQuery || element instanceof Zapto) {
            element = element.get(0);
        }
        if (!element) {
            throw new Error('Element must be supplied.');
        }
        element.setAttribute('contenteditable', '');
        element.style.wordWrap = 'break-word';
        this.element = element;
        this.bars = [];

        var elements = document.getElementsByClassName('wysiwyg-bar');
        var length = elements.length;
        while (length--) {
            var testing = elements[length];
            var target = testing.getAttribute('data-target');
            if ((target.indexOf('.') == 0 && element.classList.contains(target.substr(1, target.length))) ||
                (target.indexOf('#') == 0 && element.getAttribute('id') == target.substr(1, target.length)) ||
                (element.getAttribute('id') == target)) {
                var children = testing.getElementsByClassName('role');
                var using = [];
                var childLength = children.length;
                while (childLength--) {
                    var node = children[childLength];
                    if (node.getAttribute('data-role')) {
                        using.push(node);
                        node.addEventListener('click', function (e) {
                            $this.handleClick(this);
                            e.preventDefault();
                            return false;
                        }, false);
                    }
                }
                this.bars.push({
                    parent: testing,
                    children: using
                });
            }
        }

        var previous;
        setInterval(function () {
            var current = $this.getHTML();
            if (current != previous) {
                previous = current;
                $this.onChange();
            }
        }, 10);

        if (window && this.bars.length > 0) {
            window.addEventListener('resize', function () {
                $this.resize();
            }, false);
            this.resize();
        }

        element.addEventListener('keydown', function (e) {
            if (!e.key || e.key == "Shift") {
                return;
            }
            for (var property in keys) {
                if (keys.hasOwnProperty(property)) {
                    var value = keys[property];
                    if (e.ctrlKey && !e.shiftKey) {
                        if (typeof value == 'string' && value == e.key.toLowerCase()) {
                            $this.exec(property);
                            return !!e.preventDefault();
                        } else if (Array.isArray(value) && value.indexOf(e.key.toLowerCase()) > -1) {
                            $this.exec(property);
                            return !!e.preventDefault();
                        }
                    } else if (value && typeof value == 'object') {
                        if (!value.control || e.ctrlKey) {
                            var possible = value.keys;
                            for (var i = 0; i < possible.length; i++) {
                                var possiblity = possible[i];
                                if (typeof possiblity == 'string' && possiblity == e.key.toLowerCase() && !e.shiftKey) {
                                    $this.exec(property);
                                    return !!e.preventDefault();
                                } else if (possiblity.indexOf('shift') > -1 && possiblity.indexOf(e.key.toLowerCase()) > -1 && e.shiftKey) {
                                    $this.exec(property);
                                    return !!e.preventDefault();
                                }
                            }
                        }
                    }
                }
            }
        }, false);
    }

    /**
     * Handles the click on an element.
     * @param element the element that was clicked
     */
    WYSIWYG.prototype.handleClick = function (element) {
        if (!element || !element.getAttribute('data-role')) {
            return;
        }
        var role = element.getAttribute('data-role');
        this.exec(role);
    };

    /**
     * Executes a command in the document, if it exists.
     * @param role the role to execute
     */
    WYSIWYG.prototype.exec = function (role) {
        var format;
        switch (role) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'p':
                format = role;
                role = 'formatBlock';
                break;
        }
        if (customRoles[role] && window) {
            var custom = customRoles[role];
            custom(this);
        } else if (global.document && global.document.execCommand) {
            global.document.execCommand(role, false, format || null);
        } else {
            // todo, fallback?
        }
    };

    /**
     * Called when the window is resized.
     * Will possibly be used to make a better mobile tools bar.
     */
    WYSIWYG.prototype.resize = function () {
        for (var i = 0; i < this.bars.length; i++) {
            var bar = this.bars[i];
            var buttons = bar.children;
            var totalWidth = 0;
            var length = buttons.length;
            while (length--) {
                totalWidth += buttons[length].offsetWidth;
            }
            if (totalWidth > bar.parent.offsetWidth) {
                // todo better mobile support
            }
        }
    };

    WYSIWYG.prototype.getSelection = function () {
        if (global.getSelection) {
            var selection = global.getSelection();
            if (selection.rangeCount) {
                return selection.getRangeAt(0);
            }
        }
    };

    /**
     * Returns the raw HTML of the editor
     * @returns {string|document.getElementById.innerHTML|*}
     */
    WYSIWYG.prototype.getHTML = function () {
        return this.element.innerHTML;
    };

    /**
     * Abstract.
     * Called when the editor is changed.
     */
    WYSIWYG.prototype.onChange = function () {

    };

    /**
     * Adds a role that can be used in the menu bar.
     * @param name the name of the role
     * @param method the method to be called
     */
    WYSIWYG.addRole = function (name, method) {
        if (typeof method == "function") {
            customRoles[name] = method;
        } else {
            throw new Error('Invalid method type "' + (typeof method) + '"!');
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = WYSIWYG; // node and stuff
    } else if (typeof define !== 'undefined') {
        define({
            WYSIWYG: WYSIWYG // am I doing this right?
        });
    } else if (global) {
        global.WYSIWYG = WYSIWYG; // other stuff
    }

})(this);