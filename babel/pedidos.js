'use strict';

var db = firebase.database();
var auth = firebase.auth();

function logout() {
  auth.signOut();
}

function mostrarPedidos() {
  var pedidos = JSON.parse(localStorage.getItem('pedidos'));
  var datatable = $('#tablaPedidos').DataTable({
    data: pedidos,
    pageLength: 10,
    lengthMenu: [[10, 20, 30, 40, 50, -1], [10, 20, 30, 40, 50, "Todos"]],
    columns: [{ data: 'id' }, { data: 'encabezado.clave', className: 'text-center' }, { data: 'encabezado.numOrden', defaultContent: '' }, {
      data: 'encabezado.fechaCaptura',
      render: function render(fechaCaptura) {
        moment.locale('es');
        return moment(fechaCaptura.substr(3, 2) + '/' + fechaCaptura.substr(0, 2) + '/' + fechaCaptura.substr(6, 4)).format('LL');
      }
    }, { data: 'encabezado.tienda' }, { data: 'encabezado.ruta', className: 'text-center' }, {
      data: 'id',
      className: 'text-center',
      render: function render(id) {
        return '<a type="button" href="pedido.html?id=' + id + '" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-eye-open"></span> Ver m\xE1s</a>';
      }
    }, { className: 'text-center', defaultContent: '<span style="background-color:#d50000; color:#FFFFFF;" class="badge">Pendiente</span>' }],
    destroy: true,
    ordering: false,
    language: {
      searchPlaceholder: "Buscar pedido",
      sProcessing: 'Procesando...',
      sLengthMenu: 'Mostrar _MENU_ registros',
      sZeroRecords: 'No se encontraron resultados',
      sEmptyTable: 'Ningún dato disponible en esta tabla',
      sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
      sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
      sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
      sInfoPostFix: '',
      sSearch: '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>',
      sUrl: '',
      sInfoThousands: ',',
      sLoadingRecords: 'Cargando...',
      oPaginate: {
        sFirst: 'Primero',
        sLast: 'Último',
        sNext: 'Siguiente',
        sPrevious: 'Anterior'
      },
      oAria: {
        sSortAscending: ': Activar para ordenar la columna de manera ascendente',
        sSortDescending: ': Activar para ordenar la columna de manera descendente'
      }
    }
  });
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
      mostrarPedidos();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarNotificaciones() {
  var usuario = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + usuario + '/lista');
  notificacionesRef.on('value', function (snapshot) {
    var lista = snapshot.val();
    var lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    var arrayNotificaciones = [];
    for (var notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for (var i in arrayNotificaciones) {
      var date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      var fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>\n                <a>\n                  <div>\n                    <i class="fa fa-comment fa-fw"></i>' + arrayNotificaciones[i].mensaje + '\n                    <span class="pull-right text-muted small">' + fecha + '</span>\n                  </div>\n                </a>\n              </li>';
    }

    $('#contenedorNotificaciones').html(lis);
  });
}

function mostrarContador() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.on('value', function (snapshot) {
    var cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    } else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});