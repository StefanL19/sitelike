Meteor.methods({
  'getTitle':function(url){
    return Meteor.http.call('GET',  url);
  },

})
