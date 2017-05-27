import { Meteor } from 'meteor/meteor';
import { Projects, Backlogs, Lanes, Cards, Emails, EmailElements, APICalls } from '../imports/pubsub';
import { Project, Backlog, Lane, Card, Email, EmailElement, APICall } from '../imports/interfaces';
import { Templates } from '../imports/projecttemplates';
import { FlowRouter } from 'meteor/kadira:flow-router';

if (Meteor.isServer) {
	Meteor.startup(() => {
		process.env.MAIL_URL="smtp://[EMAIL]:[PASSWORD]@smtp.gmail.com:587/";
		if (Meteor.users.find().count() == 0) {
			let newUser = Accounts.createUser({
				username: "USER",
				email: "EMAIL",
				password: "PASSWORD"
			});
			Accounts.setPassword(newUser, "PASSWORD");
		}
	});

	Accounts.onCreateUser(function(user) {
		return user;
	});

	Meteor.publish("publishedFields", function() {
		return Meteor.users.find({_id: this.userId}, {
			fields: { 
				email: 1, 
				username: 1, 
				password: 1, 
				preferences:1, 
			}
		});
	});

	Meteor.startup(function() {
		return Meteor.methods({
			initialize: function(userId) {
				let uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
				let project: Project = {
					owner: userId,
					shared: "private",
					type: "projectType1",
					title: "Kanban Example",
					color: 9,
					id: uid+"1",
				};
				Projects.insert(project);

				project = {
					owner: userId,
					shared: "private",
					type: "projectType2",
					title: "Email Example",
					color: 8,
					id: uid+"2",
				};
				Projects.insert(project);

				project = {
					owner: userId,
					shared: "private",
					type: "projectType3",
					title: "API Example",
					color: 7,
					id: uid+"3",
				};
				Projects.insert(project);

				let backlog: Backlog = {
					title: "To Do",
					project: uid+"1",
					id: uid+"B",
				};
				Backlogs.insert(backlog);

				let lane: Lane = Templates.agileLane(uid+"1");
				Lanes.insert(lane);
				lane = Templates.weeklyLane(uid+"1");
				Lanes.insert(lane);

				let card: Card = {
					title: "Card 1",
					project: uid+"1",
					location: uid+"B",
					column: uid+"B",
					position: 100,
					id: uid+"C",
				}
				Cards.insert(card);

				Emails.insert({
					project: uid+"2",
					color: 9,
				})
				let elements: EmailElement[] = Templates.blueBusiness(uid+"2");
				for (let i = 0; i < elements.length; ++i) {
					EmailElements.insert(elements[i]);
				}

				let apiCalls = Templates.APICalls(uid+"3");
				for (let i = 0; i < apiCalls.length; ++i) {
					APICalls.insert(apiCalls[i]);
				}
			},

			setPassword: function(user, password) {
				Accounts.setPassword(user, password, { logout: false });
			},

			setUserName: function(newName) {
				Meteor.users.update(Meteor.user()._id, {
					$set: {
						username: newName
					}
				});
			},

			createProject: function(myTitle, myType, template) {
				let uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});

				let bgNumber: number = Math.floor((Math.random() * 10) + 1); 
				const project: Project = {
					owner: Meteor.user()._id,
					shared: "private",
					type: myType,
					title: myTitle,
					color: bgNumber,
					id: uid,
				};
				Projects.insert(project);

				if (myType == "projectType2"){
					if (template == "blank") {
						Emails.insert({
							project: uid,
    						color: bgNumber,
						})
					} else if (template == "template1") {
						Emails.insert({
							project: uid,
    						color: 9,
						})
						let elements: EmailElement[] = Templates.blueBusiness(uid);
						for (let i = 0; i < elements.length; ++i) {
							EmailElements.insert(elements[i]);
						}
					}
				} else if (myType == "projectType1") {
					if (template == "blank") {
					} else if (template == "template1") {
						let backlog: Backlog = {
							title: "To Do",
							project: uid,
							id: uid+"B",
						};
						Backlogs.insert(backlog);

						let lane: Lane = Templates.agileLane(uid);
						Lanes.insert(lane);
						lane = Templates.weeklyLane(uid);
						Lanes.insert(lane);
					}
				} else if (myType == "projectType3") {
					if (template == "blank") {
					} else if (template == "template1") {
						let apiCalls = Templates.APICalls(uid);
						for (let i = 0; i < apiCalls.length; ++i) {
							APICalls.insert(apiCalls[i]);
						}
					}
				}
			},

			editProject: function(currentProjectId, title, color) {
				const project: Project = Projects.findOne({id: currentProjectId, owner: Meteor.user()._id}) as Project;
				const id = project._id;
				Projects.update(id, {
					$set: {
						title: title,
						color: color,
					}
				});
			},

			removeProject: function(currentProjectId) {
				const project: Project = Projects.findOne({id: currentProjectId, owner: Meteor.user()._id}) as Project;
				const id = project._id;
				Projects.remove(id);
			},

			openProject: function(myProject) {
				FlowRouter.go('openProject', {
					_id: Meteor.user()._id,
					currentProject: myProject 
				});
			},

			closeProject: function() {
				FlowRouter.go('/')
			},
		});
	});
}
