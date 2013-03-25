/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global ListenerFactory:true, MutationObserverFactory, ObserverWrapper, EventWrapper */
/*dependency MutationObserverFactory, ObserverWrapper, EventWrapper */

/**
 * Factory object returned when module is loaded
 */
(function() {
    var mutationObserverFactory, WrapperInUse, observerSupported, eventsSupported;

    try {
        mutationObserverFactory = new MutationObserverFactory();
        WrapperInUse = ObserverWrapper;

        observerSupported = true;
        eventsSupported = Boolean(window.addEventListener);
    } catch (e) {
        observerSupported = false;

        if (window.addEventListener) {
            eventsSupported = true;
            WrapperInUse = EventWrapper;
        } else {
            eventsSupported = false;
        }
    }

    /**
     * Constructor
     */
    ListenerFactory = function()
    {
        if (!WrapperInUse) {
            throw new Error('Your browser does not support Child List mutation listeners');
        }
    };

    /**
     * @var {integer} Flag to indicate that the library uses the best available API
     */
    ListenerFactory.prototype.LISTENER_TYPE_BEST = ListenerFactory.LISTENER_TYPE_BEST = 1;

    /**
     * @var {integer} Flag to indicate that the library always uses mutation observers
     */
    ListenerFactory.prototype.LISTENER_TYPE_OBSERVER = ListenerFactory.LISTENER_TYPE_OBSERVER = 2;

    /**
     * @var {integer} Flag to indicate that the library always uses mutation events
     */
    ListenerFactory.prototype.LISTENER_TYPE_EVENT = ListenerFactory.LISTENER_TYPE_EVENT = 3;

    /**
     * Create a new mutation listener object
     *
     * @param {DOMNode} element The node to observe
     * @param {integer} type    Flag to indicate the API that should be used
     */
    ListenerFactory.prototype.getListener = function(element, type)
    {
        switch (type) {
            case this.LISTENER_TYPE_OBSERVER:
                if (!observerSupported) {
                    throw new Error('Your browser does not support mutation observers');
                }

                return new ObserverWrapper(element, mutationObserverFactory);

            case this.LISTENER_TYPE_EVENT:
                if (!eventsSupported) {
                    throw new Error('Your browser does not support mutation events');
                }

                return new EventWrapper(element);

            default:
                return new WrapperInUse(element, mutationObserverFactory);
        }
    };
}());
