var db = firebase.database();

function guardarProducto() {
  let claveInterna = $('#claveInterna').val();
  let nombreProducto = $('#nombreProducto').val();
  let capEmpaque = Number($('#capEmpaque').val());
  //let region = $('#region').val();

  let productos = db.ref('productos');
  let producto = {
    claveInterna: claveInterna,
    nombreProducto: nombreProducto,
    capEmpaque: capEmpaque
  };
  productos.push(producto);

  $('#claveInterna').val('').focus();
  $('#nombreProducto').val('');
  $('#capEmpaque').val('');
  //$('#region').val('');
}