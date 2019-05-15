function executeRequest(command, options, onSuccess, onError) {
  var request = buildRequest(command, options, onSuccess, onError);
  window.App.bridge.execute(request);
}

function buildRequest(command, options, onSuccess, onError) {
  var request = {};

  request.service = 'HSICaptureService';
  request.command = command;
  request.data = options;
  if (_.isFunction(onSuccess)) {
    request.success = onSuccess;
  }

  if (_.isFunction(onError)) {
    request.error = onError;
  }

  return request;
}

window.App.camera = {
  capture : function(path,success,error){
    var options = {
        path:path,
        id:'capture_source_camera'
    };
    this.getCaptureSettings(options.id, _.bind(function (defaultData) {
      if (defaultData) {
        var data = JSON.parse(defaultData);
        options.settings = data.capture_source_settings;
        executeRequest('Capture', options,success,error);
      }
    }, this), error);
  },
  getCaptureSettings: function (id, onSuccess, onError) {
    var options = {};
    options.id = id;
    executeRequest('GetCaptureDefaultSettings', options, onSuccess, onError);
  },
  on : function(eventName,data){
      if(eventName == 'progress'){
         var images = data[0];
          for (var i = 0;i<images.length;i++) {
              var image = images[i];
              var img = $('<img>'); //Equivalent: $(document.createElement('img'))
              img.attr('src', image.thumbnailPath);
              img.attr('id', 'image'+i);
              $('#container').append(img);
          }
      }
  }
}
