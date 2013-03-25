/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global
    EventWrapper:true,
    NodeCollection,
    processAddedNodesWithReplace:false,
    processRemovedNodesWithReplace:false,
    processAddedNodesWithoutReplace:false,
    processRemovedNodesWithoutReplace:false,
    processMutationCallbacks:false
*/

/**
 * Wraps the mutation event API
 */
(function() {
    /**
     * Constructor
     *
     * @param {DOMNode}                             element The element being observed
     */
    EventWrapper = function(element)
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

        this.nodeCache = {
            added:    [],
            removed:  [],
            replaced: []
        };

        this.hasCached = false;
    };

    /**
     * @var {integer} Flag to indicate that the library uses the best available API
     */
    EventWrapper.prototype.LISTENER_TYPE_BEST = EventWrapper.LISTENER_TYPE_BEST = 1;

    /**
     * @var {integer} Flag to indicate that the library always uses mutation observers
     */
    EventWrapper.prototype.LISTENER_TYPE_OBSERVER = EventWrapper.LISTENER_TYPE_OBSERVER = 2;

    /**
     * @var {integer} Flag to indicate that the library always uses mutation events
     */
    EventWrapper.prototype.LISTENER_TYPE_EVENT = EventWrapper.LISTENER_TYPE_EVENT = 3;

    /**
     * @var {boolean} Whether the observer is currently active for inserted nodes
     */
    EventWrapper.prototype.insertObserving = false;

    /**
     * @var {boolean} Whether the observer is currently active for removed nodes
     */
    EventWrapper.prototype.removeObserving = false;

    /**
     * Process the cache of pending mutations
     */
    EventWrapper.prototype.processCache = function()
    {
        var nodes = {
            added:    new NodeCollection(),
            removed:  new NodeCollection(),
            replaced: new NodeCollection()
        };

        this.hasCached = false;

        if (this.callbacks.nodereplaced.length) {
            processAddedNodesWithReplace.call(this, this.nodeCache.added, nodes);
            processRemovedNodesWithReplace.call(this, this.nodeCache.removed, nodes);
        } else {
            processAddedNodesWithoutReplace.call(this, this.nodeCache.added, nodes);
            processRemovedNodesWithoutReplace.call(this, this.nodeCache.removed, nodes);
        }
    
        processMutationCallbacks.call(this, nodes);
    };
    
    /**
     * Callback function for DOMNodeAdded event
     *
     * @param {MutationEvent} ev DOMNodeAdded Event object
     */
    EventWrapper.prototype.nodeInsertedListener = function(ev)
    {
        var self, node;
    
        node = ev.target || ev.srcElement;
        this.nodeCache.added.push(node);
    
        if (!this.hasCached) {
            self = this;
            setTimeout(function() {
                self.processCache();
            }, 0);
    
            this.hasCached = true;
        }
    };
    
    /**
     * Callback function for DOMNodeInserted event
     *
     * @param {MutationEvent} ev DOMNodeInserted Event object
     */
    EventWrapper.prototype.nodeRemovedListener = function(ev)
    {
        var self, node;
    
        node = ev.target || ev.srcElement;
        this.nodeCache.removed.push(node);
    
        if (!this.hasCached) {
            self = this;
            setTimeout(function() {
                self.processCache();
            }, 0);
    
            this.hasCached = true;
        }
    };
    
    /**
     * Get the value of the flag identifying the underlying mechanism
     *
     * @return {integer} The value of the flag identifying the underlying mechanism
     */
    EventWrapper.prototype.getType = function()
    {
        return this.LISTENER_TYPE_EVENT;
    };
    
    /**
     * Determine whether the listener is activer
     *
     * @return {boolean} Whether the listener is activer
     */
    EventWrapper.prototype.isListening = function()
    {
        return this.insertObserving || this.removeObserving;
    };
    
    /**
     * Register an event callback and start the observer if required
     *
     * @param {string}   eventName The name of the event
     * @param {function} callback  Callback to handle the event
     */
    EventWrapper.prototype.on = function(eventName, callback)
    {
        eventName = eventName.toLowerCase();
    
        if (this.callbacks[eventName] !== undefined && typeof callback === 'function' && this.callbacks[eventName].indexOf(callback) < 0) {
            this.callbacks[eventName].push(callback);
    
            if (!this.insertObserving && (this.callbacks.nodeadded.length || this.callbacks.nodereplaced.length)) {
                this.nodeInsertedListener = this.nodeInsertedListener.bind(this);
                this.element.addEventListener('DOMNodeInserted', this.nodeInsertedListener);
                this.insertObserving = true;
            }
    
            if (!this.removeObserving && (this.callbacks.noderemoved.length || this.callbacks.nodereplaced.length)) {
                this.nodeRemovedListener = this.nodeRemovedListener.bind(this);
                this.element.addEventListener('DOMNodeRemoved', this.nodeRemovedListener);
                this.removeObserving = true;
            }
        }
    };
    
    /**
     * De-register an event callback and stop the observer if no callbacks left
     *
     * @param {string}   eventName The name of the event
     * @param {function} callback  Callback to handle the event
     */
    EventWrapper.prototype.off = function(eventName, callback)
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

        if (this.insertObserving && !this.callbacks.nodeadded.length && !this.callbacks.nodereplaced.length) {
            this.element.removeEventListener('DOMNodeInserted', this.nodeInsertedListener);
            this.insertObserving = false;
        }
        if (this.removeObserving && !this.callbacks.noderemoved.length && !this.callbacks.nodereplaced.length) {
            this.element.removeEventListener('DOMNodeRemoved', this.nodeRemovedListener);
            this.removeObserving = false;
        }
    };
}());
