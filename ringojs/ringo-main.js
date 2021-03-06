var sql = require('sql-ringojs-client');
var mongodb = require('ringo-mongodb');

// DO NOT TOUCH THE FOLLOWING LINE.
// THIS VARIABLE IS REGEX REPLACED BY setup.py
var dbHost = 'localhost';
var mongodbUri = 'mongodb://localhost/hello_world';

exports.app = function(req) {
   var path = req.pathInfo;
   if (path === '/json') {
      var helloObject = {message: "Hello, world"};
      // JSON Response Test
      return {
         status: 200,
         headers: {"Content-Type": "application/json; charset=UTF-8"},
         body: [JSON.stringify(helloObject)]
      }
   } else if (path === '/db') {
      var queryCount = req.env.servletRequest.getParameter('queries');
      try {
         var connection = datasource.getConnection();
         if (queryCount === null) {
            var randId = ((Math.random() * 10000) | 0) + 1
            var world = sql.query(connection, 'select * from World where World.id = ' + randId)[0];
            // let's just hope it gets to this
            connection.close();
            return {
               status: 200,
               headers: {"Content-Type": "application/json; charset=UTF-8"},
               body: [JSON.stringify(world)]
            }
         } else {
            queryCount = parseInt(queryCount, 10);
            var body = [];
            var randId, world;
            for (var i = 0; i < queryCount; i++) {
               randId = ((Math.random() * 10000) | 0) + 1;
               world = sql.query(connection, 'select * from World where World.id = ' + randId)[0];
               body.push(world);
            }
            connection.close();
            return {
               status: 200,
               headers: {"Content-Type": "application/json; charset=UTF-8"},
               body: [JSON.stringify(body)]
            }
         }
      } catch (e) {
         connection.close();
         connection = null;
      } finally {
         if (connection !== null) {
            connection.close();
         }
      }
   } else if (path === '/mongodb') {
      var queryCount = req.env.servletRequest.getParameter('queries') | 1;
      var col = mongodb.connect(mongodbUri).getCollection('world');
      var body = [];
      var randId, world;
      for (var i = 0; i < queryCount; i++) {
         randId = ((Math.random() * 10000) | 0) + 1;
         world = col.findOne(randId);
         body.push(world ? world.data : "Record not found for id#" + randId);
      }
      return {
         status: 200,
         headers: {"Content-Type": "application/json; charset=UTF-8"},
         body: [mongodb.JSON.to(body)]
      };
   }
};


var datasource = module.singleton('pooling-datasource', function() {
  return sql.connect("jdbc:mysql://" + dbHost + "/hello_world", 'benchmarkdbuser', 'benchmarkdbpass');
});

if (require.main == module) {
    require("ringo/httpserver").main(module.id);
}
