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

  $('#tienda').val('').focus();
  $('#claveProducto').val('');
  $('#nombreProducto').val('');
  $('#empaque').val('');
}
