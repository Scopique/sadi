module.exports = {
  ToProperCase: function(str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    },
    ReturnDataObject:function(status, msg, tmsg, data){
      return {
        status:status,
        message:msg,
        technicalMessage:tmsg,
        data:data
      }
    }
}

