Websites = new Mongo.Collection("websites");

//here we should allow what the user could fdo in our Application

Websites.allow({

  insert:function(userId, doc){
    if (Meteor.user()) {//they are logged in
      //force the image to be owned by the user
      if (userId != doc.createdBy) {//the user tryies to do something which is not allowed
        return false;
      }
      else {
        return true;
      }
    }
    else {// the user is not logged in so we do not allow him to use our data
      return false;
    }
  },

  remove: function(userId, doc){
    if (Meteor.user()) {//they are logged in
      //force the image to be owned by the user
      if (userId != doc.createdBy) {//the user tryies to do something which is not allowed
        return false;
      }
      else {
        return true;
      }
    }
    else {// the user is not logged in so we do not allow him to use our data
      return false;
    }
  },


  //here we should allow the user to rate the websites because by removig the insecure package now we could not d that

  update: function(userId, doc){
    return true;
  },
});


// A new Collection for comments
Comments = new Mongo.Collection("comments");
Comments.allow({
  insert:function(){
    return true;
  },
  update:function(){
    return true;
  },
  remove:function(){
    return true;
  }
});
