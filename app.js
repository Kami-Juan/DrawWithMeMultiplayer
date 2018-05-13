var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

/* SocketIO */
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* Utilidades */
const { isRealString } = require('./validation');
const { Users } = require('./Users');
var usuarios = new Users();


var index = require('./routes/index');
var login = require('./routes/login');



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/login', login);

io.on('connection', (socket) => {
  console.log('Se conectó un usuario');

  socket.on('join', (params, callback) => {
    var user = usuarios.getUserList(params.room).filter( (name) => name === params.name );


    if(!isRealString(params.name) || !isRealString(params.room)){
        return callback('Nombre y room son requeridos');        
    }else if(user.length > 0){
        return callback(`El usuario ${ params.name } ya existe en el room ${ params.room }`);
    }

    console.log(params.room);
    console.log(params.name);

    socket.join(params.room);
    usuarios.removeUser(socket.id);

    usuarios.addUsers( socket.id, params.name, params.room );
    usuarios.addRoom( params.room );   
    
    io.to(params.room).emit('updateUserList', usuarios.getUserList(params.room));

    socket.emit('newMensaje', {from: 'Admin', texto: 'Bienvenidos al chat room'});

    socket.broadcast.to(params.room).emit('newMensaje', {from: 'Admin', texto: `${params.name} está conectado`});
    
    callback();
  });

  socket.on('sendRooms', (msg, callback) => {            
    callback(usuarios.room);
  });

  socket.on('roomie', ( params, callback ) => {
    io.emit('room',usuarios.room );
    callback();
  });

  socket.on('updateScore', ( score) => {
    var user = usuarios.getUser(socket.id);
    usuarios.setScore(socket.id, score);
    if( user ){
      io.to(user.room).emit('updateUserList', usuarios.getUserList(user.room));
      io.to(user.room).emit('newScoreUser', {from: `${user.name}`, texto: `Su score es de ${user.score}`});         
    }
  });

  socket.on('disconnect', () => {
    console.log('usuario desconectado');
    var user = usuarios.removeUser(socket.id);

    if( user ){
        var sizeRoom = usuarios.getUserList(user.room);

        if( sizeRoom.length === 0 ){
            var roomRemove = usuarios.removeRoom(user.room);
            io.emit('room', usuarios.getListRoom());
        }

        io.to(user.room).emit('updateUserList', usuarios.getUserList(user.room));
        io.to(user.room).emit('newMensaje', {from: 'Admin', texto: `${user.name} se desconectó`});
    }
});

});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
