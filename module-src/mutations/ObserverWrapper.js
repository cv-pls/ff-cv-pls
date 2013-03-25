/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global
    ObserverWrapper:true,
    NodeCollection,
    processAddedNodesWithReplace:false,
    processRemovedNodesWithReplace:false,
    processAddedNodesWithoutReplace:false,
    processRemovedNodesWithoutReplace:false,
    processMutationCallbacks:false
*/

/**
 * Wraps the mutation observer API
 */
(function() {
    /**
     * Constructor
     *
     * @param {DOMNode}                 element                  The element being observed
     * @param {MutationObserverFactory} mutationObserverFactory  Factory which makes MutationObserver objects
     */
    ObserverWrapper = function(element, mutationObserverFactory)
    {
        this.element = element;
    
        this.callbacks = {
            nodeadded:      [],
            noderemoved:    [],
            nodereplaced:   [],
            filteradded:    [],
            filterremoved:  [],
            filterreplaced: [],
            filtercompare:  []
        };
    
        this.mutationObserver = mutationObserverFactory.create(this.observerCallback.bind(this));
    };
    
    /**
     * @var {integer} Flag to indicate that the library uses the best available API
     */
    ObserverWrapper.prototype.LISTENER_TYPE_BEST = ObserverWrapper.LISTENER_TYPE_BEST = 1;

    /**
     * @var {integer} Flag to indicate that the library always uses mutation observers
     */
    ObserverWrapper.prototype.LISTENER_TYPE_OBSERVER = ObserverWrapper.LISTENER_TYPE_OBSERVER = 2;

    /**
     * @var {integer} Flag to indicate that the library always uses mutation events
     */
    ObserverWrapper.prototype.LISTENER_TYPE_EVENT = ObserverWrapper.LISTENER_TYPE_EVENT = 3;

    /**
     * @var {boolean} Whether the observer is currently active
     */
    ObserverWrapper.prototype.observing = false;

    /**
     * Iterate over all nodes in mutation and fire event callbacks
     *
     * @param {} mutations
     */
    ObserverWrapper.prototype.observerCallback = function(mutations)
    {
        var i, nodes = {
            added:    new NodeCollection(),
            removed:  new NodeCollection(),
            replaced: new NodeCollection()
        };

        if (this.callbacks.nodereplaced.length) {
            for (i = 0; mutations[i] !== undefined; i++) {
                processAddedNodesWithReplace.call(this, mutations[i].addedNodes, nodes);
                processRemovedNodesWithReplace.call(this, mutations[i].removedNodes, nodes);
            }
        } else {
            for (i = 0; mutations[i] !== undefined; i++) {
                processAddedNodesWithoutReplace.call(this, mutations[i].addedNodes, nodes);
                processRemovedNodesWithoutReplace.call(this, mutations[i].removedNodes, nodes);
            }
        }

        processMutationCallbacks.call(this, nodes);
    };

    /**
     * Get the value of the flag identifying the underlying mechanism
     *
     * @return {integer} The value of the flag identifying the underlying mechanism
     */
    ObserverWrapper.prototype.getType = function()
    {
        return this.LISTENER_TYPE_OBSERVER;
    };

    /**
     * Determine whether the listener is activer
     *
     * @return {boolean} Whether the listener is activer
     */
    ObserverWrapper.prototype.isListening = function()
    {
        return this.observing;
    };

    /**
     * Register an event callback and start the observer if required
     *
     * @param {string}   eventName The name of the event
     * @param {function} callback  Callback to handle the event
     */
    ObserverWrapper.prototype.on = function(eventName, callback)
    {
        eventName = eventName.toLowerCase();

        if (this.callbacks[eventName] !== undefined && typeof callback === 'function' && this.callbacks[eventName].indexOf(callback) < 0) {
            this.callbacks[eventName].push(callback);

            if (!this.observing) {
                this.mutationObserver.observe(this.element, { childList: true, subtree: true });
                this.observing = true;
            }
        }
    };

    /**
     * De-register an event callback and stop the observer if no callbacks left
     *
     * @param {string}   eventName The name of the event
     * @param {function} callback  Callback to handle the event
     */
    ObserverWrapper.prototype.off = function(eventName, callback)
    {
        var i;
        eventName = eventName.toLowerCase();

        if (this.callbacks[eventName] !== undefined) {
            if (callback !== undefined) {
                i = this.callbacks[eventName].indexOf(callback);
                if (i > -1) {
                    this.callbacks[eventName].splice(i, 1);
                }
            } else {
                this.callbacks[eventName] = [];
            }
        }

        if (this.observing && !this.callbacks.nodeadded.length && !this.callbacks.noderemoved.length && !this.callbacks.nodereplaced.length) {
            this.mutationObserver.disconnect();
            this.observing = false;
        }
    };
}());
