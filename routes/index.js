// Isn't it awesome how simple these rendering functions are?
// Let combinations of middleware handle the heavy lifting for you
module.exports = function(make) {
  return {
    index: function( req, res ) {
      var makes;
      make.find({ email: req.session.email }).sortByField("createdAt", "desc" ).then( function(err, data) {
        if ( err ) {
          makes = [];
          console.log( err );
        } else {
          makes = data;
        }
        res.render( "index.html", { email: req.session.email, makes: makes });
      });
    },
    upload: function( req, res ) {
      res.json(200, { url: req.s3Url, make: req.make });
    },
    api: {
      healthcheck: require( "./api/healthcheck")
    }
  };
};
