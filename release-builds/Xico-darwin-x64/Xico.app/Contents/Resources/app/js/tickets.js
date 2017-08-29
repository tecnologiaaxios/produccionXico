const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function mostrarModal(idTicket) {
  $('#modalResponder').attr('data-idticket', idTicket);
  $('#modalResponder').modal('show');
}

function mostrarTicketsCalidadProducto(estado) {
  let ticketsRef = db.ref('tickets/calidadProducto');
  ticketsRef.orderByChild("estado").equalTo(estado).on("value", function(snapshot) {
    let tickets = snapshot.val();

    if(estado == "Pendiente") {
      $('#tablaCalidadProductoPendientes tbody').empty();

      for(let ticket in tickets) {
        let diaCaducidad = tickets[ticket].fechaCaducidad.substr(0,2);
        let mesCaducidad = tickets[ticket].fechaCaducidad.substr(3,2);
        let añoCaducidad = tickets[ticket].fechaCaducidad.substr(6,4);
        let fechaCaducidad = mesCaducidad + '/' + diaCaducidad + '/' + añoCaducidad;
        moment.locale('es');
        let fechaCaducidadMostrar = moment(fechaCaducidad).format('LL');

        let dia = tickets[ticket].fecha.substr(0,2);
        let mes = tickets[ticket].fecha.substr(3,2);
        let año = tickets[ticket].fecha.substr(6,4);
        let fecha = mes + '/' + dia + '/' + año;
        let fechaMostrar = moment(fecha).format('LL');

        let tr = $('<tr/>');
        let tds = '<td>' + tickets[ticket].clave + '</td>' +
                  '<td>' + tickets[ticket].producto + '</td>' +
                  '<td>' + tickets[ticket].cantidad + '</td>' +
                  '<td>' + tickets[ticket].lote + '</td>' +
                  '<td>' + fechaCaducidadMostrar + '</td>' +
                  '<td>' + tickets[ticket].tienda + '</td>' +
                  '<td>' + tickets[ticket].problema + '</td>' +
                  '<td style="max-width: 500px;">' + tickets[ticket].descripcion + '</td>' +
                  '<td>' + fechaMostrar + '</td>' +
                  '<td><span style="background-color: #FFAD00" class="badge">Pendiente</span></td>';
        let td = $('<td/>', {'style': 'display: flex; justify-content: center;'});
        let button = $('<button/>', {
          'onclick': 'mostrarModal("'+ticket+'")',
          'class': 'btn btn-danger btn-xs',
          html: '<span class="fa fa-comment" aria-hidden="true"></span> Responder'
        });

        td.append(button);
        tr.append(tds);
        tr.append(td);
        $('#tablaCalidadProductoPendientes tbody').append(tr);
      }
    }
    if(estado == "Respondido") {
      $('#tablaCalidadProductoRespondidos tbody').empty();

      for(let ticket in tickets) {
        let diaCaducidad = tickets[ticket].fechaCaducidad.substr(0,2);
        let mesCaducidad = tickets[ticket].fechaCaducidad.substr(3,2);
        let añoCaducidad = tickets[ticket].fechaCaducidad.substr(6,4);
        let fechaCaducidad = mesCaducidad + '/' + diaCaducidad + '/' + añoCaducidad;
        moment.locale('es');
        let fechaCaducidadMostrar = moment(fechaCaducidad).format('LL');

        let dia = tickets[ticket].fecha.substr(0,2);
        let mes = tickets[ticket].fecha.substr(3,2);
        let año = tickets[ticket].fecha.substr(6,4);
        let fecha = mes + '/' + dia + '/' + año;
        let fechaMostrar = moment(fecha).format('LL');

        let tr = $('<tr/>');
        let tds = '<td>' + tickets[ticket].clave + '</td>' +
                  '<td>' + tickets[ticket].producto + '</td>' +
                  '<td>' + tickets[ticket].cantidad + '</td>' +
                  '<td>' + tickets[ticket].lote + '</td>' +
                  '<td>' + fechaCaducidadMostrar + '</td>' +
                  '<td>' + tickets[ticket].tienda + '</td>' +
                  '<td>' + tickets[ticket].problema + '</td>' +
                  '<td style="max-width: 500px;">' + tickets[ticket].descripcion + '</td>' +
                  '<td>' + fechaMostrar + '</td>' +
                  '<td><span style="background-color: #00CD00" class="badge">Respondido</span></td>';
        tr.append(tds);
        $('#tablaCalidadProductoRespondidos tbody').append(tr);
      }
    }
  });
}

function enviarMensaje() {
  let idTicket = $('#modalResponder').attr('data-idticket');
  let respuesta = $('#respuesta').val();

  if(respuesta.length > 0) {
    let ticketsRef = db.ref('tickets/calidadProducto/'+idTicket);
    ticketsRef.update({respuesta: respuesta, estado: "Respondido"});
    $('#respuesta').val('');

    $('#helpblockRespuesta').hide();
    $('#modalResponder').modal('hide');
  }
  else {
    $('#respuesta').parent().addClass('has-error');
    $('#helpblockRespuesta').show();
  }
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    if (user) { //si hay un usuario
      mostrarTicketsCalidadProducto("Pendiente");
      mostrarTicketsCalidadProducto("Respondido")
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+usuario+'/lista');
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    let lis = "";

    let arrayNotificaciones = [];
    for(let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for(let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>' +
               '<a>' +
                '<div>' +
                  '<i class="fa fa-comment fa-fw"></i> ' + arrayNotificaciones[i].mensaje +
                    '<span class="pull-right text-muted small">'+fecha+'</span>' +
                '</div>' +
               '</a>' +
             '</li>';
    }

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
  });
}

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+uid);
  notificacionesRef.on('value', function(snapshot) {
    let cont = snapshot.val().cont;

    if(cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+uid);
  notificacionesRef.update({cont: 0});
}

$('#campana').click(function() {
  verNotificaciones();
});

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();
});

function ticketsPendientes() {
  $('#ticketsPendientes').show();
  $('#ticketsRespondidos').hide();
}

function ticketsRespondidos() {
  $('#ticketsPendientes').hide();
  $('#ticketsRespondidos').show();
}
