var db = firebase.database();

function llenarSelect() {
  let subProductosRef = db.ref('subProductos');
  subProductosRef.on('value', function(snapshot) {
    let subProductos = snapshot.val();
    console.log(subProductos)

    let options = "";

    for(subProducto in subProductos) {
      options += `<option value="${subProducto}">${subProducto} ${subProductos[subProducto].nombre}</option>`;
    }

    $('#subProductos').html(options).multiselect();
  })
}

$(document).ready(function() {
  llenarSelect();
})

function guardarFormulacion() {
  let idProducto = $('#idProducto');
  let nombre = $('#nombre');
  let categoria = $('#categoria');
  let subProductos = $('#subProductos');

  let formulacionesRef = db.ref(`formulaciones/${idProducto}`);
  let datos = {
    nombre: nombre,
    categoria: categoria,
    subProductos: subProductos
  }

  formulacionesRef.set(datos);
}
