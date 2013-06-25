// Bring in all your require modules
var express = require( "express" ),
    habitat = require( "habitat" ),
    knox = require( "knox" ),
    makeAPI = require('makeapi'),
    nunjucks = require( "nunjucks" ),
    path = require( "path" ),
    persona = require( "express-persona" );

// Load config from ".env"
habitat.load();

// Generate app variables
var app = express(),
    env = new habitat(),
    middleware = require( "./lib/middleware" ),
    nunjucksEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader( path.join( __dirname + '/views' )));
    routes = require( "./routes" ),
    make = makeAPI.makeAPI({
      apiURL: env.get('MAKE_ENDPOINT'),
      auth: env.get('MAKE_AUTH')
    }),
    s3 = knox.createClient({
      key: env.get("S3_KEY"),
      secret: env.get("S3_SECRET"),
      bucket: env.get("S3_BUCKET")
    });

// Enable template rendering with nunjucks
nunjucksEnv.express( app );
// Don't send the "X-Powered-By: Express" header
app.disable( "x-powered-by" );

// Setup global middleware
app.use( express.logger());
app.use( express.compress());
app.use( express.static( path.join( __dirname + "/public" )));
app.use( express.bodyParser());
app.use( express.cookieParser());
app.use( express.cookieSession({
  secret: env.get( "SESSION_SECRET" ),
  cookie: {
    maxAge: 2678400000 // 31 days. Persona saves session data for 1 month
  },
  proxy: true
}));

app.use( app.router );
app.use( middleware.errorHandler );

// Add Persona authentication
// Must be after app.use() calls, otherwise our middleware doesn't get executed!
persona( app, {
  audience: env.get( "PERSONA_AUDIENCE" )
});

// Express routes
app.get( "/", routes.index );
app.get( "/healthcheck", routes.api.healthcheck );
app.put( "/upload",
  middleware.isAuthenticated,
  middleware.uploadToS3( s3 ),
  middleware.addToMakeAPI( make, env.get( "MAKES_HOST" ) ),
  routes.upload
);

// Start up the server
app.listen( env.get( "PORT", 3000 ), function() {
  console.log( "Server listening (Probably http://localhost:%d )", env.get( "PORT", 3000 ));
});
