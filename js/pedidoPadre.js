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

function getQueryVariable(variable)
{
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
    $('#numPedido').html("Pedido: " + idPedidoPadre);

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
    let row = "";
    for(pedidoHijo in pedidosHijos) {
      /*let option = $('<option/>', {
        'value': pedidoHijo,
        'data-content': '<img src="'+imagen+'">',
        text: pedidosHijos[pedidoHijo].encabezado.tienda
      });*/
      row += '<option value="'+pedidoHijo+'">'+pedidosHijos[pedidoHijo].encabezado.tienda+'</option>';
    }

    $('#tiendas').empty().append('<option value="Todas">Todas las tiendas</option>').append(row);
  });
}

llenarSelectTiendas();

function mostrarTodas() {
  let idPedidoPadre = getQueryVariable('id');
  let tiendasRef = db.ref('pedidoPadre/'+idPedidoPadre+'/productos');
  tiendasRef.on('value', function(snapshot) {
    let productos = snapshot.val();
    let row = "";
    let TotalPz, TotalKg;
    let TotalPzs = 0, TotalKgs = 0, TotalPrecUni = 0, TotalImporte = 0;
    for(producto in productos) {
      let importe = 0;
      if(productos[producto].unidad == "PZA") {
        importe = productos[producto].totalPz * productos[producto].precioUnitario;
      }
      if(productos[producto].unidad == "KG") {
        importe = productos[producto].totalKg * productos[producto].precioUnitario;
      }
      row += '<tr>' +
              '<td>' + productos[producto].clave + '</td>' +
              '<td>' + productos[producto].nombre + '</td>' +
              //'<td></td>' +
              //'<td></td>' +
              '<td class="TotalPz">'+ productos[producto].totalPz +'</td>' +
              '<td class="TotalKg">'+ productos[producto].totalKg +'</td>' +
              '<td class"precioUnitario>$ '+ productos[producto].precioUnitario +'</td>' +
              '<td class="Importe">$ '+ importe +'</td>'+
             '</tr>';
      TotalPzs += productos[producto].totalPz;
      TotalKgs += productos[producto].totalKg;
      TotalPrecUni += productos[producto].precioUnitario;
      TotalImporte += importe;
    }
    row += '<tr><td></td><td>Totales</td><td>'+TotalPzs+'</td><td>'+TotalKgs+'</td><td>'+TotalPrecUni+'</td><td>'+TotalImporte+'</td></tr>';
    $('#theadTablaPedidos').html('<tr><th>Clave</th><th>Descripción</th><th>Total Pz</th><th>Total Kg</th><th>Precio unit.</th><th>Importe</th></tr>');
    $('#tbodyTablaPedidos').html(row);
  });
}

function mostrarUna(idPedidoHijo) {
  let idPedidoPadre = getQueryVariable('id');
  let pedidoHijoRef = db.ref('pedidoPadre/'+idPedidoPadre+'/pedidosHijos/'+idPedidoHijo);
  pedidoHijoRef.on('value', function(snapshot) {
    let pedidoHijo = snapshot.val();
    let detalles = pedidoHijo.detalle;
    let row = "";

    for(let pedido in detalles) {
      let importe = 0;
      if(detalles[pedido].unidad == "PZA") {
        importe = detalles[pedido].totalPz * detalles[pedido].precioUnitario;
      }
      if(detalles[pedido].unidad == "KG") {
        importe = detalles[pedido].totalKg * detalles[pedido].precioUnitario;
      }
      row += '<tr>' +
              '<td>' + detalles[pedido].clave + '</td>' +
              '<td>' + detalles[pedido].nombre + '</td>' +
              '<td>' + detalles[pedido].totalPz + '</td>' +
              '<td>' + detalles[pedido].totalKg + '</td>' +
              '<td>' + detalles[pedido].precioUnitario + '</td>' +
              '<td>' + importe + '</td>' +
              //'<td class="TotalPz"></td>' +
              //'<td class="TotalKg"></td>' +
             '</tr>';
    }
    $('#theadTablaPedidos').html('<tr><th>Clave</th><th>Descripción</th><th>Pieza</th><th>Kg</th><th>Precio unit.</th><th>Importe</th></tr>');
    $('#tbodyTablaPedidos').html(row);
    $('.TotalPz').text(Tpz);
    $('.TotalKg').text(Tkg);
  });
}

$(document).ready(function() {
  mostrarTodas();
  mostrarDatos();
});

$('#tiendas').change(function() {
  let tienda = $(this).val();

  if(tienda == "Todas") {
    mostrarTodas();
  }
  else {
    mostrarUna(tienda);
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

$('#Imprimir').click(function() {


  generarPDF();
});

function generarPDF(/*nombre*/) {
  let pdf = new jsPDF('p', 'pt');

  let res = pdf.autoTableHtmlToJson(document.getElementById('tablaPedidos'));
  pdf.autoTable(res.columns, res.data, {
    startY: false,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak'
    },
    margin: {top: 150}
  });

  pdf.save('Pedido.pdf');
  /*pdf.save('Pedido-'+nombre+'.pdf');*/
}
