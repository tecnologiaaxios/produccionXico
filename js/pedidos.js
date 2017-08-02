var db = firebase.database();
var listaProductosPedido = [];

function llenarSelectTiendas() {
  let tiendasRef = db.ref('tiendas');
  tiendasRef.on('value', function(snapshot) {
    let tiendas = snapshot.val();

    let row = "";
    for(let tienda in tiendas) {
      row += '<option value="'+tienda+'">'+tiendas[tienda].nombre+'</option>';
    }
    $('#tiendas').empty().append('<option value="Tiendas" disabled selected>Tienda</option>');
    $('#tiendas').append(row);
  });
}


function llenarSelectProductos() {
  let idTienda = $('#tiendas').val();
  let productosRef = db.ref('tiendas/'+idTienda+'/productos');
  productosRef.on('value', function(snapshot) {
    let productos = snapshot.val();
    //console.log(productos);
    let row = "";
    for(let producto in productos) {
      row += '<option value="'+producto+'">'+productos[producto].clave + ' ' + productos[producto].nombre +' ' + productos[producto].empaque +'</option>';
    }
    $('#productos').empty().append('<option value="Productos" disabled selected>Productos</option>');
    $('#productos').append(row);
    //$('#productos').multiselect();
  });
}
//llenarSelectProductos();

$('#tiendas').change(function(){
  llenarSelectProductos();
  let idTienda = $('#tiendas').val();
  let tiendaActualRef = db.ref('tiendas/'+idTienda);
  tiendaActualRef.once('value', function(snapshot) {
    let tienda = snapshot.val();
    $('#tienda').val(tienda.nombre);
    $('#region').val(tienda.region);
  });
});

$('#productos').change(function(){
  let idTienda = $('#tiendas').val();
  let idProducto = $('#productos').val();
  let productoActualRef = db.ref('tiendas/'+idTienda+'/productos/'+idProducto);
  productoActualRef.once('value', function(snapshot){
    let producto = snapshot.val();
    $('#clave').val(producto.clave);
    $('#nombre').val(producto.nombre);
    $('#empaque').val(producto.empaque);
  });
});

$('#pedidoPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$('#degusPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$(document).ready(function() {
  llenarSelectTiendas();
  //llenarSelectProductos();
})

function agregarProducto() {
  let clave = $('#clave').val();
  let nombre = $('#nombre').val();
  let pedidoPz = $('#pedidoPz').val();
  let degusPz = $('#degusPz').val();
  let totalPz = $('#totalPz').val();
  let totalKg = $('#totalKg').val();

  let row = '<tr>' +
              '<td>'+clave+'</td>'+
              '<td>'+nombre+'</td>'+
              '<td>'+pedidoPz+'</td>'+
              '<td>'+degusPz+'</td>'+
              '<td>'+totalPz+'</td>'+
              '<td>'+totalKg+'</td>'+
            '</tr>';

  $('#productosPedido tbody').append(row);

  let datosProducto = {
    clave: clave,
    nombre: nombre,
    pedidoPz: Number(pedidoPz),
    degusPz: Number(degusPz),
    totalPz: Number(totalPz),
    totalKg: Number(totalKg)
  };
  listaProductosPedido.push(datosProducto);

  $('#productos').focus();
  $('#pedidoPz').val('');
  $('#degusPz').val('');
  $('#totalPz').val('');
  $('#totalKg').val('');
}

function guardarPedido() {
  let pedidoRef = db.ref('pedidoEntrada/');
  let tienda = $('#tienda').val();
  let ruta = $('#region').val();
  let fechaCaptura = moment().format('DD/MM/YYYY');

  let encabezado = {
    encabezado: {
      fechaCaptura: fechaCaptura,
      tienda: tienda,
      ruta: ruta,
      fechaRuta: "",
      estado: "Pendiente"
    }
  }

  let key = pedidoRef.push(encabezado).getKey();

  let pedidoDetalleRef = db.ref('pedidoEntrada/'+key+'/detalle');

  for(let producto in listaProductosPedido) {
    pedidoDetalleRef.push(listaProductosPedido[producto]);
  }

  //$('#tiendas option').first().attr('selected', true);
  //$('#productos option').first().attr('selected', true);
  $("#tiendas").val('Tiendas')
  $("#productos").val('Productos')
  $('#productosPedido tbody').empty();
  listaProductosPedido.length = 0;
}
