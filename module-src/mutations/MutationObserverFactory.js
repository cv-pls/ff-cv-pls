/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global MutationObserverFactory:true */

/**
 * Makes MutationObserver objects
 */
(function() {
    /**
     * @var MutationObserver The mutation observer constructor in use
     */
    var ConstructorInUse;
    if (window.MutationObserver !== undefined) { // Mozilla/standard
        ConstructorInUse = window.MutationObserver;
    } else if (window.WebKitMutationObserver !== undefined) { // Chrome <27
        ConstructorInUse = window.WebKitMutationObserver;
    }

    /**
     * Constructor
     */
    MutationObserverFactory = function()
    {
        if (!ConstructorInUse) {
            throw new Error('Your browser does not support mutation observers');
        }
    };

    /**
     * Create a new MutationObserver object
     */
    MutationObserverFactory.prototype.create = function(callback)
    {
        return new ConstructorInUse(callback);
    };
}());
