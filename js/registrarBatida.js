const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function obtenerClaveBatida(){
  let rutaBatidas = db.ref('batidas');
  rutaBatidas.once('value', function(snapshot){
    if (snapshot.hasChildren()) {

      let listabatidas = snapshot.val();

      let keys = Object.keys(listabatidas);
      let last = keys[keys.length-1];
      let ultimaBatida = listabatidas[last];
      let lastClave = Number(ultimaBatida.claveBatida);
      $('#clave').val(lastClave+1);
    }
    else{
      $('#clave').val(1);
    }

  })
}

$('#producto').keyup(function () {
  $(this).val($(this).val().toUpperCase());
});

$('#producto').keypress(function(e){
  if (e.which == 13) {
    let claveProducto = $(this).val();
    let rutaFormulaciones = db.ref(`formulaciones/${claveProducto}`);
    rutaFormulaciones.once('value', function(snapshot){
      if (snapshot.hasChildren()) {
        $('#nombreProducto').val(snapshot.val().nombre);
        $('#numBatidas').attr('readonly', false);
        $('#btnGenerarFormula').attr('disabled', false);
      }else{
        $.toaster({priority: 'danger', title: 'Error', message: `El producto con la clave ${claveProducto} no existe`});
        $('#nombreProducto').val("");
      }
    })
  }
})

function obtenerFormulaBase() {
  let tabla = $(`#tabla-subProductos`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "300px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "paging": false,
    "bInfo" : false
  });

  let claveProducto = $('#producto').val();
  let numBatidas = $('#numBatidas').val();
  let rutaFormulaciones = db.ref(`formulaciones/${claveProducto}/subProductos`);
  rutaFormulaciones.once('value', function(snapshot){
    if (snapshot.hasChildren()) {
      let subProductos = snapshot.val();
      tabla.clear();
      let filas = "";
      let i = 0;
      for (let subProducto in subProductos) {
        if(i%2 == 0) {
          filas += `<tr class="info">
                      <td>${subProducto}</td>
                      <td>${subProductos[subProducto].nombre}</td>
                      <td>${subProductos[subProducto].valorConstante}</td>
                      <td><input value="${(subProductos[subProducto].valorConstante*numBatidas).toFixed(4)}" class="form-control"></td>
                    </tr>`;
        }
        else {
          filas += `<tr>
                      <td>${subProducto}</td>
                      <td>${subProductos[subProducto].nombre}</td>
                      <td>${subProductos[subProducto].valorConstante}</td>
                      <td><input value="${(subProductos[subProducto].valorConstante*numBatidas).toFixed(4)}" class="form-control"></td>
                    </tr>`;
        }
        i++;
      }
      //$('#tabla-subProductos tbody').html(filas);
      tabla.rows.add($(filas)).columns.adjust().draw();
    }else{
      $.toaster({priority: 'danger', title: 'Error', message: `El producto con la clave ${claveProducto} no existe`});
    }
  })
}

function guardarBatida(){
  let numBatidas = $('#numBatidas').val();
  let clave = $('#clave').val();
  let fechaCaptura = moment().format('DD/MM/YYYY');
  let claveProducto = $('#producto').val();
  let nombreProducto = $('#nombreProducto').val();

  let listaSubProductos = [], listaClaves = [];
  let claveSubProducto, nombreSubProducto, valorConstante;

  $("#tabla-subProductos tbody tr").each(function (i)
  {
    $(this).children("td").each(function (j)
    {
      switch (j) {
        case 0:
          claveSubProducto = $(this).text();
          break;
        case 1:
          nombreSubProducto = $(this).text();
          break;
        case 3:
          valorConstante = $(this).children().val();
          break;
      }
    });

    let datos = {
      nombre: nombreSubProducto,
      valorConstante: valorConstante
    };

    listaSubProductos.push(datos);
    listaClaves.push(claveSubProducto);
  });

  let rutaBatidas = db.ref('batidas');

  let batida = {
    batidas: numBatidas,
    claveBatida: clave,
    fechaCaptura: fechaCaptura,
    claveProducto: claveProducto,
    nombreProducto: nombreProducto
  };

  let keyBatida = rutaBatidas.push(batida).getKey();

  console.log(listaClaves);
  console.log(listaSubProductos);
  for (let i in listaSubProductos) {
    let rutaBatida = db.ref(`batidas/${keyBatida}/subProductos/${listaClaves[i]}`);
    rutaBatida.set(listaSubProductos[i]);
  }
}


function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();


    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

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

    arrayNotificaciones.reverse();

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
  obtenerClaveBatida();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
