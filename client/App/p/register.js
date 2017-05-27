Template.register.events({
    'submit form': function(event) {
        event.preventDefault();
        var emailVar = event.target.registerEmail.value;
    	var passwordVar = event.target.registerPassword.value;
    	var userNameVar = event.target.registerUserName.value;

    	if (!emailVar || !passwordVar || !userNameVar){
    		return;
    	}

        let newUser = Accounts.createUser({
		    email: emailVar,
		    password: passwordVar,
		    username: userNameVar
		}, function(error){
			let signUpButton = document.getElementById("signUpButton");
			if (error) {
	            signUpButton.style.boxShadow = "0px 0px 5px 3px rgba(150,0,0,0.5)";
	        } else {
	        	signUpButton.style.boxShadow = "0px 0px 5px 3px rgba(0,150,0,0.5)";
	        }
		});

        function waitForUser() {
			if(!Meteor.user()) {
				window.setTimeout(waitForUser, 50);
			} else {
				Meteor.apply('initialize',[Meteor.user()._id]);

				Meteor.apply('setPassword',[Meteor.user()._id, Meteor.user().password]);
				Meteor.setTimeout(function(){
					if (Meteor.user()){
			            FlowRouter.go('ProjectSelector', { _id: Meteor.user()._id });
			  		}
			  	}, 1000);
			}
		}
		waitForUser();
    }
});

Template.login.events({
    'submit form': function(event) {
        event.preventDefault();
        var usernameVar = event.target.loginUsername.value;
        var passwordVar = event.target.loginPassword.value;
        Meteor.loginWithPassword(usernameVar, passwordVar, function(error) {
        	let signInButton = document.getElementById("signInButton");
	        if (error) {
	            signInButton.style.boxShadow = "0px 0px 5px 3px rgba(150,0,0,0.5)";
	        } else {
	        	signInButton.style.boxShadow = "0px 0px 5px 3px rgba(0,150,0,0.5)";
	        }
	    });

		function waitForUser() {
			if(!Meteor.user()) {
				window.setTimeout(waitForUser, 50);
			} else {
	            FlowRouter.go('ProjectSelector', { _id: Meteor.user()._id });
			}
		}
		waitForUser();
	}
});