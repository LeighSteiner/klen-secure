const authMaster = require('auth-master');
const userAuthenticator = new authMaster(db.Users, {user: function(id){ validationHere }, siteController: function(){...}, admin: function(){}});
// userAuthenticator.isAuthorized(userId);


function authMaster(){
    (function(){
        var thisIsPrivate = {}; 
        return class {
            constructor(modelAuthenticator, authObject){
                this.modelAuthenticator = modelAuthenticator;
                this.authFunctions = authObject || {
                    isUser: function(id){
                        return this.
                    }, 
                    isAdmin: function(id){

                    }
                };
            }
            async checkAuthorizations(userId, typeOfAuth){
                let user = await this.modelAuthenticator.findById(userId);
                if(authFunctions.hasOwnProperty(typeOfAuth)){

                }
                for(let k in this.authFunctions){

                }
                this.authFunction(user);
            }
        }
    })();
    
}