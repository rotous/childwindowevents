/**
 * Makes a parent window fire 'childclosed' and 'childrefreshed' events when
 * a child window is closed or refreshed. The child window object
 * is passed in the property 'childWindow' of the event object. 
 */
(function(){
	var _origWindowOpen = window.open;
	var _canUseEventConstructor = true;
	try {
		var _e = new Event('test');
	} catch(ex){
		_canUseEventConstructor = false;
	}
	
	// Overwrite the original window.open function to add
	// the new events
	window.open = function() {
		var win = _origWindowOpen.apply(window, arguments);
		win.document._cwe_test = 'test';
		
		// Add the event listeners
		win._cwe_firstLoad = true;
		_setListeners(win);
		
		return win;
	};
	
	/**
	 * Adds an event listener for the unload event of the child window
	 * @param {Object} win Child window
	 * @private
	 */
	function _addEventListeners(win){
		win._cwe_onUnload = function(){
			_removeEventListeners(win);
			_fireEvent(win);
			return true;
		};
		win.addEventListener('unload', win._cwe_onUnload);
	}

	/**
	 * Removes the event listener for the unload event of the child window
	 * @param {Object} win Child window
	 * @private
	 */
	function _removeEventListeners(win){
		win.removeEventListener('unload', win._cwe_onUnload);
	}

	/**
	 * Wrapper function to set the event listener for the unload event
	 * of the child window
	 * @param {Object} win Child window
	 * @private
	 */
	function _setListeners(win) {
		_addEventListeners(win);
		if ( win._cwe_firstLoad ){
			win.addEventListener('load', function(){
				_removeEventListeners(win);
				_addEventListeners(win);
			});
		}
	}
	
	/**
	 * Fires the given event on the parent window passing the
	 * child window in the property 'childWindow' of the event object
	 */
	function _fireChildWindowEvent(win, eventName){
		var event;
		if ( _canUseEventConstructor ){
			event = new Event(eventName);
		} else {
			event = document.createEvent('Event');
			event.initEvent(eventName, true, true);
		}

		event.childWindow = win;
		window.dispatchEvent( event );
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
			try{
				if ( !win || !win.innerWidth ){
					_fireChildWindowEvent(win, 'childclosed');
				} else {
					win._cwe_firstLoad = false;
					_setListeners(win);
					_fireChildWindowEvent(win, 'childrefreshed');
				}
			} catch(e){
				// Catch an Exception. Firefox will throw one when we 
				// try to access property of the window that does not
				// exist anymore.
				_fireChildWindowEvent(win, 'childclosed');
			}
		}, 50);
	}
})();
