import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Projects, APICalls } from '../imports/pubsub';
import { Project, APICall } from '../imports/interfaces';

if (Meteor.isServer) {
	Meteor.startup(function() {
		return Meteor.methods({
			'addCallItem': function(currentProjectId, url){
				if ((url.indexOf("http://") !== 0) && (url.indexOf("https://") !== 0)) {
					return;
				}
	   		},

	   		'removeCallItem': function(apiCall){
	    		APICalls.remove(apiCall);

	   		},

	   		'runAll': function(currentProjectId){
	    		const apiCalls: APICall[] = APICalls.find({project: currentProjectId}).fetch() as APICall[];
				let callURL = function(callItem) {
					let url = callItem.url;
					if ((url.indexOf("http://") !== 0) && (url.indexOf("https://") !== 0)) {
						APICalls.update(callItem._id, {
							$set: { status: 101 },
						});
						return;
					}
			    	HTTP.get(url, {}, function(error, response){
						if (error) {
							if (error.response && error.response.statusCode) {
								APICalls.update(callItem._id, {
									$set: { status: error.response.statusCode },
								});
							}
						} else if(!error) {
							APICalls.update(callItem._id, {
								$set: { 
									status: response.statusCode,
									response: response,
								},
							});
			    		}
			    	});
				}
				for (var i = 0; i < apiCalls.length; ++i) {
					callURL(apiCalls[i]);
				}
	   		},
		});
	});
}