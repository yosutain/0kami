import { Session } from 'meteor/session';
import { Global } from '../../../imports/client/global';
import { Projects } from '../../../imports/pubsub';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Project } from '../../../imports/interfaces';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.mainHeader.helpers({
	initials() {
		let userName: any = Meteor.user().username.split("");
		let initials: any = userName[0].toUpperCase();
		return initials;
	},

	avatarColor() {
		let userName: any = Meteor.user().username.split("");
		let color: any = "000000";
		color = color.split("");
		for(var i = 0; i < userName.length || i < color.length; i++) {
			switch (userName[i]) {
				case "r":
					color[i] = "1";
					break;
				case "o":
					color[i] = "2";
					break;
				case "t":
					color[i] = "3";
					break;
			} 
		};
		color = color.join("");
		if (color < 100000) { return "avatarColor1"; } else
		if (color < 200000) { return "avatarColor1"; } else
		if (color < 300000) { return "avatarColor1"; } else
		if (color < 400000) { return "avatarColor1"; } else
		if (color < 500000) { return "avatarColor1"; } else
		if (color < 600000) { return "avatarColor1"; } else
							{ return "avatarColor1"; }
	},
});

Template.mainHeader.events({
	'click button'(event, instance) {
		var myButton = event.currentTarget;
		if (myButton.id == "myAvatar"){
			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "avatarMenuPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});	
		}
	}
});

Template.openProjectHeader.events({
	'click button'(event, instance) {
		var myButton = event.currentTarget;
		if(myButton.id == "closeProject"){
			FlowRouter.go('/app/projects');
		} else if (myButton.id == "myAvatar"){
			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "avatarMenuPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});	
		}
	},

	'click div'(event, instance) {
		if(event.currentTarget.id == "headerProjectTitle"){
			Session.set("currentProject", FlowRouter.getParam("currentProject"));
			Session.set("projectTitle", event.currentTarget.innerHTML);
			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "editProjectPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});
		} 
	},
});

Template.openProjectHeader.helpers({
	initials() {
	let userName: any = Meteor.user().username.split("");
	let initials: any = userName[0].toUpperCase();
	return initials;
	},

	avatarColor() {
	let userName: any = Meteor.user().username.split("");
	
	let color: any = "000000";
	color = color.split("");

	for(var i = 0; i < userName.length || i < color.length; i++) {
		switch (userName[i]) {
			case "r":
				color[i] = "1";
				break;
			case "o":
				color[i] = "2";
				break;
			case "t":
				color[i] = "3";
				break;
		} 
	};
	color = color.join("");

	if (color < 100000) { return "avatarColor1"; } else
	if (color < 200000) { return "avatarColor1"; } else
	if (color < 300000) { return "avatarColor1"; } else
	if (color < 400000) { return "avatarColor1"; } else
	if (color < 500000) { return "avatarColor1"; } else
	if (color < 600000) { return "avatarColor1"; } else
						{ return "avatarColor1"; }
	},

	title() {
		if (FlowRouter.getParam("currentProject") && Projects.findOne({id: FlowRouter.getParam("currentProject")})) {
			const project: Project = Projects.findOne({id: FlowRouter.getParam("currentProject")}) as Project;
			return project.title;
		}
		return "";
	},

	accessible () {
		return true
	},
});

Template.openProject0.onRendered(function () {
});

Template.openProject0.helpers({
	renderProject() {
		if (FlowRouter.getParam("currentProject") && Projects.findOne({id: FlowRouter.getParam("currentProject")})) {
		const project: Project = Projects.findOne({id: FlowRouter.getParam("currentProject")}) as Project;
		let myType = project.type;
		myType = myType.split("projectType")[1];

		BlazeLayout.render("layout1", {header: "openProjectHeader", mainApp: "openProject" + myType, popup: ""});
		}
	}
});

Template.projectSelector.events({
	'click button'(event, instance) {
		var myButton = event.currentTarget;
		if(myButton.id == "addProject"){
			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "projectCreationPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});	
		} else if (myButton.className.indexOf("openProject") !== -1) {
			let myId = myButton.id.split("openProject")[1];

			FlowRouter.go('openProject', {
				_id: Meteor.user()._id,
				currentProject: myId 
			});
		} else if (myButton.id.indexOf("p0-goToSignIn") !== -1) {
			FlowRouter.go('signedOut');
		}
	},

	'click div'(event, instance) {
		if (event.currentTarget.className.indexOf("projectTitle") !== -1) {
			Session.set("currentProject", event.currentTarget.getAttribute("projectId"));
			Session.set("projectTitle", event.currentTarget.getAttribute("projectTitle"));
			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "editProjectPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});
		}
	},
});

Template.projectSelector.helpers({
	projects() {
	return Projects.find().fetch();
	},
});

Template.projectCreationPopup.events({
	'submit form': function(event) {
		event.preventDefault();
		let myTitle = event.target.projectTitle.value;
		let projectType = event.target.projectType.value;
		let emailTemplate = event.target.emailTemplate;
		let agileTemplate = event.target.agileTemplate;
		let callAPITemplate = event.target.APITemplate;
		let template = "blank";

		if (emailTemplate.checked === true) {
			emailTemplate = emailTemplate.value;	
		} else {
			emailTemplate = "blank";	
		}

		if (agileTemplate.checked === true) {
			agileTemplate = agileTemplate.value;	
		} else {
			agileTemplate = "blank";	
		}

		if (callAPITemplate.checked === true) {
			callAPITemplate = callAPITemplate.value;	
		} else {
			callAPITemplate = "blank";	
		}

		if (event.target.projectTitle.value && event.target.projectType.value) {
			if (projectType == "projectType4") {
				BlazeLayout.render("layout1", {header: "", mainApp: "", popup: "matrixBackground"});
				
			} else if (projectType == "projectType3") {
				template = callAPITemplate;
				Meteor.apply('createProject',[myTitle, projectType, template]);
				Global.closeAllPopups();

			} else if (projectType == "projectType2") {
				template = emailTemplate;
				Meteor.apply('createProject',[myTitle, projectType, template]);
				Global.closeAllPopups();
				
			} else if (projectType == "projectType1") {
				template = agileTemplate;
				Meteor.apply('createProject',[myTitle, projectType, template]);
				Global.closeAllPopups();
			}	
		};
	}
});

Template.projectCreationPopup.onRendered(function () {
	document.getElementById("projectTitle").focus();
});

Template.editProjectPopup.events({
	'click div'(event, instance) {
		if (event.target.id == "deleteProject") {
			let title = Session.get("projectTitle");
			event.target.innerHTML =
			'<div id="confirmProjectDeletion">' +
				'<form>' +
					'<div>' +
						'<h2>DELETE <b>' + title + '</b> FOREVER?</h2>' +
						'<label for="deleteProjectTitle">' +
							'Please confirm deletion by writing the name of the project you want to delete' +
						'</label>' +
						'<input id="p0-confirmDeleteProject" type="text" name="deleteProjectTitle" required autocomplete="off">' +
						'<input type="submit" value="Delete Project">' +
					'</div>' +
				'</form>' +
			'</div>'
			;
			document.getElementById("p0-confirmDeleteProject").focus();
		} else if (event.target.id == "confirmProjectDeletion") {
			document.getElementById("deleteProject").innerHTML = "Remove Project";
		}
	},

	'submit form': function(event) {
		event.preventDefault();
		const currentProject = Session.get("currentProject");
		const projectTitle = Session.get("projectTitle");
		const project: Project = Projects.findOne({id: currentProject}) as Project;
		if (event.target.deleteProjectTitle && event.target.deleteProjectTitle.value == projectTitle) {
			Projects.remove(project._id);
			Global.closeAllPopups();
		} else if (event.target.id == "p0-editProjectTitleForm" && event.target.projectTitle.value) {
			const newTitle = event.target.projectTitle.value;
			const newColor = event.target.projectColor.value;
			Projects.update(project._id, {
				$set: {
					title: newTitle,
					color: newColor,
				}
			});
			Global.closeAllPopups();
		}
	}
});

Template.editProjectPopup.onRendered(function () {
	const title = Session.get("projectTitle");
	const project: Project = Projects.findOne({title: title}) as Project;
	const color: number = project.color;
	const input: HTMLInputElement = document.getElementById("projectTitle") as HTMLInputElement;
	input.value = title;
	let form = document.getElementById("p0-editProjectTitleForm");
	let inputs = form.getElementsByTagName("input");
	inputs[color].checked = true;
});