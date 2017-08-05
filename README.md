<b>klen-secure</b> 

  klen-secure is an npm module to create customizeable backend route security, free of most specific backend dependencies 
(does not specifically require express, or postgres or sequelize, for example).  It is dependent on passport, in order to make
use of the request user object after log in. 

 Your authorization functions are kept as private properties scoped so that the main functions of the 
module can use them, but they <b>cannot be overwritten or manipulated elsewhere in your application.</b> 

  The module primarily produces two pieces of middleware.  The first, <b>checkAuthorizations</b>, cycles through all
of the functions on your authObject, and attaches a "clearance" property to the request's user, which has a array
of all clearance levels to which a particular user has access. 

  The second, <b>authFailLogger</b> has two purposes.  It should be passed as middleware into any route (see Usage examples below) which requires a particular clearance level to access.  authFailLogger handles both preventing and allowing access appropriately, based on a users clearances, and creates a log of userIds which make any particular bad request, allowing you to see which users are attempting to access protected areas of your application.
  
  There is also a secondary function, <b>singleRouteSecure</b>.  With checkAuthorizations, all of your authFunctions (which are likely to be DB queries, and therefore slow) are run once, and only once, and thereafter, only the clearances array is checked, which is much more efficient.  However, *if* your application has very cases where it will be checking clearance level, using the singleRoute middleware might be a superior options, as it only queries the DB at the absolute last possible moment.

<b>----------
! Set up !
----------</b>
<br>

  The authMaster (the export from klen-secure) takes a reference to a model on which to run the authentication checks, an object containing your custom authorization functions (which defaults, for illustration purposes, to a series of Sequelize calls to a PostgresDB), and a boolean (default set to false) which allows access to the getAuthFailLog function (as opposed to the viewAuthFailLog).  Once required and initialized, you can secure as many of your routes as required.  
  
<b>----------
! Usage !
----------</b>
  <br>
1. npm install --save klen-secure
2. in the appropriate file:<br>
  const authMaster = require('klen-secure')(); //you MUST invoke authMaster in order to access its functionality
3. create your authenticator instance, with the model on which to authenticate, your authFuncs object and the logViewBool
 <br> const userAuthenticator = new authMaster(User, authObject, true);
4. after login, use the checkAuthorizations middleware to attach clearances to your user: <br>
  router.use(userAuthenticator.checkAuthorizations())
5.  secure your routes!<br>
  router.get('/ModsOnly', userAuthenticator.authFailLogger('isMod'), (req, res,next) => {
	  res.send('Welcome to the Mod Page!');})
  
