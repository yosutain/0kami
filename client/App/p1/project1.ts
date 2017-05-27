import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Global } from '../../../imports/client/global';
import { Projects, Backlogs, Lanes, Cards } from '../../../imports/pubsub';
import { Project, Backlog, Lane, Column, Card } from '../../../imports/interfaces';
import { FlowRouter } from 'meteor/kadira:flow-router';

Session.set("typeOfContainer", "");
Session.set("location", "");
Session.set("cardLocation", "");
Session.set("cardId", "");
Session.set("temporaryStorage", "");
Session.set("editContainer", false);

declare var InstallTrigger: any;

Template.openProject1.helpers({
	project () {
		return Projects.findOne({id: FlowRouter.getParam("currentProject")});
	},

	accessible () {
		const project: Project = Projects.findOne({id: FlowRouter.getParam("currentProject")}) as Project;
		if (project.owner == Meteor.user()._id) {
			return true;
		}
		return false;
	},
});

Template.backlogColumn.helpers({
	backlogs() {
		return Backlogs.find().fetch();
	},
});

Template.laneColumn.helpers({
	lanes() {
		return Lanes.find().fetch();
	},
});

Template.p1ContainerPopup.helpers({
	type() {
		return Session.get("typeOfContainer");
	},
	action() {
		if (Session.get("editContainer")) {
			return "Edit";
		}
		return "Create";
	},
});

Template.p1CardPopup.helpers({
	card() {
		return Cards.findOne({id: Session.get("cardId")});
	},
});

Template.registerHelper('cards', (location, column) => {
	return Cards.find({location: location, column: column}, {sort: {position: 1}}).fetch();
});

Template.board.events({
	'click button'(event) {
		var myButton = event.currentTarget;
		if (myButton.className.indexOf("addContainer") !== -1) {
			Session.set("typeOfContainer", event.target.getAttribute("typeOfContainer"));
			Session.set("location", event.target.getAttribute("location"));
			Session.set("column", "");
			BlazeLayout.render("layout1", {header: "openProjectHeader", mainApp: "openProject1", popup: "p1ContainerPopup"});  
		} else if (myButton.className.indexOf("addCard") !== -1) {
			const location: string = event.target.getAttribute("location");
			let column: string = event.target.getAttribute("column");
			if (!column) {
				column = location;
			}
			Session.set("location", location);
			Session.set("column", column);
			Session.set("temporaryStorage", myButton.parentNode.innerHTML);

			myButton.parentNode.innerHTML = 
			'<form id="p1-createCardForm" class="card">' + 
			'<input id="createCardTitle" type="text" name="createCardTitle" require autocomplete="off">' +
			'<input type="submit" value="Create Card">' + 
			'</form>';
			document.getElementById("createCardTitle").focus();
		}
	},
	'submit form': function(event) {
		event.preventDefault();
		const title: string = event.target.createCardTitle.value;
		if (!title) {
			return;
		}
		const location: string = Session.get("location");
		const column: string =  Session.get("column");
		let position: number;
		const lastCard: Card = Cards.findOne({location: location, column: column}, {sort: {position: -1}}) as Card;;
		if (lastCard) {
			position = lastCard.position + 100;
		} else {
			position = 100;
		}
		const card: Card = {
			title: title,
			project: FlowRouter.getParam("currentProject"),
			location: location,
			column: column,
			position: position,
			id: Global.getUniqueId(),
		}
		event.target.createCardTitle.value = "";
		Cards.insert(card);
	},

	'blur input[name="createCardTitle"]':function(event){
		event.preventDefault();
		document.getElementById("p1-createCardForm").parentElement.innerHTML = Session.get("temporaryStorage");
	},

	'click div'(event) {
		if (event.currentTarget.className.indexOf("card") !== -1) {
			Session.set("cardId", event.target.getAttribute("cardId"));
			BlazeLayout.render("layout1", {header: "openProjectHeader", mainApp: "openProject1", popup: "p1CardPopup"});  
		}
	},

	'click .editContainer'(event) {
		if (event.currentTarget.className.indexOf("editContainer") !== -1) {
			let typeOfContainer: string;
			let location: string;
			if (event.currentTarget.className.indexOf("laneTitle") !== -1) {
				typeOfContainer = "Lane";
				location = event.currentTarget.getAttribute("lane");
			} else if (event.currentTarget.className.indexOf("columnTitle") !== -1) {
				typeOfContainer = "Column";
				location = event.currentTarget.getAttribute("lane");
				const column = event.currentTarget.getAttribute("column");
				Session.set("column", column);
			} else if (event.currentTarget.className.indexOf("backlogTitle") !== -1) {
				typeOfContainer = "Backlog";
				location = event.currentTarget.getAttribute("backlog");
			}
			Session.set("editContainer", true);
			Session.set("typeOfContainer", typeOfContainer);
			Session.set("location", location);
			BlazeLayout.render("layout1", {header: "openProjectHeader", mainApp: "openProject1", popup: "p1ContainerPopup"});  
		}
	},
});

Template.p1ContainerPopup.events({
	'click #p1-containerPopup'(event) {
		if (event.target.id == "p1-containerPopup") {
			Global.closeAllPopups();
			Session.set("editContainer", false);
		}
	},

	'submit form': function(event) {
		event.preventDefault();
		const title: string = event.target.title.value;
		if (!title) {
			return;
		}
		const type: string = Session.get("typeOfContainer");
		const edit: boolean = Session.get("editContainer");
		if (edit) {
			let id = Session.get("location");
			if (type == "Backlog") {
				const backlog: Backlog = Backlogs.findOne({id: id}) as Backlog;
				id = backlog._id;
				Backlogs.update(id, {
					$set: { title: title },
				});
			} else if (type == "Lane") {
				const lane: Lane = Lanes.findOne({id: id}) as Lane;
				id = lane._id;
				Lanes.update(id, {
					$set: { title: title },
				});
			} else if (type == "Column") {
				const column = Session.get("column");
				const lane: Lane = Lanes.findOne({id: id}) as Lane;
				const columns = lane.columns;
				for (let i = 0; i < columns.length; ++i) {
					if (columns[i].id == column){
						columns[i].title = title;
					}
				}
				id = lane._id;
				Lanes.update(id, {
					$set: { columns: columns },
				});
			}
			Global.closeAllPopups();
			Session.set("editContainer", false);
			return;
		}

		const project: string = FlowRouter.getParam("currentProject");
		const uid: string = Global.getUniqueId();
		if (type == "Backlog") {
			const backlog: Backlog = {
				title: title,
				project: project,
				id: uid,
			};
			Backlogs.insert(backlog);
		} else if (type == "Lane") {
			const lane: Lane = {
				title: title,
				columns: [{
					title: "Doing", 
					id: uid+"L1"
				},{
					title: "Done", 
					id: uid+"L2"
				}],
				project: project,
				id: uid,
			};
			Lanes.insert(lane);
		} else if (type == "Column") {
			const lane: Lane = Lanes.findOne({id: Session.get("location")}) as Lane;
			const id = lane._id;
			const column: Column = {
				title: title,
				id: uid,
			};
			let columns: Column[] = lane.columns;
			columns.push(column);
			
			Lanes.update(id, {
				$set: { columns: columns },
			});
		}
		Global.closeAllPopups();
	},
});

Template.p1CardPopup.events({
	'click #p1-cardPopup'(event) {
		if (event.target.id == "p1-cardPopup") {
			Global.closeAllPopups();
		}
	},

	'click #cardRemovalButton'(event) {
		if (event.currentTarget.innerHTML == "Remove Card") {
			event.target.innerHTML = "Remove Forever?";
			event.target.className = "p1-confirmDeleteCard";
			
			Meteor.setTimeout(function(){
				event.target.innerHTML = "Remove Card";
				event.target.className = "";
			}, 2000);
		} else if (event.target.innerHTML == "Remove Forever?") {
			const card: Card = Cards.findOne({id: Session.get("cardId")}) as Card;
			const id = card._id;
			Cards.remove(id);
			Global.closeAllPopups();	
		}
	}
});

Template.openProject1.events({
	'dragstart': function(event) {
		while (event.target.className.indexOf("draggableChild") !== -1) {
			event.target = event.target.parentNode;
		}

		if (event.target.className.indexOf("draggableCard") !== -1) {
			const dragStart = function() {
				const cardId = event.target.getAttribute("cardId");
				Session.set("cardId", cardId);

				let dragImage = event.target.cloneNode(true);
				if (event.target.parentNode.parentNode.className.indexOf("backlog") !== -1) {
					dragImage.style.width = "335px";
				} else {
					dragImage.style.width = "190px";
				}
				dragImage.style.position = "absolute"; 
				dragImage.style.top = "-100vh"; 
				dragImage.style.left = "-100vw";
				dragImage.id = "dragImage";
				document.body.appendChild(dragImage);
				event.target.id = "draggedCard";

				event.dataTransfer = event.originalEvent.dataTransfer;
				event.dataTransfer.setData("cardId", cardId);
				event.dataTransfer.setDragImage(dragImage, 0, 0);

				let placeholder;
				placeholder = document.createElement('div');
				placeholder.id = "placeholder";
				document.body.appendChild(placeholder);
				event.target.parentNode.insertBefore(placeholder, event.target);
			}

			const isFirefox = typeof InstallTrigger !== 'undefined';
			if (isFirefox) {
				dragStart();
			} else {
				Meteor.setTimeout(function(){	
					dragStart();
				}, 0);
			}
		}
	},

	'dragenter': function(event) {
		event.preventDefault();
		while (event.target.className.indexOf("droppableChild") !== -1) {
			event.target = event.target.parentNode;
		}
		if (event.target.className.indexOf("droppableCard") !== -1) {
			let cardId = event.target.getAttribute("cardId");
			Session.set("toPosition", cardId);

			let placeholder = document.getElementById("placeholder");
			event.target.parentNode.insertBefore(placeholder, event.target);
		}
	},

	'dragover': function(event) {
		event.preventDefault();
		while (event.target.className.indexOf("droppableChild") !== -1) {
			event.target = event.target.parentNode;
		} 
		if (event.target.nextElementSibling == null) {
			return;
		}
		if (event.target.className.indexOf("droppableCard") !== -1) {
			let y = event.originalEvent.clientY;
			let myTarget = event.target.getBoundingClientRect();
			let targetHeight = myTarget.bottom - myTarget.top;
			let half = targetHeight / 2;
			let topHalf = myTarget.top + half;
			if (y > topHalf) {
				if (event.target.nextElementSibling.id != "placeholder") {
					let placeholder = document.getElementById("placeholder");
					event.target.parentNode.insertBefore(placeholder, event.target.nextElementSibling);
				}
			}
		}
	},

	'dragleave': function(event) {
		event.preventDefault();
	},

	'drop': function(event) {
		event.preventDefault();
	},

	'dragend': function(event) {
		event.preventDefault();
		const cardId = Session.get("cardId");
		const from: Card = Cards.findOne({id: cardId}) as Card;
		const id = from._id;
		let placeholder = document.getElementById("placeholder");
		let draggedCard = document.getElementById("draggedCard");
		if (!placeholder) {
			if (draggedCard) {
				draggedCard.id = "";
			} 
			return; 
		}

		if (placeholder.nextElementSibling == draggedCard || draggedCard.nextElementSibling == placeholder) {
			if (draggedCard) {
				draggedCard.id = "";
			} 
			placeholder.parentNode.removeChild(placeholder);
			return; 
		}

		let nextElement = placeholder.nextElementSibling;
		let nextCardId = nextElement.getAttribute("cardId");
		let next: Card;
		let last: boolean;
		if (!nextCardId) {
			last = true;
		} else {
			next = Cards.findOne({id: nextCardId}) as Card;
		}

		const container = placeholder.parentElement.parentElement.getElementsByClassName("editContainer")[0];
		const containerClassList = container.getAttribute("class");
		let column: boolean;
		if (containerClassList.indexOf("column") !== -1) {
			column = true;
		} 

		let columnId;
		if (column) {
			columnId = container.getAttribute("column");
		} else {
			columnId = container.getAttribute("backlog");
		}

		let prev: Card;
		if (next) {
			prev = Cards.findOne({column: next.column, position: {"$lt": next.position}},{sort: {position: -1}}) as Card;
		} else {
			if (column) {
				prev = Cards.findOne({column: container.getAttribute("column")},{sort: {position: -1}}) as Card;
			} else {
				prev = Cards.findOne({column: container.getAttribute("backlog")},{sort: {position: -1}}) as Card;
			}
		}
		placeholder.parentNode.removeChild(placeholder);

		let newPos: number;
		if (last) {
			if (prev) {
				newPos = prev.position + 100;
			} else {
				newPos = 100;
			}
		} else {
			let nextPos: number = next.position;
			let prevPos: number;
			if (prev) {
				prevPos = prev.position;
			} else { 
				prevPos = nextPos - 100;
			}
			newPos = prevPos + ((nextPos - prevPos) / 2);
		}

		if (from.column == columnId) {
			Cards.update(id, {
				$set: { position: newPos },
			});
			if (draggedCard) {
				draggedCard.id = "";
			} 
		} else if (column) {
			Cards.update(id, {
				$set: { 
					position: newPos,
					location: container.getAttribute("lane"),
					column: columnId,
				},
			});
		} else {
			Cards.update(id, {
				$set: { 
					position: newPos,
					location: columnId,
					column: columnId,
				},
			});
		}
	},
});

Template.p1ContainerPopup.onRendered(function () {
	const type = Session.get("typeOfContainer");
	let title: string;
	if (type == "Column") {
		const lane: Lane = Lanes.findOne({id: Session.get("location")}) as Lane;
		for (let i = 0; i < lane.columns.length; ++i) {
			if (lane.columns[i].id == Session.get("column")){
				title = lane.columns[i].title;
			}
		}
	} else if (type == "Lane"){
		const lane: Lane = Lanes.findOne({id: Session.get("location")}) as Lane;
		if (lane) { title = lane.title; }
	} else if (type == "Backlog"){
		const backlog: Backlog = Backlogs.findOne({id: Session.get("location")}) as Backlog;
		if (backlog) { title = backlog.title; }
	}
	
	let titleInput: HTMLInputElement = document.getElementsByName("title")[0] as HTMLInputElement;
	if (title) { titleInput.value = title; }
	titleInput.focus();
});