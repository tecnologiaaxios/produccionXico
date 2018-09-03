'use strict';

var db = firebase.database();
var auth = firebase.auth();

var LANGUAGE = {
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
};

function logout() {
  auth.signOut();
}

function mostrarPedidosVerificados() {
  $('#loaderPedidosVerificados').removeClass('hidden');

  var datatable = $('#tablaPedidosVerificados').DataTable({
    destroy: true,
    pageLength: 10,
    ordering: false,
    searching: false,
    language: LANGUAGE
  });

  db.ref('pedidoPadre').orderByChild('estado').equalTo('Verificado').on('value', function (pedidosVerificados) {
    var pedidos = pedidosVerificados.val();

    datatable.clear();
    moment.locale('es');
    var filas = "";
    for (var pedido in pedidos) {
      var fecha = pedidos[pedido].fechaCreacionPadre.split('/');
      var fecha2 = pedidos[pedido].fechaRuta.split('/');
      var fechaCreacionPadre = moment(fecha[1] + '/' + fecha[0] + '/' + fecha[2]).format('LL');
      var fechaRuta = moment(fecha2[1] + '/' + fecha2[0] + '/' + fecha2[2]).format('LL');

      filas += '<tr>\n                  <td>' + pedidos[pedido].clave + '</td>\n                  <td>' + fechaCreacionPadre + '</td>\n                  <td>' + fechaRuta + '</td>\n                  <td>' + pedidos[pedido].ruta + '</td>\n                  <td class="text-center"><a href="pedidoPadre.html?id=' + pedido + '" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-eye-open"></span> Ver m\xE1s</a></td>\n                  <td class="text-center"><button onclick="cargarPedidoPadre(\'' + pedido + '\')" class="btn btn-primary btn-sm" type="button"><span class="fa fa-truck" aria-control="true"></span></button></td>\n                </tr>';
    }
    $('#loaderPedidosVerificados').addClass('hidden');
    $('#tablaPedidosVerificados').removeClass('hidden');
    datatable.rows.add($(filas)).columns.adjust().draw();
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
  $('#loaderPedidosFinalizados').removeClass('hidden');

  var datatable = $('#tablaPedidosFinalizados').DataTable({
    destroy: true,
    pageLength: 10,
    ordering: false,
    searching: false,
    language: LANGUAGE
  });

  db.ref('pedidoPadre').orderByChild('estado').equalTo('Finalizado').on('value', function (pedidosVerificados) {
    var pedidos = pedidosVerificados.val();

    datatable.clear();
    moment.locale('es');
    var filas = "";
    for (var pedido in pedidos) {
      var fecha = pedidos[pedido].fechaCreacionPadre.split('/');
      var fecha2 = pedidos[pedido].fechaRuta.split('/');
      var fechaCreacionPadre = moment(fecha[1] + '/' + fecha[0] + '/' + fecha[2]).format('LL');
      var fechaRuta = moment(fecha2[1] + '/' + fecha2[0] + '/' + fecha2[2]).format('LL');

      filas += '<tr>\n                  <td>' + pedidos[pedido].clave + '</td>\n                  <td>' + fechaCreacionPadre + '</td>\n                  <td>' + fechaRuta + '</td>\n                  <td>' + pedidos[pedido].ruta + '</td>\n                  <td class="text-center"><a href="pedidoPadre.html?id=' + pedido + '" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-eye-open"></span> Ver m\xE1s</a></td>\n                </tr>';
    }
    $('#loaderPedidosFinalizados').addClass('hidden');
    $('#tablaPedidosFinalizados').removeClass('hidden');
    datatable.rows.add($(filas)).columns.adjust().draw();
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

/* function escucharPedidos() {
  db.ref(`pedidoPadre`).on('value', (pedidosVerificados) => {
    let arrPedidosVerificados = [], arrPedidosFinalizados = [];
    pedidosVerificados.forEach(pedidoVerificado => {
      let pedido = pedidoVerificado.val();

      if(pedido.estado === "Verificado") {
        arrPedidosVerificados.push({
          id: pedidoVerificado.key,
          ...pedidoVerificado.val()
        });
      }
      if(pedido.estado === "Finalizado") {
        arrPedidosFinalizados.push({
          id: pedidoVerificado.key,
          ...pedidoVerificado.val()
        });
      }
    });

    $('#tablaPedidosVerificados').DataTable().destroy();

    let datatable = $('#tablaPedidosVerificados').DataTable({
      data: arrPedidosVerificados,
      pageLength: 10,
      columns: [
        { data: 'clave' },
        {
          data: 'fechaCreacionPadre',
          render: (fechaCreacionPadre) => {
            moment.locale('es');
            return moment(`${fechaCreacionPadre.substr(3,2)}/${fechaCreacionPadre.substr(0,2)}/${fechaCreacionPadre.substr(6,4)}`).format('LL')
          }
        },
        { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<a href="pedidoPadre.html?id=${id}" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-eye-open"></span> Ver más</a>`
          }
        },
        {
          data: 'id',
          className: 'text-center',
          render: (id) => {
            return `<button onclick="cargarPedidoPadre('${id}')" class="btn btn-primary btn-sm" type="button"><span class="fa fa-truck" aria-control="true"></span></button>`
          }
        }
      ],
      destroy: true,
      ordering: false,
      searching: false,
      language: LANGUAGE
    });

    let datatable2 = $('#tablaPedidosFinalizados').DataTable({
      data: arrPedidosFinalizados,
      pageLength: 10,
      columns: [
        { data: 'clave' },
        {
          data: 'fechaCreacionPadre',
          render: (fechaCreacionPadre) => {
            moment.locale('es');
            return moment(`${fechaCreacionPadre.substr(3,2)}/${fechaCreacionPadre.substr(0,2)}/${fechaCreacionPadre.substr(6,4)}`).format('LL')
          }
        },
        { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<a href="pedidoPadre.html?id=${id}" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-eye-open"></span> Ver más</a>`
          }
        },
      ],
      destroy: true,
      ordering: false,
      searching: false,
      language: LANGUAGE
    });
  });
}

escucharPedidos(); */