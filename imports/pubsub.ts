import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo'
import { FlowRouter } from 'meteor/kadira:flow-router';
export const Projects = new Mongo.Collection('projects');
export const Backlogs = new Mongo.Collection('backlogs');
export const Lanes = new Mongo.Collection('lanes');
export const Cards = new Mongo.Collection('cards');
export const Emails = new Mongo.Collection('emails');
export const EmailElements = new Mongo.Collection('emailElements');
export const APICalls = new Mongo.Collection('apiCalls');

if (Meteor.isServer) {
	Meteor.publish("privateProjects", function (currentProject)  {
		if (!currentProject) {
			return Projects.find({owner: this.userId});
		}
		return Projects.find({owner: this.userId, id: currentProject});
	});

	Meteor.publish("allBacklogs", function (currentProject)  {
		return Backlogs.find({project: currentProject});
	});

	Meteor.publish("allLanes", function (currentProject)  {
		return Lanes.find({project: currentProject});
	});

	Meteor.publish("allCards", function (currentProject)  {
		return Cards.find({project: currentProject});
	});

	Meteor.publish("allEmails", function (currentProject)  {
		return Emails.find({project: currentProject});
	});

	Meteor.publish("allEmailElements", function (currentProject)  {
		return EmailElements.find({project: currentProject});
	});

	Meteor.publish("apiCalls", function (currentProject)  {
		return APICalls.find({project: currentProject});
	});

	Projects.allow({
	    'insert': function () {
		    return true; 
	    },
	    'update': function () {
		    return true; 
	    },
	    'remove': function () {
		    return true; 
	    },
  	});

	Backlogs.allow({
	    'insert': function () {
		    return true; 
	    },
	    'update': function () {
		    return true; 
	    },
  	});

	Lanes.allow({
	    'insert': function () {
		    return true; 
	    },
	    'update': function () {
		    return true; 
	    },
  	});

	Cards.allow({
	    'insert': function () {
		    return true; 
	    },
	    'update': function () {
		    return true; 
	    },
	    'remove': function () {
		    return true; 
	    },
  	});

  	APICalls.allow({
  		'insert': function () {
		    return true; 
	    },
	    'remove': function () {
		    return true; 
	    },
  	});

  	Emails.allow({
	    'update': function () {
		    return true; 
	    },
  	});

  	EmailElements.allow({
  		'insert': function () {
		    return true; 
	    },
	    'update': function () {
		    return true; 
	    },
	    'remove': function () {
		    return true; 
	    },
  	});
}

if (Meteor.isClient) {
	Tracker.autorun(function(){
	  	Meteor.subscribe('privateProjects', FlowRouter.getParam('currentProject'), function(){
	  	});

	  	Meteor.subscribe('allBacklogs', FlowRouter.getParam('currentProject'), function(){
	  	});

	  	Meteor.subscribe('allLanes', FlowRouter.getParam('currentProject'), function(){
	  	});

	  	Meteor.subscribe('allCards', FlowRouter.getParam('currentProject'), function(){
	  	});

	  	Meteor.subscribe('allEmails', FlowRouter.getParam('currentProject'), function(){
	  	});

	  	Meteor.subscribe('allEmailElements', FlowRouter.getParam('currentProject'), function(){
	  	});

	  	Meteor.subscribe('apiCalls', FlowRouter.getParam('currentProject'), function(){
	  	});
	});
}