import { Meteor } from 'meteor/meteor';
import { Projects, Backlogs, Lanes, Cards } from '../imports/pubsub';
import { Project, Backlog, Lane, Card } from '../imports/interfaces';
import { Email } from 'meteor/email'

if (Meteor.isServer) Meteor.startup(function() {
	return Meteor.methods({
		sendTestEmail: function(currentProjectId, emailAddress, emailHTML) {
			const project: Project = Projects.findOne({id: currentProjectId}) as Project;
		    Email.send({
		    	to: emailAddress,
		    	from: Meteor.user().email,
		    	subject: project.title,
		    	html: emailHTML,
		    });
		},
	});
});