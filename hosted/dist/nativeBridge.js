(function init(){
  function isCommand(command) {
    if (command == null || !_.isObject(command)) {
        return false;
    }

    if (command.service == null) {
        return false;
    }

    if (command.command == null) {
        return false;
    }

    command.data = command.data || {};
    command.success = _.isFunction(command.success) ? command.success : null;
    command.error = _.isFunction(command.error) ? command.error : null;

    return true;
}

function completeCallback(commandId, result, error) {
    var command = this.popCommand(commandId);
    if (!command) {
        throw 'Invalid command id: ' + commandId;
    }

    if (!error) {
        if (_.isFunction(command.success)) {
            command.success.apply(null, result);
        }

    } else if (_.isFunction(command.error)) {
        command.error.call(null, error);
    }
}

function NativeBridge() {
    throw 'NativeBridge should not be instantiated';
}
NativeBridge.count = -1;
NativeBridge.commandQueue = {};
NativeBridge.behavior = null;

NativeBridge.addCommand = function (command) {
    if (isCommand(command)) {
        //Javascript integer is a 64 bit data structure, where as iOS integer is 32 bit. Theoretically a integer overflow issue may occur in iOS side as we are incrementing command id after every command. So to be safe command id should reset to zero after MAX_32_SIGNED_INT_VALUE.
        //(This is a theoretical issue this will occur after ~25 days if we issue command in every millisecond)
        this.count = this.count >= 2000000000 ? 0 : this.count + 1;

        this.commandQueue[this.count] = command;
        command.id = this.count;
        return this.count;
    }
    return -1;
};

NativeBridge.popCommand = function (commandId) {
    var command = this.commandQueue[commandId];
    delete this.commandQueue[commandId]; //we may 'delete' undefiend keys sometimes, but it is ok.
    return command || null; //If id was invalid, command is undefined. return null
};

NativeBridge.setBehavior = function (behavior) {
    if (!_.isFunction(behavior.setCompleteCallback)) {
        throw 'Behavior must implement setCompleteCallback';
    }

    this.behavior = behavior;
    var callback = _.bind(completeCallback, this);
    behavior.setCompleteCallback(callback);
};

NativeBridge.execute = function (command) {
    if (this.behavior) {
        var commandId = this.addCommand(command);

        if (commandId !== -1) {
            this.behavior.execute(command);
        } else {
            throw 'Invalid command object';
        }
    } else {
        throw 'NativeBridge behavior not initialized';
    }
};

NativeBridge.execNativeToJs = function(commandId, result, error) {
    if (!this.behavior) {
        throw 'Invalid command object';
    } 
    this.behavior.execNativeToJs(commandId,result,error);
};
    window.Bridge = NativeBridge;
 }());
