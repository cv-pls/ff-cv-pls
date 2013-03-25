/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global NodeCollection:true */

/**
 * Holds an ordered list of nodes
 */
(function() {
    /**
     * Constructor
     */
    NodeCollection = function()
    {
        this.nodes = [];
    };

    /**
     * @var {array} The items in the collection
     */
    NodeCollection.prototype.nodes = 0;

    /**
     * @var {integer} The number of items in the collection
     */
    NodeCollection.prototype.length = 0;

    /**
     * Push an item on to the end of the collection
     *
     * @param {DOMNode} node The element to push onto the collection
     *
     * @return {DOMNode} The pushed node for method chaining
     */
    NodeCollection.prototype.push = function(node)
    {
        this.nodes.push(node);
        this.length = this.nodes.length;
        return node;
    };

    /**
     * Shift an item off the beginning of the collection
     *
     * @return {DOMNode} The shifted node
     */
    NodeCollection.prototype.shift = function()
    {
        var result = this.nodes.shift();
        this.length = this.nodes.length;

        return result;
    };

    /**
     * Remove a specific item from the collection
     *
     * @param {DOMNode} node The item to remove
     *
     * @return {DOMNode} The removed item for method chaining
     */
    NodeCollection.prototype.remove = function(node)
    {
        if (this.nodes.indexOf(node) > -1) {
            this.nodes.splice(this.nodes.indexOf(node), 1);
            this.length = this.nodes.length;
        }

        return node;
    };

    /**
     * Find the first node that matches a callback criteria
     *
     * @param {DOMNode}  node     Base DOM node for comparison
     * @param {function} callback Callback function for comparison
     *
     * @return {DOMNode} The matched element or null if no match found
     */
    NodeCollection.prototype.find = function(node, callback)
    {
        var i, l;

        if (typeof callback === 'function') {
            for (i = 0, l = this.nodes.length; i < l; i++) {
                try {
                    if (callback.call(null, node, this.nodes[i])) {
                        return this.nodes[i];
                    }
                } catch(e) {}
            }
        }

        return null;
    };
}());
