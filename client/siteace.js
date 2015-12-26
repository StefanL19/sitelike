Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('welcome',{
		to:"main"
	});
  });


	Router.route('/websites', function () {
		this.render('navbar',{
			to:"navbar"
		});
	  this.render('website_list',{
			to:"main"
		});
	  });

		Router.route('/websites/:_id', function () {
			this.render('navbar',{
				to:"navbar"
			});
			this.render('website',{
				to:"main",
				data:function(){
					return Websites.findOne({_id:this.params._id});
				}
			});
		  });






Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
	/////
	// template helpers
	/////

	// helper function that returns all available websites
	Template.website_list.helpers({
		getFilterUser:function(){
			if(Session.get("userFilter")) {
				var user = Meteor.users.findOne({_id:Session.get("userFilter")});
				return user.username;
			}
			else {
				return false;
			}
		},
		filtering_websites: function(){
			if(Session.get("userFilter")) {
				return true;
			}
			else {
				return false;
			}
		},
		websites:function(){
			if (Session.get('userFilter')) {
				return Websites.find({createdBy:Session.get("userFilter")}, {sort:{rating:-1}});
			}
			else {
				return Websites.find({}, {sort:{rating:-1}});
			}
		},
		search:function(){
			if (Session.get(searchInput)) {
				return Websites.find({description:{"$regex":"^" + currentSearch + "\\b","$options":"i"}});
			}
			return false;
		}

	});

	Template.website_item.helpers({
		getUser:function(user_id){
	    var user = Meteor.users.findOne({_id:user_id});
	    if (user) {
	      return user.username;
	    }
	    else {
	      return "anonymous";
	    }
	  },
	});
//this will check if the client is logged in
	Template.body.helpers({username:function(){
		if (Meteor.user()) {
      return Meteor.user().username;
      //return Meteor.user().emails[0].address;
    }
		else {
			return "who are you ? ";
		}
	},// end of the function for the username

	});


	//helpers for the comments
	Template.comment_form.helpers({
		text:function(){
			 return Comments.find({name: this.title}).fetch();
		},
	});
	/////
	// template events
	/////

	Template.website_item.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			if (this.rating != 0) {
				var rating = this.rating;
				rating = rating + 1;
			}
			else {
				var rating = 1;
			}
			// put the code in here to add a vote to a website!
			Websites.update(
				{"_id": website_id},
				{$set: {rating:rating}}
			)
			console.log(rating);
			return false;// prevent the button from reloading the page
		},
		"click .js-downvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;

			// put the code in here to remove a vote from a website!
			//first we check if the rating is not already 0, because we do not want negative ratings
			//if it is not we will decrement its value
			if (this.rating != 0) {
				var ratingDecrement = this.rating;
				ratingDecrement = ratingDecrement - 1;
			}
			//if it is, it will remain 0
			else {
				var ratingDecrement = 0;
			}
			//then othing special we just put the new value to the database
			Websites.update(
				{"_id": website_id},
				{$set: {rating:ratingDecrement}}
			)
			return false;
		// prevent the button from reloading the page
	},
	//this is an event to set the user filter to the name of the selected user
	//this will appear under the site name etc. and will be highlighted
	'click .js-set-image-user-filter':function(event){
		Session.set("userFilter", this.createdBy);
		console.log(this.createdBy);
	},//end of choose user to show his images event
	//this is an event to unset the user filter
	//this is an event for the delete button
	'click .js-delete':function(event){
		var website_id = this._id;
		$("#"+website_id).hide('slow', function(){
			Websites.remove({"_id":website_id});
		});
		return false;
	}//end of the button delete event
	})

	Template.website_list.events({
		'click .js-unset-image-filter':function(event){
			Session.set("userFilter", undefined);
		},//end of choose user to show his images event
	});
	Template.website_form.events({
		"click .js-toggle-website-form":function(event){
			$("#website_form").toggle('slow');
		},
		"submit .js-save-website-form":function(event){
				var url = event.target.url.value;
				var text = event.target.title.value;
				var description = event.target.description.value;
				var createdOn = new Date()
				//so here follows the magic we get the information from the website by using an http request package
				//first we check if the user did not already inputed the title
				//if he is then use this title
				if (text != "" && description != "") {
					Websites.insert({
						title: text,
						url: url,
						description: description,
						createdOn: createdOn,
						createdBy: Meteor.user()._id,
						rating:0
					});
				}

				//if he is not then execute our method and parse the title

				else {

					//first call the Meteor method getTitle parse the url end initialize the function

					Meteor.call('getTitle', url, { "options": "to set" }, function(err, results){

						//then we already obtained the content so now we should extract
						//search for something within title tags
						//and then return the first element of the object
						//then parse it to our field in the database
							var matchesTitle = results.content.match(/<title>(.*?)<\/title>/);
							text = matchesTitle[1];
								var descriptionMatches = results.content.match(/<meta name="description" content="(.*?)">/);
								var descriptionMatches1 = results.content.match(/<meta name=description content="(.*?)">/);
							if(descriptionMatches != null)
							{
								description = descriptionMatches[1];
							}
							else {
								description = descriptionMatches1[1];
							}
							console.log("this is the desc" + description);
							console.log(text);
							Websites.insert({
								title: text,
								url: url,
								description: description,
								createdOn: createdOn,
								createdBy: Meteor.user()._id,
								rating:0
							});
					});
				}
			// here is an example of how to get the url out of the form:
			//I will create variables for each one of the fields just to make it more visible
			//so this is our bunch of variables which will store our new input parameters
			//  put your website saving code in here!
			//according to the example we obtain the information for the text fields in our website
			//then we insert them in our database

			return false;// stop the form submit from reloading the page

		}
	});


	Template.comment_form.events({
		"submit .js-comments-website-form":function(event){
			var comment = event.target.comment.value;
			var id = this.title;
			Comments.insert({
				name : id,
				comment : comment,
				creator : Meteor.user().username,

			});

			return false;
		},


	});

//	Template.search_websites.events({
	//	"input .js-search-form":function(event){
		//	var phrase = event.target.value;
//Session.set('searchInput', phrase);
	//	}
//	});

	//this should be pushed to the new branch
