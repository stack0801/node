var http = require('http');
var fs = require('fs');
var url = require('url');

function TemplateHTML(title, list, body)
{
  return `
  <!doctype html>
  <html>
  <head>
  <title>WEB1 - ${title}</title>
  <meta charset="utf-8">
  </head>
  <body>
  <h1><a href="/">WEB</a></h1>
  ${list}
  <a href="create">create</a>
  ${body}
  </body>
  </html>
  `;
}

function TemplateList(filelist)
{
  var list = '<ul>';
  var i = 0;
  while(i < filelist.length)
  {
    list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
    i++;
  }
  list += '</ul>';

  return list
}

var app = http.createServer(function(request,response)
{
  var _url = request.url;
  var queryData = new URL('http://localhost:3000' + _url).searchParams;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.get('id');

  if(pathname === '/')
  {
    fs.readFile(`data/${title}`, 'utf8', function(err, description)
    {
      if(title === null)
      {
        title = 'Welcome'
        description = 'Hello, Node.js'
      }

      fs.readdir('./data', function(error, filelist)
      {
        var list = TemplateList(filelist);
        var template = TemplateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
        response.writeHead(200);
        response.end(template);
      });
    });
  }
  else if(pathname === '/create')
  {
    fs.readdir('./data', function(error, filelist)
    {
      title = 'Welcome'
      var list = TemplateList(filelist);
      var template = TemplateHTML(title, list, `
        <form action="http://localhost:3000/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `);
      response.writeHead(200);
      response.end(template);
    });
  }
  else if(pathname === '/create_process')
  {
    response.writeHead(200);
    response.end('success');
  }
  else
  {
    response.writeHead(200);
    response.end('Not found');
  }
});
app.listen(3000);
