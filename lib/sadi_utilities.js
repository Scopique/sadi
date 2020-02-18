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
  },
  //http://techslides.com/how-to-parse-and-search-json-in-javascript
  //return an array of objects according to key, value, or key and value matching
  GetNodeObjects:function(obj, key, val) {
      var objects = [];
      for (var i in obj) {
          if (!obj.hasOwnProperty(i)) continue;
          if (typeof obj[i] == 'object') {
              objects = objects.concat(this.GetNodeObjects(obj[i], key, val));
          } else 
          if (i == key && obj[i].toLowerCase().includes(val.toLowerCase())) {
              objects.push(obj);
          } else if (obj[i] == val && key == ''){
              if (objects.lastIndexOf(obj) == -1){
                  objects.push(obj);
              }
          }
      }
      return objects;
  },
  GetNodeObjectsRange:function(obj, key, valMin, valMax) {
      var objects = [];
      for (var i in obj) {
          if (!obj.hasOwnProperty(i)) continue;
          if (typeof obj[i] == 'object') {
              objects = objects.concat(this.GetNodeObjects(obj[i], key, val));
          } else 
          //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
          
          if (i == key && (obj[i] >= valMin || obj[i] <= valMax)) { //
              objects.push(obj);
          } else if (obj[i] == val && key == ''){
              //only add if the object is not already in the array
              if (objects.lastIndexOf(obj) == -1){
                  objects.push(obj);
              }
          }
      }
      return objects;
  },
  //return an array of values that match on a certain key
  GetNodeValues:function(obj, key) {
      var objects = [];
      for (var i in obj) {
          if (!obj.hasOwnProperty(i)) continue;
          if (typeof obj[i] == 'object') {
              objects = objects.concat(GetNodeValues(obj[i], key));
          } else if (i == key) {
              console.log(obj[i])
              objects.push(obj[i]);
          }
      }
      return objects;
  },
  //return an array of keys that match on a certain value
  GetNodeKeys:function(obj, val) {
      var objects = [];
      for (var i in obj) {
          if (!obj.hasOwnProperty(i)) continue;
          if (typeof obj[i] == 'object') {
              objects = objects.concat(GetNodeKeys(obj[i], val));
          } else if (obj[i] == val) {
              objects.push(i);
          }
      }
      return objects;
  }                             
}