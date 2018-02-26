const db = firebase.database();
const auth = firebase.auth();
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
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function mostrarDatos() {
  let idPedidoPadre = getQueryVariable('id');

  let pedidoPadreRef = db.ref('pedidoPadre/'+idPedidoPadre);
  pedidoPadreRef.on('value', function(snapshot) {
    let datos = snapshot.val();
    $('#numPedido').html("Pedido: " + datos.clave);

    let diaCaptura = datos.fechaCreacionPadre.substr(0,2);
    let mesCaptura = datos.fechaCreacionPadre.substr(3,2);
    let añoCaptura = datos.fechaCreacionPadre.substr(6,4);
    let fechaCreacion = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
    moment.locale('es');
    let fechaCreacionMostrar = moment(fechaCreacion).format('LL');
    $('#fechaPedido').html("Recibido el " + fechaCreacionMostrar);
  });
}

function llenarSelectTiendas() {
  let idPedidoPadre = getQueryVariable('id');
  let tiendasRef = db.ref('pedidoPadre/'+idPedidoPadre+'/pedidosHijos');

  tiendasRef.on('value', function(snapshot) {
    let pedidosHijos = snapshot.val();
    let options = `<option value="Todas">Todas las tiendas</option>`;
    let optionsChecado = "";
    for(let pedidoHijo in pedidosHijos) {
      options += `<option value="${pedidoHijo}">${pedidosHijos[pedidoHijo].encabezado.tienda}</option>`;
      optionsChecado += `<option value="${pedidoHijo}">${pedidosHijos[pedidoHijo].encabezado.tienda}</option>`;
    }

    $('#tiendas').html(options);
    $('#tiendasChecado').html(optionsChecado);
  });
}

llenarSelectTiendas();

$('#tiendasChecado').change(function() {
  let tiendaChecada = $(this).val();
  mostrarUnaChecada(tiendaChecada);
});

$('#tipoPedido').change(function () {
  let tienda = $('#tiendas').val();
  mostrarUna(tienda);
});

$('#tipoPedidoChecado').change(function () {
  let tiendaChecado = $('#tiendasChecado').val();
  mostrarUnaChecada(tiendaChecado);
});

$('#aPedidosChecados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

function mostrarPedidosChecados() {
  let tabla = $(`#pedidosChecados`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "ordering": false
  });
  let idPedidoPadre = getQueryVariable('id');
  let rutaPedidos = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidos.on('value', function(snapshot) {
    let pedidosHijos = snapshot.val().pedidosHijos;

    let filas = '';
    tabla.clear();
  
    for(let pedidoHijo in pedidosHijos) {
      if(pedidosHijos[pedidoHijo].encabezado.checado == true) {
        filas += `<tr>
                    <td>${pedidoHijo}</td>
                    <td>${pedidosHijos[pedidoHijo].encabezado.tienda}</td>
                    <td>${pedidosHijos[pedidoHijo].encabezado.cantidadProductos}</td>
                    <td>${pedidosHijos[pedidoHijo].encabezado.totalKilos}</td>
                    <td>${pedidosHijos[pedidoHijo].encabezado.totalPiezas}</td>
                  </tr>`;
      }
    }

    //$('#pedidosChecados tbody').html(filas);
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function mostrarTodas() {
  $('#tableinfo').hide();
  let idPedidoPadre = getQueryVariable('id');
  let tiendasRef = db.ref('pedidoPadre/'+idPedidoPadre+'/productos');
  tiendasRef.on('value', function(snapshot) {
    let productos = snapshot.val();

    let filas = "";

    let TotalPz, TotalKg;
    let TotalPzs = 0, TotalKgs = 0, TotalPrecUni = 0, TotalImporte = 0;

    for(let producto in productos) {
      let importe = 0;
      if(productos[producto].unidad == "PZA") {
        importe = productos[producto].totalPz * productos[producto].precioUnitario;
      }
      if(productos[producto].unidad == "KG") {
        importe = productos[producto].totalKg * productos[producto].precioUnitario;
      }
      filas += `<tr>
                  <td>${productos[producto].clave}</td>
                  <td>${productos[producto].nombre}</td>
                  <td class="text-right TotalPz">${productos[producto].totalPz}</td>
                  <td class="text-right TotalKg">${productos[producto].totalKg.toFixed(2)}</td>
                  <td class="text-right precioUnitario">$ ${productos[producto].precioUnitario.toFixed(2)}</td>
                  <td class="text-right Importe">$ ${importe.toFixed(2)}</td>
                </tr>`;
      TotalPzs += productos[producto].totalPz;
      TotalKgs += productos[producto].totalKg;
      TotalPrecUni += productos[producto].precioUnitario;
      TotalImporte += importe;
    }
    filas += `<tr>
                <td></td>
                <td class="text-right"><strong>Totales</strong></td>
                <td class="text-right"><strong>${TotalPzs}</strong></td>
                <td class="text-right"><strong>${TotalKgs.toFixed(2)}</strong></td>
                <td class="text-right"><strong>$ ${TotalPrecUni.toFixed(2)}</strong></td>
                <td class="text-right"><strong>$ ${TotalImporte.toFixed(2)}</strong></td>
              </tr>`;
    $('#theadTablaPedidos').html('<tr><th>Clave</th><th>Descripción</th><th>Total Pz</th><th>Total Kg</th><th>Precio unit.</th><th>Importe</th></tr>');
    $('#tbodyTablaPedidos').html(filas);
  });
}

function mostrarUna(idPedidoHijo) {
  let idPedidoPadre = getQueryVariable('id');
  let tipoPedido = $('#tipoPedido').val();
  let pieza;
  switch(tipoPedido) {
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
  let pedidoHijoRef = db.ref('pedidoPadre/'+idPedidoPadre+'/pedidosHijos/'+idPedidoHijo);
  pedidoHijoRef.on('value', function(snapshot) {
    let pedidoHijo = snapshot.val();
    let detalles = pedidoHijo.detalle;
    let encabezado = pedidoHijo.encabezado;
    let tienda = encabezado.tienda;
    let row = "";
    let totalPiezas = 0, totalKilos = 0, totalImporte = 0;

    let cantidadPiezas;
    let cantidadKg;
    for(let pedido in detalles) {
      switch(tipoPedido) {
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
      let importe = 0;
      if(detalles[pedido].unidad == "PZA") {
        importe = cantidadPiezas * detalles[pedido].precioUnitario;
      }
      if(detalles[pedido].unidad == "KG") {
        importe = cantidadKg * detalles[pedido].precioUnitario;
      }
      totalPiezas += cantidadPiezas;
      totalKilos += cantidadKg;
      totalImporte += Number(importe.toFixed(2));
      row += `<tr>
                <td>${detalles[pedido].claveConsorcio}</td>
                <td>${detalles[pedido].clave}</td>
                <td>${detalles[pedido].nombre}</td>
                <td>${cantidadPiezas}</td>
                <td>${cantidadKg.toFixed(2)}</td>
                <td>$ ${detalles[pedido].precioUnitario.toFixed(2)}</td>
                <td>$ ${importe.toFixed(2)}</td>
              </tr>`;
    }

    let fechaImpresion = new moment().format("DD/MM/YYYY");
    row += `<tr>
              <td></td>
              <td></td>
              <td><strong>Total general</strong></td>
              <td><strong>${totalPiezas}</strong></td>
              <td><strong>${totalKilos.toFixed(2)}</strong></td>
              <td></td>
              <td><strong>$ ${totalImporte.toFixed(2)}</strong></td>
            </tr>`;
    $('#theadTablaPedidos').html(`<tr><th>Clave Cliente</th><th>Clave Xico</th><th>Descripción</th><th>${pieza}</th><th>Kg</th><th>Precio unit.</th><th>Importe</th></tr>`);
    $('#tbodyTablaPedidos').html(row);

    $('#theadTableInfo').html(`<tr><th>O. C.:</th><th>Fecha: ${fechaImpresion}</th></tr>`);
    $('#tbodyTableInfo').html(
      `<tr>
        <td>Núm. de orden:</td>
        <td><strong>${encabezado.numOrden}</strong></td>
      </tr>
      <tr>
        <td>Consorcio:</td>
        <td>${encabezado.consorcio}</td>
      </tr>
      <tr>
        <td>SUC:</td>
        <td>${tienda}</td>
      </tr>`);
    $('#tableinfo').show();

    $('.TotalPz').text(Tpz);
    $('.TotalKg').text(Tkg);
  });
}

function mostrarUnaChecada(idPedidoHijo) {
  let idPedidoPadre = getQueryVariable('id');
  let tipoPedido = $('#tipoPedidoChecado').val();
  
  let pedidoHijoRef = db.ref(`pedidoPadre/${idPedidoPadre}/pedidosHijos/${idPedidoHijo}`);
  pedidoHijoRef.on('value', function(snapshot) {
    let pedidoHijo = snapshot.val(),
        detalles = pedidoHijo.detalle,
        encabezado = pedidoHijo.encabezado,
        tienda = encabezado.tienda,
        filas = "",
        totalPiezas = 0, totalKilos = 0, totalPzEnt = 0, totalKgEnt = 0;

    let cantidadPiezas,
        cantidadKg,
        cantidadPzEnt,
        cantidadKgEnt;
    for(let producto in detalles) {
      let prod = detalles[producto];
      switch(tipoPedido) {
        case 'cambioFisico':
          cantidadPiezas = prod.cambioFisicoPz;
          cantidadKg = prod.cambioFisicoKg;
          cantidadPzEnt = (prod.cambioFisicoPzEnt != undefined) ? prod.cambioFisicoPzEnt : 0;
          cantidadKgEnt = (prod.cambioFisicoKgEnt != undefined) ? prod.cambioFisicoKgEnt : 0;
          break;
        case 'degusPz':
          cantidadPiezas = prod.degusPz;
          cantidadKg = prod.degusKg;
          cantidadPzEnt = (prod.degusPzEnt != undefined) ? prod.degusPzEnt : 0;
          cantidadKgEnt = (prod.degusKgEnt != undefined) ? prod.degusKgEnt : 0;
          break;
        case 'pedidoPz':
          cantidadPiezas = prod.pedidoPz;
          cantidadKg = prod.pedidoKg;
          cantidadPzEnt = (prod.pedidoPzEnt != undefined) ? prod.pedidoPzEnt : 0;
          cantidadKgEnt = (prod.pedidoKgEnt != undefined) ? prod.pedidoKgEnt : 0;
          break;
      }
      totalPiezas += cantidadPiezas;
      totalKilos += cantidadKg;
      totalPzEnt += cantidadPzEnt;
      totalKgEnt += cantidadKgEnt;

      filas += `<tr>
                  <td>${prod.clave}</td>
                  <td>${prod.nombre}</td>
                  <td>${cantidadPiezas}</td>
                  <td>${cantidadKg.toFixed(2)}</td>
                  <td>${cantidadPzEnt}</td>
                  <td>${cantidadKgEnt.toFixed(2)}</td>
                </tr>`;
    }

    filas += `<tr>
              <td></td>
              <td><strong>Total general</strong></td>
              <td><strong>${totalPiezas}</strong></td>
              <td><strong>${totalKilos.toFixed(2)}</strong></td>
              <td><strong>${totalPzEnt}</strong></td>
              <td><strong>${totalKgEnt}</strong></td> 
            </tr>`;
    $('#tablaPedidosChecados tbody').html(filas);
  });
}

$(document).ready(function() {
  mostrarTodas();
  //$('#Imprimir').attr('disabled', true);
  mostrarDatos();

  $('.loader').hide();
  $('#panel').show();
  $('[data-toggle="tooltip"]').tooltip();
});

$('#tiendas').change(function() {
  let tienda = $(this).val();

  if(tienda == "Todas") {
    mostrarTodas();
    //$('#Imprimir').attr('disabled', true);
  }
  else {
    mostrarUna(tienda);
    $('#Imprimir').attr('disabled', false);
  }
});

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
  let pdf = new jsPDF('p', 'pt');
  console.log("HOla")

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

  pdf.save('Pedido.pdf');
  pdf.output('dataurlnewwindow');
}