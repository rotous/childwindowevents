/**
 * Makes a parent window fire 'closed' and 'refreshed' events when
 * the passed child window is closed or refreshed. The child window
 * is passed in the property 'window' of the event object. 
 * @param {Object} win Child window
 */
var addClosedRefreshedEvents = (function(){

	/**
	 * Adds an event listener for the unload event of the child window
	 * @param {Object} win Child window
	 * @private
	 */
	function _addEventListeners(win){
		win.addEventListener('unload', function(){
			_fireEvent(win);
			return true;
		});
	}

	/**
	 * Wrapper function to set the event listener for the unload event
	 * of the child window
	 * @param {Object} win Child window
	 * @private
	 */
	function _setListeners(win) {
		if ( win._cre_firstLoad ){
			win.addEventListener('load', function(){
				_addEventListeners(win);
			});
		} else {
			_addEventListeners(win);
		}
	}
	
	/**
	 * Fires the 'closed' or 'refreshed' event
	 * @param {Object} win Child window
	 * @private
	 */
	function _fireEvent(win) {
		// Use a timeout so we can check if the window
		// still exists
		setTimeout(function(){
			var event;
			try{
				if ( !win || !win.innerWidth ){
					event = new Event('closed');
					event.window = win;
					window.dispatchEvent( event );
				} else {
					win._cre_firstLoad = false;
					_setListeners(win);
					event = new Event('refreshed');
					event.window = win;
					window.dispatchEvent( event );
				}
			} catch(e){
				// Catch an Exception. Firefox will throw one when we 
				// try to access property of the window that does not
				// exist anymore.
				event = new Event('closed');
				event.window = win;
				window.dispatchEvent( event );
			}
		}, 50);
	}
	
	/**
	 * Makes a parent window fire 'closed' and 'refreshed' events when
	 * the passed child window is closed or refreshed. The child window
	 * is passed in the property 'window' of the event object. 
	 * @param {Object} win Child window
	 */
	function _addClosedRefreshedEvents(win) {
		win._cre_firstLoad = true;
		_setListeners(win);
	}
	
	// Expose the function
	return _addClosedRefreshedEvents;
})();
