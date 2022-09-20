var http = require('http')
var fs = require('fs')
var url = require('url')
var template = require('art-template')

var mysql = require('mysql');

function createConnection(){
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "MessageBoard"
  });
  return con;
}

var connection = null;

http.createServer(function (req, res) {
    var parseObj = url.parse(req.url, true);
    // console.log(parseObj);
    var pathname = parseObj.pathname;
    var postId = parseObj.query.id;
    // console.log(pathname)

    // 路由邏輯
    if (pathname === '/') {
      // data = ./views/index.html
      fs.readFile('./views/index.html', function (err, data) {
        if (err) {
          return res.end('Loading index page failed.')
        }
        connection = createConnection();

        var comments ;
        connection.connect(function(err) {
            if (err) throw err;
        });
        connection.query("SELECT * FROM Comments ORDER BY post_time DESC", function (err, result, fields) {
          if (err) throw err;
          // console.log(result);
          comments = JSON.stringify(result);
          comments = JSON.parse(comments);
          
          // console.log(comments)
          connection.end();
          // 因為 data 是二進制，所以須轉為 string
          var htmlStr = template.render(data.toString(), { comments: comments });
          res.end(htmlStr);
        });
        
      })
    }
    // Post page
    else if (pathname === '/post') {
      // data = ./views/post.html
      fs.readFile('./views/post.html', function (err, data) {
        if (err) {
          return res.end('Loading post page failed.')
        }
        res.end(data)
      })
    }

    else if (pathname.indexOf('/public/') === 0) {
      fs.readFile('.' + pathname, function (err, data) {
        if (err) {
          return res.end('Loading public folder failed.')
        }
        res.end(data)
      })
    }
    // Click submit
    else if (pathname === '/submit') {

      // 取得 submit 的 data
      // comment = query: [Object: null prototype] { name: 'Leon', message: 'Say something' }
      var comment = parseObj.query;
      var name = comment.name;
      var message = comment.message;

      // console.log(comment);

      connection = createConnection();

      connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
      var sql = `INSERT INTO Comments (name, message) VALUES ('${name}', '${message}')`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        
      });
      // connection.end();

      // 設定狀態碼為 302 (網頁重定向)，用於網頁自動跳轉
      res.statusCode = 302
      // 跳轉至首頁
      res.setHeader('Location', '/')
      res.end()
    }

    else if (pathname === '/update' ) {
      
      // data = ./views/post.html
      fs.readFile('./views/update.html', function (err, data) {
        if (err) {
          return res.end('Loading post page failed.')
        }
        // var htmlStr = template.render(data.toString(), {
        //   name: "comments[0].name"
        // });
        // console.log(htmlStr);
        // res.end(htmlStr);
        connection = createConnection();

        var comments ;
        connection.connect(function(err) {
            if (err) throw err;
        });
        // console.log(postId);
        connection.query(`SELECT * FROM Comments WHERE id='${postId}'`, function (err, result, fields) {
          if (err) throw err;
          // console.log(result);
          comments = JSON.stringify(result);
          comments = JSON.parse(comments);
          
          // console.log(comments)
          // console.log(comments[0].name)
          connection.end();
          // 因為 data 是二進制，所以須轉為 string

          var htmlStr = template.render(data.toString(), {
            id: comments[0].id,
            name: comments[0].name,
            message: comments[0].message
          });
          // console.log(htmlStr);
          res.end(htmlStr);
          
        });
        
      })
    }

    else if (pathname === '/submit-update') {

      // 取得 submit 的 data
      // comment = query: [Object: null prototype] { name: 'Leon', message: 'Say something' }
      var comment = parseObj.query;
      var name = comment.name;
      var message = comment.message;
      var postId = comment.id;

      // console.log(comment);

      connection = createConnection();

      connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
      var sql = `UPDATE Comments SET name='${name}', message='${message}' WHERE id='${postId}'`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record Updated");
        
      });
      // connection.end();

      // 設定狀態碼為 302 (網頁重定向)，用於網頁自動跳轉
      res.statusCode = 302
      // 跳轉至首頁
      res.setHeader('Location', '/')
      res.end()
    }

    else if (pathname === '/delete') {

      // 取得 submit 的 data
      // comment = query: [Object: null prototype] { name: 'Leon', message: 'Say something' }
      var postId = parseObj.query.id;

      // console.log(comment);

      connection = createConnection();

      connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
      var sql = `DELETE FROM Comments WHERE id='${postId}'`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record Deleted");
        
      });
      // connection.end();

      // 設定狀態碼為 302 (網頁重定向)，用於網頁自動跳轉
      res.statusCode = 302
      // 跳轉至首頁
      res.setHeader('Location', '/')
      res.end()
    }

    // 設定 page 404 
    else {
      fs.readFile('./views/404.html', function (err, data) {
        if (err) {
          return res.end('404 Not Found.')
        }
        res.end(data)
      })
    }
  })
  .listen(3000, function () {
    console.log('running...')
  })