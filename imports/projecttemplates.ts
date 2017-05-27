import { Project, Backlog, Lane, Card, EmailElement, APICall } from '../imports/interfaces';

export const Templates = {
 	basicLane: function(project){
	    const lane: Lane = {
		title: "Lane",
		columns: [{
			title: "Doing", 
			id: project+"L1"
		},{
			title: "Done", 
			id: project+"L2"
		}],
		project: project,
		id: project+"L",
		};
		return lane;
	},

	agileLane: function(project){
	    const lane: Lane = {
		title: "Agile",
		columns: [{
			title: "Selected", 
			id: project+"1L1"
		},{
			title: "Doing", 
			id: project+"1L2"
		},{
			title: "Done", 
			id: project+"1L3"
		},{
			title: "Review", 
			id: project+"1L4"
		},{
			title: "Ready", 
			id: project+"1L5"
		}],
		project: project,
		id: project+"1L",
		};
		return lane;
	},

	weeklyLane: function(project){
	    const lane: Lane = {
		title: "Weekly Plan",
		columns: [{
			title: "Monday", 
			id: project+"2L1"
		},{
			title: "Tuesday", 
			id: project+"2L2"
		},{
			title: "Wednesday", 
			id: project+"2L3"
		},{
			title: "Thursday", 
			id: project+"2L4"
		},{
			title: "Friday", 
			id: project+"2L5"
		}],
		project: project,
		id: project+"2L",
		};
		return lane;
	},

	blueBusiness: function(project){
		let emailElements: EmailElement[] = []; 
		const emailElement1: EmailElement = {
			project: project,
			position: 100,
		    type: 1,
		    color: 0,
		    font: "",
		    amount: 1,
		    height: 300,
		    width: 650,
		    spacerTop: 10,
		    spacerBottom: 0,
		    urls: ["http://lorempixel.com/output/nightlife-q-c-650-300-1.jpg", "", ""],
		    texts: ["", "", ""],
		};
		const emailElement2: EmailElement = {
			project: project,
			position: 200,
		    type: 4,
		    color: 2,
		    font: "Georgia, serif",
		    amount: 1,
		    height: 0,
		    width: 650,
		    spacerTop: 0,
		    spacerBottom: 0,
		    urls: ["", "", ""],
		    texts: ["Official Blue Business Release Party", "", "", "We're inviting you to a night to remember...<br><br>After 6 months of hard work, Something Blue is ready for the public. To celebrate the occasion, we're arranging a night of entertainment at the Blue Bar. There will be drinks, entertainment and a sneak peak into what will hit the shelfs this summer.", "", ""],
		};
		const emailElement3: EmailElement = {
			project: project,
			position: 300,
		    type: 5,
		    color: 2,
		    font: "",
		    amount: 1,
		    height: 0,
		    width: 650,
		    spacerTop: 0,
		    spacerBottom: 0,
		    urls: ["", "", ""],
		    texts: ["Read More...", "", ""],
		};
		const emailElement4: EmailElement = {
			project: project,
			position: 400,
		    type: 1,
		    color: 2,
		    font: "",
		    amount: 3,
		    height: 200,
		    width: 200,
		    spacerTop: 6,
		    spacerBottom: 0,
		    urls: ["http://lorempixel.com/output/nightlife-q-c-200-200-5.jpg", "http://lorempixel.com/output/cats-q-c-200-200-9.jpg", "http://lorempixel.com/output/technics-q-c-200-200-9.jpg"],
		    texts: ["", "", ""],
		};
		const emailElement5: EmailElement = {
			project: project,
			position: 500,
		    type: 4,
		    color: 2,
		    font: "‘Palatino Linotype’, ‘Book Antiqua’, Palatino, serif",
		    amount: 3,
		    height: 0,
		    width: 200,
		    spacerTop: 0,
		    spacerBottom: 0,
		    urls: ["", "", ""],
		    texts: ["Basic", "Standard", "Business", "- Free forever<br>- The essentials", "- Extra features<br>- Custom domain", "- The best features<br>- Support 24/7"],
		};
		const emailElement6: EmailElement = {
			project: project,
			position: 600,
		    type: 5,
		    color: 6,
		    font: "",
		    amount: 3,
		    height: 0,
		    width: 200,
		    spacerTop: 0,
		    spacerBottom: 0,
		    urls: ["", "", ""],
		    texts: ["$500 EUR", "£500 USD", "€500 GBP"],
		};
		const emailElement7: EmailElement = {
			project: project,
			position: 700,
		    type: 4,
		    color: 9,
		    font: "‘Courier New’, Courier, monospace",
		    amount: 1,
		    height: 0,
		    width: 650,
		    spacerTop: 10,
		    spacerBottom: 10,
		    urls: ["", "", ""],
		    texts: ["- - - - - - - - - - - - - - - - - - - - - - - - -", "", "", "This email was brought to you by 0kami's ( awesome ) Chi Mail.", "", ""],
		};
		emailElements.push(emailElement1);
		emailElements.push(emailElement2);
		emailElements.push(emailElement3);
		emailElements.push(emailElement4);
		emailElements.push(emailElement5);
		emailElements.push(emailElement6);
		emailElements.push(emailElement7);
		return emailElements;
	},

	APICalls: function(project){
	    const apiCalls: APICall[] = [
	    {id: project+"api1", project: project, status: 0, url:"This is where your calls will be:", response:""},
	    {id: project+"api2", project: project, status: 0, url:"https://unsplash.it/list", response:""},
	    {id: project+"api3", project: project, status: 0, url:"https://slack.com/api/METHOD", response:""},
	    {id: project+"api4", project: project, status: 0, url:"http://api.geonames.org/citiesJSON?north=44.1&south=-9.9&east=-22.4&west=55.2&lang=de&username=demo", response:""},
	    {id: project+"api5", project: project, status: 0, url:"Calls are color coded", response:""},
	    {id: project+"api6", project: project, status: 0, url:"https://api.trello.com/1/members/templatecaller/boards?key=6e6cca64856e3accef2d07d1ce6b5354", response:""},
	    {id: project+"api7", project: project, status: 0, url:"https://api.trello.com/1/organizations/exampleorg/desc?key=[application_key]", response:""},
	    {id: project+"api8", project: project, status: 0, url:"https://api.trello.com/1/cards/o67cdaKE?fields=name,idList&key=6e6cca64856e3accef2d07d1ce6b5354", response:""},
	    {id: project+"api9", project: project, status: 0, url:"https://make a call", response:""},
	    ];
		return apiCalls;
	},
};