//usage
// const authMaster = require('auth-master')();
// const userAuthenticator = new authMaster(db.Users, {user: function(id){ validationHere }, siteController: function(){...}, admin: function(){}});
// userAuthenticator.isAuthorized(userId);


function authMaster(){
	return (function(){
		var secretLocation = {};
		var secretId = 0;
		return class {
			constructor(modelAuthenticator, authObject, logViewBool){

				this.id = secretId++
				secretLocation[this.id] = {
					logViewBool : logViewBool || false, //default setting is that you canNOT modify the log 
					viewAuthFailLog : this.viewAuthFailLog, 
					getAuthFailLog : this.getAuthFailLog
				};

				this.modelAuthenticator = modelAuthenticator;

				secretLocation[this.id].authFailLog = {};

				secretLocation[this.id].authObject = authObject || {  //can we contain the Sequelize in the authObj? 
					 isUser : async (id) => {                        // async await requires at least Node 7.6
						let user = await this.modelAuthenticator.findById(id)
						return !!user;
					}, 
					isMod : async (id) => {
						let user = await this.modelAuthenticator.findById(id)
						 return !!user.isMod;
					},
					isAdmin: async (id) =>{
						let user = await this.modelAuthenticator.findById(id)
						return !!user.isAdmin; 
					},
					isSiteController : async (id) => {
						let user = await this.modelAuthenticator.findById(id)
						return !!user.isSiteController;
					}
				}


			}

			checkAuthorizations(){ 
			 	let output = [];
			 	return async (req,res,next) => {
			 		if(req.user){
					 		for (let k in secretLocation[this.id].authObject){
					 			let test = await secretLocation[this.id].authObject[k](req.user.id);
						 		if (test){
						 			output.push(k);
						 		}
					 		
				 		} 
				 		req.user.clearances = output.filter((elem,ind)=> output.indexOf(elem) === ind);
					 	console.log('clearance: ',req.user.clearances)
				 		next();
				 	}else{
				 		next(new Error('checkAuth: user is not logged in'));
				 	}
			 	}
			 }

			 authFailLogger(whichAuth){
			 	return (req,res,next) => {
				 	if (req.user){
				 		if(secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
				 			if (req.user.clearances.includes(whichAuth)){
				 				next();
				 			}else{
				 				if (secretLocation[this.id].authFailLog[whichAuth]){
				 					secretLocation[this.id].authFailLog[whichAuth].push(req.user.id);
				 					console.log(secretLocation[this.id].authFailLog[whichAuth]);

				 				}else{
				 					secretLocation[this.id].authFailLog[whichAuth] = [req.user.id];
				 					console.log(whichAuth, "Fail Log: ",secretLocation[this.id].authFailLog[whichAuth])
				 				}
				 				next(new Error('You do not have valid clearance'));
				 			}
				 		}else{
				 			 next(new Error('not a valid authorization check'));
				 		}
				 	}else{
			 			next(new Error('authFailLog: user is not logged in'));
			 		}	
			 	}
			 }
			
			singleRouteSecure(whichAuth){
				return async (req,res,next) => {
					if (req.user){
						if(secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
							let test = await secretLocation[this.id].authObject[whichAuth](req.user.id);
							if(test){
								next();
							}else{
								if (secretLocation[this.id].authFailLog[whichAuth]){
				 					secretLocation[this.id].authFailLog[whichAuth].push(req.user.id);
				 					console.log(whichAuth, 'Fail Log: ',secretLocation[this.id].authFailLog[whichAuth]);
				 					next(new Error('single route: you do not have clearance'));

				 				}else{
				 					secretLocation[this.id].authFailLog[whichAuth] = [req.user.id];
				 					console.log(whichAuth, "Fail Log: ",secretLocation[this.id].authFailLog[whichAuth])
				 					next(new Error('single route: you do not have clearance'));
				 				}
				 			}

						}else{
							next(new Error('singleRouteSecure: not a valid authorization check'))
						}
					}else{
						next(new Error('singleRouteSecure: user is not logged in'));
					}
				}
			}
			getAuthFailLog(){
				return (req, res, next) => {
					console.log('logViewBool',secretLocation[this.id].logViewBool);
					if(secretLocation[this.id].logViewBool){

					req.user.authFailLog = secretLocation[this.id].authFailLog;
					next();  
				}else{
					next(new Error('you cannot modify this log'));
				}
				}
			}

			viewAuthFailLog(){
				return (req,res,next) => {
					req.user.authFailLog = JSON.stringify(secretLocation[this.id].authFailLog);
					next();
				}
			}
		}
	}
	)();
}
module.exports = authMaster;