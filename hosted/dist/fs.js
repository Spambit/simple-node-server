window.App.fs = {
    writeToFile : function(path,str,success,error){
        App.bridge.execute({
            service:'PSWFileSystemService',
            command : 'WriteToFile',
            data : {
              content : str,
              path : path
            },
            success : success,
            error : error
        });
    },

    readFromFile : function(path,success,error){
      App.bridge.execute({
          service:'PSWFileSystemService',
          command : 'ReadFromFile',
          data : {
            path : path
          },
          success : success,
          error : error
      });
    },

    deleteFile : function(path,success,error){
      App.bridge.execute({
          service:'PSWFileSystemService',
          command : 'DeleteFile',
          data : {
            path : path
          },
          success : success,
          error : error
      });
    }

};
