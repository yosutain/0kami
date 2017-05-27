import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Global } from '../../imports/client/global';
import '../../imports/client/routes.js';

Meteor.subscribe("publishedFields");

Meteor.defer(function() {
	BlazeLayout.setRoot('main');
});

Meteor.startup(function () {
	document.onkeyup = function(event) {
		let target: HTMLElement = event.target as HTMLElement;
		let tagName: string = target.tagName;
		if ((tagName !== "INPUT") && (tagName !== "TEXTAREA")) {
			event.preventDefault();
		}
		if (event.keyCode == 27) {
			Global.closeAllPopups();
		}
	}
});

Template.closeAllPopups.events({
	'click button': function(event) {
        event.preventDefault();
		Global.closeAllPopups();	
	},
});

Template.signOutButton.events({
	'click button': function(event) {
        event.preventDefault();
		Meteor.logout();
		FlowRouter.go('/');
	},
});