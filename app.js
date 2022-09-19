var http = require('http')
var fs = require('fs')
var url = require('url')
var template = require('art-template')

var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678"
});
var comments ;
con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT * FROM MessageBoard.Comments", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        comments = JSON.stringify(result);
        comments = JSON.parse(comments);
        console.log(comments);
    });
});



// 每次重開服務時，預先保存的留言(可省略)
// var comments = [
//   {
//     name: '小白',
//     message: 'Hello',
//     dateTime: '2021-5-27 18:20:54'
//   },
//   {
//     name: '小黑',
//     message: 'There',
//     dateTime: '2021-5-27 18:20:54'
//   }
// ]

http.createServer(function (req, res) {
    var parseObj = url.parse(req.url, true)
    
    var pathname = parseObj.pathname

    // 路由邏輯
    if (pathname === '/') {
      // data = ./views/index.html
      fs.readFile('./views/index.html', function (err, data) {
        if (err) {
          return res.end('Loading index page failed.')
        }
        
        
        // 因為 data 是二進制，所以須轉為 string
        var htmlStr = template.render(data.toString(), { comments: comments })
        res.end(htmlStr)
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

      console.log(comment);
      
      // 取得目前日期時間 (用於紀錄 submit 的時間)
      // today =  2021-05-28T18:40:03.622Z
      var today = new Date();
      
      var date = today.getFullYear() + '-' + (today.getMonth() + 1 ) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + ' ' + time;

      // dateTime = '2021-5-28 21:33:55'
      comment.dateTime = dateTime

      // 將 comment 放到 comments 內 (unshift 代表新 submit 的內容出現在列表最上面)
      comments.unshift(comment)

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