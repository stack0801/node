var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var template = require('./lib/template.js')

var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = new URL('http://localhost:3000' + _url).searchParams;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.get('id');

  var filterdID = path.basename('' + title);

  if(pathname === '/')
  {
    fs.readFile(`data/${filterdID}`, 'utf8', function(err, description)
    {
      fs.readdir('./data', function(error, filelist)
      {
        var list = template.list(filelist);

        if(title === null)
        {
          title = 'Welcome'
          description = 'Hello, Node.js'

          var html = template.html(title, list,
            `<h2>${title}</h2><p>${description}</p>`,
            ''
          );
        }
        else
        {
          var html = template.html(title, list,
            `<h2>${title}</h2><p>${description}</p>`,
            `<a href="/create">create</a>
            <a href="/update?id=${title}">update</a> 
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <input type="submit" value="delete">
            </form>`
          );
        }

        response.writeHead(200);
        response.end(html);
      });
    });
  }
  else if(pathname === '/create')
  {
    fs.readdir('./data', function(error, filelist)
    {
      var list = template.list(filelist);
      var html = template.html(title, list,
        `<form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `, '');
      response.writeHead(200);
      response.end(html);
    });
  }
  else if(pathname === '/create_process')
  {
    var body = '';
    
    request.on('data', function(data){
      body += data;
    });

    request.on('end', function(){
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;

      fs.writeFile(`data/${filterdID}`, description, 'utf8', function(err)
      {
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      })
    });
  }
  else if(pathname === '/update')
  {
    fs.readdir('./data', function(error, filelist)
    {
      fs.readFile(`data/${filterdID}`, 'utf8', function(err, description)
      {
        var list = template.list(filelist);
        var html = template.html(title, list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          ''
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  }
  else if(pathname === '/update_process')
  {
    var body = '';
    request.on('data', function(data)
    {
        body = body + data;
    });
    request.on('end', function()
    {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        var filterdid = path.basename('' + id);
        fs.rename(`data/${filterdid}`, `data/${filterdID}`, function(error)
        {
          fs.writeFile(`data/${filterdID}`, description, 'utf8', function(err)
          {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
        });
    });
  }
  else if(pathname === '/delete_process')
  {
    var body = '';
    request.on('data', function(data)
    {
        body = body + data;
    });
    request.on('end', function()
    {
        var post = qs.parse(body);
        var id = post.id;
        var filterdid = path.basename('' + id);
        fs.unlink(`data/${filterdid}`, function(error)
        {
          response.writeHead(302, {Location: `/`});
          response.end();
        })
    });
  }
  else
  {
    response.writeHead(404);
    response.end('Not found');
  }
});

app.listen(3000);
