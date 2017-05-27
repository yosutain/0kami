import { Projects, Backlogs, Lanes, Cards } from '../imports/pubsub';
import { Project, Backlog, Lane, Card } from '../imports/interfaces';

if (Meteor.isServer) {
  	Meteor.startup(function() {
		return Meteor.methods({
			createColumn: function(title, uid, lane) {
			  	const column: Column = {
					title: title,
					id: uid,
				};
				let columns = Lanes.findOne({id: lane}).columns;
				columns.push(column);
				
				Lanes.update(Lanes.findOne({id: lane}), {
					$set: { columns: columns },
				});
			},

			editCard: function(currentProjectId, lane, column, card, title, description) {
				let projects = Meteor.user().projects;
				let currentProjectIndex = 0;
				for (var i = 0; i < projects.projectIds.length; ++i) {
					if (projects.projectIds[i] == currentProjectId){
							currentProjectIndex = i;
					}
				}

				if (lane == "backlog") {
					let currentBacklog = projects.projectArray[currentProjectIndex].backlogs[column];
					let currentCard = currentBacklog.cards[card];
					currentCard.cardTitle = title;
					currentCard.cardDescription = description;
				} else {
					let currentLane = projects.projectArray[currentProjectIndex].lanes[lane].columns[column];
					let currentCard = currentLane.cards[card];
					currentCard.cardTitle = title;
					currentCard.cardDescription = description;
				}

				Meteor.users.update(Meteor.user()._id, {
					$set: {
						projects: projects
					}
				});
			},

			removeCard: function(currentProjectId, lane, column, card) {
				let projects = Meteor.user().projects;
				let currentProjectIndex = 0;
				for (var i = 0; i < projects.projectIds.length; ++i) {
					if (projects.projectIds[i] == currentProjectId){
							currentProjectIndex = i;
					}
				}

				if (lane == "backlog") {
					let currentBacklog = projects.projectArray[currentProjectIndex].backlogs[column];
					let currentCards = currentBacklog.cards;
					currentCards.splice(card, 1);
				} else {
					let currentLane = projects.projectArray[currentProjectIndex].lanes[lane].columns[column];
					let currentCards = currentLane.cards;
					currentCards.splice(card, 1);
				}

				Meteor.users.update(Meteor.user()._id, {
					$set: {
						projects: projects
					}
				});
			},

			editBacklog: function(currentProjectId, backlogNumber, title) {
				let projects = Meteor.user().projects;
				let currentProjectIndex = 0;
				for (var i = 0; i < projects.projectIds.length; ++i) {
					if (projects.projectIds[i] == currentProjectId){
							currentProjectIndex = i;
					}
				}
				let currentBacklog = projects.projectArray[currentProjectIndex].backlogs[backlogNumber];
				currentBacklog.backlogTitle = title;

				Meteor.users.update(Meteor.user()._id, {
					$set: {
						projects: projects
					}
				});
			},

			editLane: function(currentProjectId, laneNumber, title) {
				let projects = Meteor.user().projects;
				let currentProjectIndex = 0;
				for (var i = 0; i < projects.projectIds.length; ++i) {
					if (projects.projectIds[i] == currentProjectId){
							currentProjectIndex = i;
					}
				}
				let currentLane = projects.projectArray[currentProjectIndex].lanes[laneNumber];
				currentLane.laneTitle = title;

				Meteor.users.update(Meteor.user()._id, {
					$set: {
						projects: projects
					}
				});
			},

			editColumn: function(currentProjectId, laneNumber, columnNumber, title) {
				let projects = Meteor.user().projects;
				let currentProjectIndex = 0;
				for (var i = 0; i < projects.projectIds.length; ++i) {
					if (projects.projectIds[i] == currentProjectId){
							currentProjectIndex = i;
					}
				}
				let currentColumn = projects.projectArray[currentProjectIndex].lanes[laneNumber].columns[columnNumber];
				currentColumn.columnTitle = title;

				Meteor.users.update(Meteor.user()._id, {
					$set: {
						projects: projects
					}
				});
			},

			addNewLane: function(laneTitle, currentProjectId) {
			  	let projects = Meteor.user().projects;
			  	let currentProjectIndex = 0;
				for (var i = 0; i < projects.projectIds.length; ++i) {
			  		if (projects.projectIds[i] == currentProjectId){
				  		currentProjectIndex = i;
			  		}
				}
		  		let currentProjectLanes = projects.projectArray[currentProjectIndex].lanes;
		  		currentProjectLanes.push({
			  		laneTitle:[laneTitle],
			  		columns:[{
				  		columnTitle: "Doing",
				  		cards:[]
					},{
				  		columnTitle: "Done",
				  		cards:[]
					}]
				});
				let projectLanes = {};
				projectLanes["projects.projectArray." + currentProjectIndex + ".lanes"] = currentProjectLanes;
				Meteor.users.update(Meteor.user()._id, {
					$set: projectLanes
				});
			},

			addNewBacklog: function(backlogTitle, currentProjectId) {
				let projects = Meteor.user().projects;
				let currentProjectIndex = 0;
					for (var i = 0; i < projects.projectIds.length; ++i) {
					if (projects.projectIds[i] == currentProjectId){
						currentProjectIndex = i;
					}
				}

				let currentBacklogs = projects.projectArray[currentProjectIndex].backlogs
				currentBacklogs.push({ 
					backlogTitle: backlogTitle,
					cards:[]
				});

			  	Meteor.users.update(Meteor.user()._id, {
					$set: {
				  		projects: projects
					}
			  	});
			},


			addNewColumn: function(columnTitle, laneNumber, currentProject) {
			  	let currentProjectId = currentProject;
			  	let projects = Meteor.user().projects;
			  	let currentProjectIndex = 0;
					for (var i = 0; i < projects.projectIds.length; ++i) {
				  	if (projects.projectIds[i] == currentProjectId){
					 	currentProjectIndex = i;
					}
				}
				let currentColumns = projects.projectArray[currentProjectIndex].lanes[laneNumber].columns;
				currentColumns.push({ 
					columnTitle: columnTitle,
					cards:[]
				});
			  
			  	Meteor.users.update(Meteor.user()._id, {
					$set: {
						projects: projects
					}
				});
			},

			addNewCard: function(columnNumber, cardTitle, laneNumber, currentProject) {
				let currentProjectId = currentProject;
				let projects = Meteor.user().projects;
				let currentProjectIndex = 0;
				for (var i = 0; i < projects.projectIds.length; ++i) {
					if (projects.projectIds[i] == currentProjectId){
						currentProjectIndex = i;
					}
				}

			  	let currentCards;
			  	if (columnNumber === "backlog") {
					currentCards = projects.projectArray[currentProjectIndex].backlogs[laneNumber].cards;
			  	} else {
					let currentColumns = projects.projectArray[currentProjectIndex].lanes[laneNumber].columns;
					currentCards = currentColumns[columnNumber].cards;
			  	}

			  	currentCards.push({
			  		cardTitle: cardTitle,
			  		cardDescription: ""
			  	});

			  	Meteor.users.update(Meteor.user()._id, {
					$set: {
				  		projects: projects
					}
			  	});
			},

			moveCard: function(currentProject, fromType, toType, fromIndex, fromLane, fromColumn, fromBacklog, toIndex, toLane, toColumn, toBacklog) {
				let fromCards;
				let toCards;
				let draggedCard;
				let projects;
				let currentProjectIndex;	
				if (fromIndex == toIndex) {
					if (fromColumn != "null" && fromLane == toLane && fromColumn == toColumn) {
						return;
					}
					if (fromBacklog != "null" && fromBacklog == toBacklog) {
						return;
					}
				}

				projects = Meteor.user().projects;
				currentProjectIndex = 0;
			  	for (var i = 0; i < projects.projectIds.length; ++i) {
					if (projects.projectIds[i] == currentProject){
						currentProjectIndex = i;
					}
				}

				if (fromType == "backlog") {
					fromCards = projects.projectArray[currentProjectIndex].backlogs[fromBacklog].cards;
				} else if (fromType == "lane") {
					fromCards = projects.projectArray[currentProjectIndex].lanes[fromLane].columns[fromColumn].cards;
				}
				draggedCard = fromCards[fromIndex];
				fromCards.splice(fromIndex, 1);
	
				if (fromType == "backlog") {
					if (toType == "backlog") {
						if (fromBacklog == toBacklog) {
							toCards = fromCards;
							if (toIndex == "last") {
								toIndex = toCards.length;
							} else if (fromIndex <= toIndex) {
								toIndex = parseInt(toIndex) - 1;
							}
							toCards.splice(toIndex, 0, draggedCard);
						} else if (fromBacklog != toBacklog) {
							toCards = projects.projectArray[currentProjectIndex].backlogs[toBacklog].cards;
							if (toIndex == "last") {
								toIndex = toCards.length;
							}
							toCards.splice(toIndex, 0, draggedCard);
						}
					} else if (toType == "lane") {
						toCards = projects.projectArray[currentProjectIndex].lanes[toLane].columns[toColumn].cards
						if (toIndex == "last") {
							toIndex = toCards.length;
						}
						toCards.splice(toIndex, 0, draggedCard);
					}
				} else if (fromType == "lane") {
					if (toType == "lane") {
						if (fromLane == toLane) {
							if (fromColumn != toColumn) {
								toCards = projects.projectArray[currentProjectIndex].lanes[toLane].columns[toColumn].cards
								if (toIndex == "last") {
									toIndex = toCards.length;
								}
								toCards.splice(toIndex, 0, draggedCard);
							} else if (fromColumn == toColumn) {
								toCards = fromCards;
								if (toIndex == "last") {
									toIndex = toCards.length;
								} else if (fromIndex <= toIndex) {
									toIndex = parseInt(toIndex) - 1;
								}
								toCards.splice(toIndex, 0, draggedCard);
							}
						} else if (fromLane != toLane) {
							toCards = projects.projectArray[currentProjectIndex].lanes[toLane].columns[toColumn].cards
							if (toIndex == "last") {
								toIndex = toCards.length;
							}
							toCards.splice(toIndex, 0, draggedCard);
						}
					} else if (toType == "backlog") {
						toCards = projects.projectArray[currentProjectIndex].backlogs[toBacklog].cards;
						if (toIndex == "last") {
							toIndex = toCards.length;
						}
						toCards.splice(toIndex, 0, draggedCard);
					}
				}
			  	Meteor.users.update(Meteor.user()._id, {
					$set: {
						projects: projects
					}
			  	});
			},	
		});
  	});
}