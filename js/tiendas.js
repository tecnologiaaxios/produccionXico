var db = firebase.database();

function llenarSelectTiendas() {
  let tiendasRef = db.ref('tiendas');
  tiendasRef.on('value', function(snapshot) {
    let tiendas = snapshot.val();

    let row = "";
    for(let tienda in tiendas) {
      row += '<option value="'+tienda+'">'+tiendas[tienda].nombre+'</option>'
    }
    $('#tienda').empty().append('<option value="" disabled selected>Tienda</option>');
    $('#tienda').append(row);
  });
}

$(document).ready(function() {
  llenarSelectTiendas();
})

function guardarTienda() {
  let clave = $('#clave').val();
  let consorcio = $('#consorcio').val();
  let nombre = $('#nombre').val();
  let region = $('#region').val();

  let tiendas = db.ref('tiendas');
  let tienda = {
    clave: clave,
    consorcio: consorcio,
    nombre: nombre,
    region: region
  };
  tiendas.push(tienda);

  $('#clave').val('').focus();
  $('#consorcio').val('');
  $('#nombre').val('');
  $('#region').val('');
}

function limpiarTabla() {
  $('#listaProductos tbody').empty();
}

$('#tienda').change(function() {
  let idTienda = $('#tienda').val();
  let productos = db.ref('tiendas/'+idTienda+'/productos');
  console.log(idTienda);
  productos.on('value', function(snapshot) {
    let products = snapshot.val();
    let row = "";
    for(let product in products) {
      row += '<tr>' +
              '<td>'+products[product].clave+'</td>'+
              '<td>'+products[product].nombre+'</td>'+
              '<td>'+products[product].empaque+'</td>'+
             '</tr>';
    }

    $('#listaProductos tbody').empty().append(row);

  });
});

function contarProductos() {
  let idTienda = $('#tienda').val();

  let tiendas = db.ref('tiendas/'+idTienda+'/productos');
  tiendas.on('value', function(snapshot) {
    $('#cantidadProductos').val(Object.keys(snapshot.val()).length);
  });
}

function agregarProducto() {
  let idTienda = $('#tienda').val();
  let clave = $('#claveProducto').val();
  let nombre = $('#nombreProducto').val();
  let empaque = Number($('#empaque').val());

  let productos = db.ref('tiendas/'+idTienda+'/productos');
  let producto = {
    clave: clave,
    nombre: nombre,
    empaque: empaque
  };
  productos.push(producto);

  //console.log($('#tienda option').last());
  $('#tienda option').last().attr('selected', true);
  $('#claveProducto').val('').focus();
  $('#nombreProducto').val('');
  $('#empaque').val('');
}
