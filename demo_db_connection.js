var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("SELECT * FROM MessageBoard.Comments", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

