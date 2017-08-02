var db = firebase.database();
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
  let tiendasRef = db.ref('pedidoPadre/'+idPedidoPadre+'/pedidosHijos');
  tiendasRef.on('value', function(snapshot) {
    let pedidosHijos = snapshot.val();
    let row = "";
    let TotalPz = 0, TotalKg = 0;

    for(pedidoHijo in pedidosHijos) {
      let length = Object.keys(pedidosHijos[pedidoHijo].detalle).length;
      let detalle = pedidosHijos[pedidoHijo].detalle;

      for(let d in detalle) {
        row += '<tr>' +
                '<td>' + detalle[d].clave + '</td>' +
                '<td>' + detalle[d].nombre + '</td>' +
                '<td>' + detalle[d].totalPz + '</td>' +
                '<td>' + detalle[d].totalKg + '</td>' +
                '<td class="TotalPz"></td>' +
                '<td class="TotalKg"></td>' +
               '</tr>';

        TotalPz += detalle[d].totalPz;
        TotalKg += detalle[d].totalKg;

      }
    }
    Tpz = TotalPz;
    Tkg = TotalKg;
    $('#tbodyTablaPedidos').empty().append('<tr><td>Clave</td><td>Descripción</td><td>Pieza</td><td>Kg</td><td>Total Pz</td><td>Total Kg</td></tr>').append(row);
    $('.TotalPz').text(TotalPz);
    $('.TotalKg').text(TotalKg);
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
              '<td class="TotalPz"></td>' +
              '<td class="TotalKg"></td>' +
             '</tr>';
    }
    $('#tbodyTablaPedidos').empty().append('<tr><td>Clave</td><td>Descripción</td><td>Pieza</td><td>Kg</td><td>Total Pz</td><td>Total Kg</td></tr>').append(row);
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
