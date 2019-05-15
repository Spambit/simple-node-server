function App(){
    if(!(this instanceof App)){
      return new App();
    }
}

App.prototype = {
  start : function(){
      this.bridge = window.Bridge;
      this.bridge.behaviour = {
     		setCompleteCallback: function(callback) {
     			completeCallback = callback;
     		},

     		execNativeToJs: function(commandId, result, error) {
     			if (completeCallback) {
     				completeCallback(commandId, result, error);
     			}
     		},

     		execute: function(command) {
					const hsibridge = window.webkit.messageHandlers.hsibridge;
					if (!hsibridge) {
						throw new TypeError('MessageHandler named hsibridge is unavailable.');
					}
					hsibridge.postMessage(JSON.stringify(command));
     		}
     	};
      this.bridge.setBehavior(this.bridge.behaviour);
		},
    on : function(module,eventName,data){
        if(module == 'capture_queue'){
            window.App.camera.on(eventName,data);
        }
    }
};
window.App = App();
