const db = firebase.database();
const auth = firebase.auth();
var Tpz, Tkg;

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

function llenarSelectTiendas() {
  let idPedidoPadre = getQueryVariable('id');
  let tiendasRef = db.ref('pedidoPadre/'+idPedidoPadre+'/pedidosHijos');

  tiendasRef.on('value', function(snapshot) {
    let pedidosHijos = snapshot.val();
    let row = "";
    for(pedidoHijo in pedidosHijos) {
      row += '<option value='+pedidoHijo+'>'+pedidosHijos[pedidoHijo].encabezado.tienda+'</option>';
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

    for(producto in productos) {

      row += '<tr>' +
              '<td>' + productos[producto].clave + '</td>' +
              '<td>' + productos[producto].nombre + '</td>' +
              //'<td></td>' +
              //'<td></td>' +
              '<td class="TotalPz">'+productos[producto].totalPz+'</td>' +
              '<td class="TotalKg">'+productos[producto].totalKg+'</td>' +
             '</tr>';
    }
    $('#theadTablaPedidos').empty().append('<tr><th>Clave</th><th>Descripción</th><th>Total Pz</th><th>Total Kg</th></tr>');
    $('#tbodyTablaPedidos').empty().append(row);
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
      row += '<tr>' +
              '<td>' + detalles[pedido].clave + '</td>' +
              '<td>' + detalles[pedido].nombre + '</td>' +
              '<td>' + detalles[pedido].totalPz + '</td>' +
              '<td>' + detalles[pedido].totalKg + '</td>' +
              //'<td class="TotalPz"></td>' +
              //'<td class="TotalKg"></td>' +
             '</tr>';
    }
    $('#theadTablaPedidos').empty().append('<tr><th>Clave</th><th>Descripción</th><th>Pieza</th><th>Kg</th></tr>');
    $('#tbodyTablaPedidos').empty().append(row);
    $('.TotalPz').text(Tpz);
    $('.TotalKg').text(Tkg);
  });
}

$(document).ready(function() {
  mostrarTodas();
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

function mostrarDatos() {

}

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
})
