import { FlowRouter } from 'meteor/kadira:flow-router';

FlowRouter.route('/home/', {
	name: 'webRoot',
	action() {
		BlazeLayout.reset();
		BlazeLayout.render("layout1", {header: "webHeader", mainApp: "webHome", popup: ""});
	}
});

FlowRouter.route('/app/', {
	name: 'appRoot',
	action() {
		Meteor.setTimeout(function(){
			if (Meteor.user()) {
				console.log("routed to projectSelector from appRoot")
				FlowRouter.go('ProjectSelector', { _id: Meteor.user()._id });
			} else {
				console.log("routed to signedOut from appRoot")
				FlowRouter.go('signedOut');
			}
		}, 1000);
	}
});

FlowRouter.route('/app/register', {
	name: 'signedOut',
	action() {
		BlazeLayout.reset();
		BlazeLayout.render("layout1", {header: "", mainApp: "signedOut", popup: ""});
	}
});

FlowRouter.route('/app/projects', {
	name: 'ProjectSelector',
	action(params) {
		BlazeLayout.reset();
		BlazeLayout.render("layout1", {header: "mainHeader", mainApp: "projectSelector", popup: ""});
	}
});

FlowRouter.route('/app/projects/:currentProject', {
	name: 'openProject',
	action(params) {
		BlazeLayout.reset();
		BlazeLayout.render("layout1", {header: "openProjectHeader", mainApp: "openProject" + 0, popup: ""});
	}
});

FlowRouter.notFound = {
	action() {
		console.log("Routed to appRoot as no route found");
		FlowRouter.go('/app/');
	}
}