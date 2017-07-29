const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarPedidos();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarPedidos() {
  let pedidosEntradaRef = db.ref('pedidoEntrada/');
  pedidosEntradaRef.on('value', function(snapshot) {
    let pedidos = snapshot.val();
    let row="";

    for(let pedido in pedidos) {
      let estado = "";
      switch(pedidos[pedido].encabezado.estado) {
        case "Pendiente":
          estado = '<td class="no-padding">  <i style="color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
        case "En proceso":
          estado = '<td class="no-padding">  <i style="color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
        case "Lista":
          estado = '<td class="no-padding">  <i style="color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
      }

      row += '<tr style="padding:0px 0px 0px;" class="no-pading">' +
               '<td>' + pedido +'</td>' +
               '<td>' + pedidos[pedido].encabezado.fechaCaptura + '</td>' +
               '<td>' + pedidos[pedido].encabezado.tienda +'</td>' +
               '<td>' + pedidos[pedido].encabezado.ruta +'</td>' +
               '<td class="no-padding"><button type="button" class="btn btn-info btn-sm"><span style="padding-bottom:0px;" class="glyphicon glyphicon-print"></span></button></td>' +
               estado +
             '</tr>';
    }

    $('#tablaPedidos tbody').empty().append(row);
  });
}

dragula([document.getElementById('tbodyTablaPedidos'), document.getElementById('tbodyTablaPedidoPadre')]);

function generarPedidoPadre() {
  var pedidos = [], claves = [];

  $("#tablaPedidoPadre tbody tr").each(function (i)
  {
    var clave;
    $(this).children("td").each(function (j)
    {
      if(j == 0) {
        clave = $(this).text();
        claves.push(clave);
      }
    });

    if($(this).attr('id') !="vacio"){
      let pedidoRef = db.ref('pedidoEntrada/'+clave);
      pedidoRef.once('value', function(snapshot) {
        let pedido = snapshot.val();
        pedidos.push(pedido);
      });
    }
  });

  let fechaCreacionPadre = moment().format('DD/MM/YYYY');
  let pedidoPadreRef = db.ref('pedidoPadre/');
  let datosPedidoPadre = {
    fechaCreacionPadre: fechaCreacionPadre,
    fechaRuta: "",
    ruta: ""
  }
  let key = pedidoPadreRef.push(datosPedidoPadre).getKey();

  let pedidoPadreRefKey = db.ref('pedidoPadre/'+key+'/pedidosHijos');
  let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
  let pedidoEntradaRef = db.ref('pedidoEntrada');

  let datosPedidosHijos = {};
  for(let pedido in pedidos) {
    //pedidoPadreRefKey.push(pedidos[pedido]);
    datosPedidosHijos[claves[pedido]] = pedidos[pedido];
    pedidoEntradaRef.child(claves[pedido]).remove();
  }

  pedidoPadreRefKey.set(datosPedidosHijos);
  historialPedidosEntradaRef.push(datosPedidosHijos);

  let row = '<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">' +
              '<td scope="row" style="border:none;"></td>' +
              '<td></td>' +
              '<td></td>' +
              '<td></td>' +
              '<td class="no-padding"></td>' +
              '<td class="no-padding"> </td>' +
            '</tr>';
  $('#tbodyTablaPedidoPadre').empty().append(row);
}
