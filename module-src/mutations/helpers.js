/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global NodeCollection:true */

var applyFilter, processAddedNodesWithReplace, processAddedNodesWithoutReplace, processRemovedNodesWithReplace,
    processRemovedNodesWithoutReplace, processMutationCallbacks;

/**
 * Applies an array of filter callbacks
 *
 * @param {array} callbacks The array of callbacks to apply
 * @param {array} args      And array of arguments to pass to the callbacks
 *
 * @return {boolean} The result of the callbacks
 */
applyFilter = function(callbacks, args)
{
    var i, l, result = true;
    args = args instanceof Array ? args : [args];

    for (i = 0, l = callbacks.length; i < l; i++) {
        try {
            result = callbacks[i].apply(null, args);

            if (result === false) {
                result = false;
                break;
            } else if (typeof result === 'object' && result.length !== undefined) {
                break;
            }
        } catch(e) {
            result = false;
            break;
        }
    }

    return result;
};

/**
 * Iterate over all added nodes in a mutation and categorise them as appropriate
 *
 * Takes into account nodes that have been replaced on the DOM based on the filtercompare event
 *
 * @param {array}  mutation The mutation being processed
 * @param {object} nodes    Map of NodeList objects representing the event categories
 */
processAddedNodesWithReplace = function(addedNodes, nodes)
{
    var i, j, newNode, oldNode, filterResult;

    for (i = 0; addedNodes[i] !== undefined; i++) {
        newNode = addedNodes[i];
        oldNode = null;

        for (j = 0; this.callbacks.filtercompare[j] !== undefined; j++) {
            oldNode = nodes.removed.find(newNode, this.callbacks.filtercompare[j]);

            if (oldNode !== null) {
                break;
            }
        }

        if (oldNode !== null) {
            nodes.removed.remove(oldNode);

            if (applyFilter(this.callbacks.filterreplaced, [oldNode, newNode])) {
                nodes.replaced.push([oldNode, newNode]);
            }
        } else {
            filterResult = applyFilter(this.callbacks.filteradded, newNode);

            if (typeof filterResult === 'object') {
                for (j = 0; filterResult[j] !== undefined; j++) {
                    nodes.added.push(filterResult[j]);
                }
            } else if (filterResult) {
                nodes.added.push(newNode);
            }
        }
    }
};

/**
 * Iterate over all added nodes in a mutation and categorise them as appropriate
 *
 * @param {array}  mutation The mutation being processed
 * @param {object} nodes    Map of NodeList objects representing the event categories
 */
processAddedNodesWithoutReplace = function(addedNodes, nodes)
{
    var i, j, filterResult;

    for (i = 0; addedNodes[i] !== undefined; i++) {
        filterResult = applyFilter(this.callbacks.filteradded, addedNodes[i]);

        if (typeof filterResult === 'object') {
            for (j = 0; filterResult[j] !== undefined; j++) {
                nodes.added.push(filterResult[j]);
            }
        } else if (filterResult) {
            nodes.added.push(addedNodes[i]);
        }
    }
};

/**
 * Iterate over all removed nodes in a mutation and categorise them as appropriate
 *
 * Takes into account nodes that have been replaced on the DOM based on the filtercompare event
 *
 * @param {array}  mutation The mutation being processed
 * @param {object} nodes    Map of NodeList objects representing the event categories
 */
processRemovedNodesWithReplace = function(removedNodes, nodes)
{
    var i, j, newNode, oldNode, filterResult;

    for (i = 0; removedNodes[i] !== undefined; i++) {
        oldNode = removedNodes[i];
        newNode = null;
    
        for (j = 0; this.callbacks.filtercompare[j] !== undefined; j++) {
            newNode = nodes.added.find(oldNode, this.callbacks.filtercompare[j]);

            if (newNode !== null) {
                break;
            }
        }

        if (newNode !== null) {
            nodes.added.remove(newNode);

            if (applyFilter(this.callbacks.filterreplaced, [oldNode, newNode])) {
                nodes.replaced.push([oldNode, newNode]);
            }
        } else {
            filterResult = applyFilter(this.callbacks.filterremoved, oldNode);
    
            if (typeof filterResult === 'object') {
                for (j = 0; filterResult[j] !== undefined; j++) {
                    nodes.removed.push(filterResult[j]);
                }
            } else if (filterResult) {
                nodes.removed.push(oldNode);
            }
        }
    }
};

/**
 * Iterate over all removed nodes in a mutation and categorise them as appropriate
 *
 * @param {array}  mutation The mutation being processed
 * @param {object} nodes    Map of NodeList objects representing the event categories
 */
processRemovedNodesWithoutReplace = function(removedNodes, nodes)
{
    var i, j, filterResult;
    
    for (i = 0; removedNodes[i] !== undefined; i++) {
        filterResult = applyFilter(this.callbacks.filterremoved, removedNodes[i]);
    
        if (typeof filterResult === 'object') {
            for (j = 0; filterResult[j] !== undefined; j++) {
                nodes.removed.push(filterResult[j]);
            }
        } else if (filterResult) {
            nodes.removed.push(removedNodes[i]);
        }
    }
};

/**
 * Trigger callbacks for the processed node lists
 *
 * @param {object} nodes Map of NodeList objects representing the event categories
 */
processMutationCallbacks = function(nodes)
{
    var args, i;

    while (nodes.added.length) {
        args = nodes.added.shift();

        for (i = 0; this.callbacks.nodeadded[i] !== undefined; i++) {
            this.callbacks.nodeadded[i].call(null, args);
        }
    }

    while (nodes.removed.length) {
        args = nodes.removed.shift();

        for (i = 0; this.callbacks.noderemoved[i] !== undefined; i++) {
            this.callbacks.noderemoved[i].call(null, args);
        }
    }

    while (nodes.replaced.length) {
        args = nodes.replaced.shift();

        for (i = 0; this.callbacks.nodereplaced[i] !== undefined; i++) {
            this.callbacks.nodereplaced[i].apply(null, args);
        }
    }
};
