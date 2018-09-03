"use strict";

//import { DH_NOT_SUITABLE_GENERATOR } from 'constants';

var db = firebase.database();
var auth = firebase.auth();
var Tpz, Tkg;

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
      mostrarDatos();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

function mostrarDatos() {
  var idPedidoPadre = getQueryVariable('id');

  var pedidoPadreRef = db.ref("pedidoPadre/" + idPedidoPadre);
  pedidoPadreRef.on('value', function (snapshot) {
    var datos = snapshot.val();
    $('#numPedido').html("Pedido: " + datos.clave);

    var diaCaptura = datos.fechaCreacionPadre.substr(0, 2);
    var mesCaptura = datos.fechaCreacionPadre.substr(3, 2);
    var añoCaptura = datos.fechaCreacionPadre.substr(6, 4);
    var fechaCreacion = mesCaptura + "/" + diaCaptura + "/" + añoCaptura;
    moment.locale('es');
    var fechaCreacionMostrar = moment(fechaCreacion).format('LL');
    $('#fechaPedido').html("Ruta: " + datos.ruta + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Recibido el " + fechaCreacionMostrar);
  });
}

function llenarSelectTiendas() {
  var idPedidoPadre = getQueryVariable('id');
  var tiendasRef = db.ref("pedidoPadre/" + idPedidoPadre + "/pedidosHijos");

  tiendasRef.on('value', function (snapshot) {
    var pedidosHijos = snapshot.val();
    var options = "<option value=\"Todas\">Todas las tiendas</option>";
    var optionsChecado = "";
    for (var pedidoHijo in pedidosHijos) {
      options += "<option value=\"" + pedidoHijo + "\">" + pedidosHijos[pedidoHijo].encabezado.tienda + "</option>";
      optionsChecado += "<option value=\"" + pedidoHijo + "\">" + pedidosHijos[pedidoHijo].encabezado.tienda + "</option>";
    }

    $('#tiendas').html(options);
    $('#tiendasChecado').html(optionsChecado);
  });
}

llenarSelectTiendas();

$('#tiendasChecado').change(function () {
  var tiendaChecada = $(this).val();
  mostrarUnaChecada(tiendaChecada);
});

$('#tipoPedido').change(function () {
  var tienda = $('#tiendas').val();
  mostrarUna(tienda);
});

$('#tipoPedidoChecado').change(function () {
  var tiendaChecado = $('#tiendasChecado').val();
  mostrarUnaChecada(tiendaChecado);
});

$('#aPedidosChecados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
});

function mostrarPedidosChecados() {
  var tabla = $("#pedidosChecados").DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "ordering": false
  });
  var idPedidoPadre = getQueryVariable('id');
  var rutaPedidos = db.ref("pedidoPadre/" + idPedidoPadre);
  rutaPedidos.on('value', function (snapshot) {
    var pedidosHijos = snapshot.val().pedidosHijos;

    var filas = '';
    tabla.clear();

    for (var pedidoHijo in pedidosHijos) {
      if (pedidosHijos[pedidoHijo].encabezado.checado == true) {
        filas += "<tr>\n                    <td>" + pedidoHijo + "</td>\n                    <td>" + pedidosHijos[pedidoHijo].encabezado.tienda + "</td>\n                    <td>" + pedidosHijos[pedidoHijo].encabezado.cantidadProductos + "</td>\n                    <td>" + pedidosHijos[pedidoHijo].encabezado.totalKilos + "</td>\n                    <td>" + pedidosHijos[pedidoHijo].encabezado.totalPiezas + "</td>\n                  </tr>";
      }
    }

    //$('#pedidosChecados tbody').html(filas);
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function mostrarTodas() {
  $('#tableinfo').hide();
  var idPedidoPadre = getQueryVariable('id');
  var tiendasRef = db.ref('pedidoPadre/' + idPedidoPadre + '/productos');
  tiendasRef.on('value', function (snapshot) {
    var productos = snapshot.val();

    var filas = "";

    var TotalPz = void 0,
        TotalKg = void 0;
    var TotalPzs = 0,
        TotalKgs = 0,
        TotalPrecUni = 0,
        TotalImporte = 0;

    for (var producto in productos) {
      var importe = 0;
      if (productos[producto].unidad == "PZA") {
        importe = productos[producto].totalPz * productos[producto].precioUnitario;
      }
      if (productos[producto].unidad == "KG") {
        importe = productos[producto].totalKg * productos[producto].precioUnitario;
      }
      filas += "<tr>\n                  <td>" + productos[producto].clave + "</td>\n                  <td>" + productos[producto].nombre + "</td>\n                  <td class=\"text-right TotalPz\">" + productos[producto].totalPz + "</td>\n                  <td class=\"text-right TotalKg\">" + productos[producto].totalKg.toFixed(2) + "</td>\n                  <td class=\"text-right precioUnitario\">$ " + productos[producto].precioUnitario.toFixed(2) + "</td>\n                  <td class=\"text-right Importe\">$ " + importe.toFixed(2) + "</td>\n                </tr>";
      TotalPzs += productos[producto].totalPz;
      TotalKgs += productos[producto].totalKg;
      TotalPrecUni += productos[producto].precioUnitario;
      TotalImporte += importe;
    }
    filas += "<tr>\n                <td></td>\n                <td class=\"text-right\"><strong>Totales</strong></td>\n                <td class=\"text-right\"><strong>" + TotalPzs + "</strong></td>\n                <td class=\"text-right\"><strong>" + TotalKgs.toFixed(2) + "</strong></td>\n                <td class=\"text-right\"><strong>$ " + TotalPrecUni.toFixed(2) + "</strong></td>\n                <td class=\"text-right\"><strong>$ " + TotalImporte.toFixed(2) + "</strong></td>\n              </tr>";
    $('#theadTablaPedidos').html('<tr><th>Clave</th><th>Descripción</th><th>Total Pz</th><th>Total Kg</th><th>Precio unit.</th><th>Importe</th></tr>');
    $('#tbodyTablaPedidos').html(filas);
  });
}

function mostrarUna(idPedidoHijo) {
  var idPedidoPadre = getQueryVariable('id');
  var tipoPedido = $('#tipoPedido').val();
  var pieza = void 0;
  switch (tipoPedido) {
    case 'cambioFisico':
      pieza = "Cambio físico";
      break;
    case 'degusPz':
      pieza = "Degustación Pz";
      break;
    case 'pedidoPz':
      pieza = "Pedido Pz";
      break;
  }
  var pedidoHijoRef = db.ref('pedidoPadre/' + idPedidoPadre + '/pedidosHijos/' + idPedidoHijo);
  pedidoHijoRef.on('value', function (snapshot) {
    var pedidoHijo = snapshot.val();
    var detalles = pedidoHijo.detalle;
    var encabezado = pedidoHijo.encabezado;
    var tienda = encabezado.tienda;
    var row = "";
    var totalPiezas = 0,
        totalKilos = 0,
        totalImporte = 0;

    var cantidadPiezas = void 0;
    var cantidadKg = void 0;
    for (var pedido in detalles) {
      switch (tipoPedido) {
        case 'cambioFisico':
          cantidadPiezas = detalles[pedido].cambioFisicoPz;
          cantidadKg = detalles[pedido].cambioFisicoKg;
          break;
        case 'degusPz':
          cantidadPiezas = detalles[pedido].degusPz;
          cantidadKg = detalles[pedido].degusKg;
          break;
        case 'pedidoPz':
          cantidadPiezas = detalles[pedido].pedidoPz;
          cantidadKg = detalles[pedido].pedidoKg;
          break;
      }
      var importe = 0;
      if (detalles[pedido].unidad == "PZA") {
        importe = cantidadPiezas * detalles[pedido].precioUnitario;
      }
      if (detalles[pedido].unidad == "KG") {
        importe = cantidadKg * detalles[pedido].precioUnitario;
      }
      totalPiezas += cantidadPiezas;
      totalKilos += cantidadKg;
      totalImporte += Number(importe.toFixed(2));
      row += "<tr>\n                <td>" + detalles[pedido].claveConsorcio + "</td>\n                <td>" + detalles[pedido].clave + "</td>\n                <td>" + detalles[pedido].nombre + "</td>\n                <td>" + cantidadPiezas + "</td>\n                <td>" + cantidadKg.toFixed(2) + "</td>\n                <td>$ " + detalles[pedido].precioUnitario.toFixed(2) + "</td>\n                <td>$ " + importe.toFixed(2) + "</td>\n              </tr>";
    }

    var fechaImpresion = new moment().format("DD/MM/YYYY");
    row += "<tr>\n              <td></td>\n              <td></td>\n              <td><strong>Total general</strong></td>\n              <td><strong>" + totalPiezas + "</strong></td>\n              <td><strong>" + totalKilos.toFixed(2) + "</strong></td>\n              <td></td>\n              <td><strong>$ " + totalImporte.toFixed(2) + "</strong></td>\n            </tr>";
    $('#theadTablaPedidos').html("<tr><th>Clave Cliente</th><th>Clave Xico</th><th>Descripci\xF3n</th><th>" + pieza + "</th><th>Kg</th><th>Precio unit.</th><th>Importe</th></tr>");
    $('#tbodyTablaPedidos').html(row);

    $('#theadTableInfo').html("<tr><th>O. C.:</th><th>Fecha: " + fechaImpresion + "</th></tr>");
    $('#tbodyTableInfo').html("<tr>\n        <td>N\xFAm. de orden:</td>\n        <td><strong>" + encabezado.numOrden + "</strong></td>\n      </tr>\n      <tr>\n        <td>Consorcio:</td>\n        <td>" + encabezado.consorcio + "</td>\n      </tr>\n      <tr>\n        <td>SUC:</td>\n        <td>" + tienda + "</td>\n      </tr>");
    $('#tableinfo').show();

    $('.TotalPz').text(Tpz);
    $('.TotalKg').text(Tkg);
  });
}

function mostrarUnaChecada(idPedidoHijo) {
  var idPedidoPadre = getQueryVariable('id');
  var tipoPedido = $('#tipoPedidoChecado').val();

  var pedidoHijoRef = db.ref("pedidoPadre/" + idPedidoPadre + "/pedidosHijos/" + idPedidoHijo);
  pedidoHijoRef.on('value', function (snapshot) {
    var pedidoHijo = snapshot.val(),
        detalles = pedidoHijo.detalle,
        encabezado = pedidoHijo.encabezado,
        tienda = encabezado.tienda,
        filas = "",
        totalPiezas = 0,
        totalKilos = 0,
        totalPzEnt = 0,
        totalKgEnt = 0;

    var cantidadPiezas = void 0,
        cantidadKg = void 0,
        cantidadPzEnt = void 0,
        cantidadKgEnt = void 0;
    for (var producto in detalles) {
      var prod = detalles[producto];
      switch (tipoPedido) {
        case 'cambioFisico':
          cantidadPiezas = prod.cambioFisicoPz;
          cantidadKg = prod.cambioFisicoKg;
          cantidadPzEnt = prod.cambioFisicoPzEnt != undefined ? prod.cambioFisicoPzEnt : 0;
          cantidadKgEnt = prod.cambioFisicoKgEnt != undefined ? prod.cambioFisicoKgEnt : 0;
          break;
        case 'degusPz':
          cantidadPiezas = prod.degusPz;
          cantidadKg = prod.degusKg;
          cantidadPzEnt = prod.degusPzEnt != undefined ? prod.degusPzEnt : 0;
          cantidadKgEnt = prod.degusKgEnt != undefined ? prod.degusKgEnt : 0;
          break;
        case 'pedidoPz':
          cantidadPiezas = prod.pedidoPz;
          cantidadKg = prod.pedidoKg;
          cantidadPzEnt = prod.pedidoPzEnt != undefined ? prod.pedidoPzEnt : 0;
          cantidadKgEnt = prod.pedidoKgEnt != undefined ? prod.pedidoKgEnt : 0;
          break;
      }
      totalPiezas += cantidadPiezas;
      totalKilos += cantidadKg;
      totalPzEnt += cantidadPzEnt;
      totalKgEnt += cantidadKgEnt;

      filas += "<tr>\n                  <td>" + prod.clave + "</td>\n                  <td>" + prod.nombre + "</td>\n                  <td>" + cantidadPiezas + "</td>\n                  <td>" + cantidadKg.toFixed(2) + "</td>\n                  <td>" + cantidadPzEnt + "</td>\n                  <td>" + cantidadKgEnt.toFixed(2) + "</td>\n                </tr>";
    }

    filas += "<tr>\n              <td></td>\n              <td><strong>Total general</strong></td>\n              <td><strong>" + totalPiezas + "</strong></td>\n              <td><strong>" + totalKilos.toFixed(2) + "</strong></td>\n              <td><strong>" + totalPzEnt + "</strong></td>\n              <td><strong>" + totalKgEnt + "</strong></td> \n            </tr>";
    $('#tablaPedidosChecados tbody').html(filas);
  });
}

$(document).ready(function () {
  mostrarTodas();
  //$('#Imprimir').attr('disabled', true);
  mostrarDatos();

  $('.loader').hide();
  $('#panel').show();
  $('[data-toggle="tooltip"]').tooltip();
});

$('#tiendas').change(function () {
  var tienda = $(this).val();

  if (tienda == "Todas") {
    mostrarTodas();
    //$('#Imprimir').attr('disabled', true);
  } else {
    mostrarUna(tienda);
    $('#Imprimir').attr('disabled', false);
  }
});

function mostrarNotificaciones() {
  var usuario = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + usuario + '/lista');
  notificacionesRef.on('value', function (snapshot) {
    var lista = snapshot.val();
    var lis = "";

    var arrayNotificaciones = [];
    for (var notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for (var i in arrayNotificaciones) {
      var date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      var fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>' + '<a>' + '<div>' + '<i class="fa fa-comment fa-fw"></i> ' + arrayNotificaciones[i].mensaje + '<span class="pull-right text-muted small">' + fecha + '</span>' + '</div>' + '</a>' + '</li>';
    }

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
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

/*function generarPDF() {
  let pdf = new jsPDF('p', 'pt');

  let res = pdf.autoTableHtmlToJson(document.getElementById('tablaPedidos'));
  let res2 = pdf.autoTableHtmlToJson(document.getElementById('tableinfo'));
  let res3 = pdf.autoTableHtmlToJson(document.getElementById('table-bottom'));

  pdf.autoTable(res2.columns, res2.data, {
    startY: false,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak'
    },
    margin: {top: 150}
  });

  pdf.autoTable(res.columns, res.data, {
    startY: pdf.autoTableEndPosY() + 10,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak'
    },
    theme: 'grid',
    margin: {top: 150}
  });

  pdf.autoTable(res3.columns, res3.data, {
    startY: pdf.autoTableEndPosY() + 20,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak',
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    margin: {top: 150},
    theme: 'grid', // 'striped', 'grid',
    tableLineColor: [255, 255, 255]
  });

  //pdf.save('Pedido.pdf');
  //pdf.output('dataurlnewwindow');
  var string = pdf.output('datauristring');
  var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
  var x = window.open();
  x.document.open();
  x.document.write(iframe);
  x.document.close();
}*/

//De esta manera funciona en electron
function generarPDF() {
  var jsPDF = require('jspdf');
  require('jspdf-autotable');
  var pdf = new jsPDF('p', 'pt');
  console.log("HOla");

  var res = pdf.autoTableHtmlToJson(document.getElementById('tablaPedidos'));
  var res2 = pdf.autoTableHtmlToJson(document.getElementById('tableinfo'));
  var res3 = pdf.autoTableHtmlToJson(document.getElementById('table-bottom'));

  pdf.autoTable(res2.columns, res2.data, {
    startY: false,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak'
    },
    margin: { top: 150 }
  });

  pdf.autoTable(res.columns, res.data, {
    startY: pdf.autoTableEndPosY() + 10,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak'
    },
    theme: 'grid',
    margin: { top: 150 }
  });

  pdf.autoTable(res3.columns, res3.data, {
    startY: pdf.autoTableEndPosY() + 20,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak',
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0]
    },
    margin: { top: 150 },
    theme: 'grid', // 'striped', 'grid',
    tableLineColor: [255, 255, 255]
  });

  pdf.save('Pedido.pdf');
  pdf.output('dataurlnewwindow');
}