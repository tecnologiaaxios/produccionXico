var db = firebase.database();

function llenarSelectTiendas() {
  let tiendasRef = db.ref('tiendas');
  tiendasRef.on('value', function(snapshot) {
    let tiendas = snapshot.val();

    let row = "";
    for(let tienda in tiendas) {
      row += '<option value="'+tienda+'">'+tiendas[tienda].nombre+'</option>';
    }
    $('#tienda').empty().append('<option value="" disabled selected>Tienda</option>');
    $('#tienda').append(row);
  });
}


function llenarSelectProductos() {
  let idTienda = $('#tienda').val();
  let productosRef = db.ref('tiendas/'+idTienda+'/productos');
  productosRef.on('value', function(snapshot) {
    let productos = snapshot.val();
    //console.log(productos);
    let row = "";
    for(let producto in productos) {
      row += '<option value="'+producto+'">'+productos[producto].clave + ' ' + productos[producto].nombre +' ' + productos[producto].empaque +'</option>';
    }
    $('#productos').empty().append('<option value="" disabled selected>Productos</option>');
    $('#productos').append(row);
    //$('#productos').multiselect();
  });
}
//llenarSelectProductos();

$('#tienda').change(function(){
  llenarSelectProductos();
});

$('#productos').change(function(){
  let idTienda = $('#tienda').val();
  let idProducto = $('#productos').val();
  let prodcutoActualRef = db.ref('tiendas/'+idTienda+'/productos/'+idProducto);
  prodcutoActualRef.once('value', function(snapshot){
  let producto = snapshot.val();
  $('#empaque').val(producto.empaque);  
});    


  
});

$('#pedidoPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
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



