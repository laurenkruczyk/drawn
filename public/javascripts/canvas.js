var path;
var paths = {};
var currentUID = new Date().getTime();

onMouseDown = function(event) {
  path = new Path();
  path.strokeColor = 'black';
  path.strokeWidth = 20;
  path.strokeCap = 'round';
  path.add(event.point);
  socket.emit('draw:started', currentUID, {x: event.point.x, y: event.point.y});
}

onMouseDrag = function(event) {
  path.add(event.point);
  socket.emit('draw:progress', currentUID, {x: event.point.x, y: event.point.y});
}

onMouseUp = function(event) {
  path.smooth();
  socket.emit('draw:done', currentUID);
}

socket.on('draw:started', function(uid, event) {
  if ( currentUID !== uid && event ) {
    paths[uid] = new Path();
    path = paths[uid];
    var point = new Point(event.x, event.y)

    path.strokeColor = 'black';
    path.strokeWidth = 20;
    path.strokeCap = 'round';
    path.add(point);
    paper.view.update();
  }
});

socket.on('draw:progress', function(uid, event) {
  if ( currentUID !== uid && event ) {
    path = paths[uid];
    var point = new Point(event.x, event.y)
    path.add(point);
    paper.view.update();
  }
});

socket.on('draw:done', function(uid) {
  if ( currentUID !== uid ) {
    paths[uid].smooth();
    paths[uid] = null;
  }
});

socket.on('draw:canvasExport', function(data) {
  paper.project.importJSON(data);
});

socket.on('draw:joined', function(id) {
  var data = paper.project.exportJSON();
  socket.emit('draw:canvasExport', id, data);
});

socket.on('draw:canvasImport', function(data) {
  paper.project.importJSON(data);
  paper.view.update();
});
