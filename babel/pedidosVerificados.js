'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var db = firebase.database();
var auth = firebase.auth();

function logout() {
  auth.signOut();
}

function mostrarPedidosVerificados() {
  var pedidosVerificados = JSON.parse(localStorage.getItem('pedidosVerificados'));

  var datatable = $('#tablaPedidosVerificados').DataTable({
    data: pedidosVerificados,
    pageLength: 10,
    columns: [{ data: 'clave' }, {
      data: 'fechaCreacionPadre',
      render: function render(fechaCreacionPadre) {
        moment.locale('es');
        return moment(fechaCreacionPadre.substr(3, 2) + '/' + fechaCreacionPadre.substr(0, 2) + '/' + fechaCreacionPadre.substr(6, 4)).format('LL');
      }
    }, { data: 'id',
      className: 'text-center',
      render: function render(id) {
        return '<a href="pedidoPadre.html?id=' + id + '" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-eye-open"></span> Ver m\xE1s</a>';
      }
    }, {
      data: 'id',
      className: 'text-center',
      render: function render(id) {
        return '<button onclick="cargarPedidoPadre(\'' + id + '\')" class="btn btn-primary btn-sm" type="button"><span class="fa fa-truck" aria-control="true"></span></button>';
      }
    }],
    destroy: true,
    ordering: false,
    searching: false,
    language: {
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

function cargarPedidoPadre(idPedidoPadre) {
  swal({
    title: "¿Está seguro de marcar como cargado este pedido?",
    text: "Esta operación no podrá deshacerse.",
    icon: "warning",
    buttons: true,
    dangerMode: true
  }).then(function (willDelete) {
    if (willDelete) {
      db.ref('pedidoPadre/' + idPedidoPadre).update({
        estado: "Cargado"
      });

      swal("El pedido se ha cargado", {
        icon: "success"
      });
    }
  });
}

function mostrarPedidosFinalizados() {
  var pedidosFinalizados = JSON.parse(localStorage.getItem('pedidosFinalizados'));

  var datatable = $('#tablaPedidosFinalizados').DataTable({
    data: pedidosFinalizados,
    pageLength: 10,
    columns: [{ data: 'clave' }, {
      data: 'fechaCreacionPadre',
      render: function render(fechaCreacionPadre) {
        moment.locale('es');
        return moment(fechaCreacionPadre.substr(3, 2) + '/' + fechaCreacionPadre.substr(0, 2) + '/' + fechaCreacionPadre.substr(6, 4)).format('LL');
      }
    }, { data: 'id',
      className: 'text-center',
      render: function render(id) {
        return '<a href="pedidoPadre.html?id=' + id + '" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-eye-open"></span> Ver m\xE1s</a>';
      }
    }],
    destroy: true,
    ordering: false,
    searching: false,
    language: {
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

$('#tabPedidosVerificados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
});

$('#tabPedidosFinalizados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
});

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
      /* mostrarPedidosVerificados();
      mostrarPedidosFinalizados(); */
      //escucharPedidos();
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

  mostrarPedidosVerificados();
  mostrarPedidosFinalizados();
});

function escucharPedidos() {
  db.ref('pedidoPadre').on('value', function (pedidosVerificados) {
    var arrPedidosVerificados = [],
        arrPedidosFinalizados = [];
    pedidosVerificados.forEach(function (pedidoVerificado) {
      var pedido = pedidoVerificado.val();

      if (pedido.estado === "Verificado") {
        arrPedidosVerificados.push(_extends({
          id: pedidoVerificado.key
        }, pedidoVerificado.val()));
      }
      if (pedido.estado === "Finalizado") {
        arrPedidosFinalizados.push(_extends({
          id: pedidoVerificado.key
        }, pedidoVerificado.val()));
      }
    });

    $('#tablaPedidosVerificados').DataTable().destroy();

    var datatable = $('#tablaPedidosVerificados').DataTable({
      data: arrPedidosVerificados,
      pageLength: 10,
      columns: [{ data: 'clave' }, {
        data: 'fechaCreacionPadre',
        render: function render(fechaCreacionPadre) {
          moment.locale('es');
          return moment(fechaCreacionPadre.substr(3, 2) + '/' + fechaCreacionPadre.substr(0, 2) + '/' + fechaCreacionPadre.substr(6, 4)).format('LL');
        }
      }, { data: 'id',
        className: 'text-center',
        render: function render(id) {
          return '<a href="pedidoPadre.html?id=' + id + '" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-eye-open"></span> Ver m\xE1s</a>';
        }
      }, {
        data: 'id',
        className: 'text-center',
        render: function render(id) {
          return '<button onclick="cargarPedidoPadre(\'' + id + '\')" class="btn btn-primary btn-sm" type="button"><span class="fa fa-truck" aria-control="true"></span></button>';
        }
      }],
      destroy: true,
      ordering: false,
      searching: false,
      language: {
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

    var datatable2 = $('#tablaPedidosFinalizados').DataTable({
      data: arrPedidosFinalizados,
      pageLength: 10,
      columns: [{ data: 'clave' }, {
        data: 'fechaCreacionPadre',
        render: function render(fechaCreacionPadre) {
          moment.locale('es');
          return moment(fechaCreacionPadre.substr(3, 2) + '/' + fechaCreacionPadre.substr(0, 2) + '/' + fechaCreacionPadre.substr(6, 4)).format('LL');
        }
      }, { data: 'id',
        className: 'text-center',
        render: function render(id) {
          return '<a href="pedidoPadre.html?id=' + id + '" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-eye-open"></span> Ver m\xE1s</a>';
        }
      }],
      destroy: true,
      ordering: false,
      searching: false,
      language: {
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
  });
}

escucharPedidos();