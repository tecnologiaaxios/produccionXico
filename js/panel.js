const db = firebase.database();
const auth = firebase.auth();


function logout() {
  auth.signOut();
}

function obtenerClaveBatida(){
  let rutaBatidas = db.ref('batidas');
  rutaBatidas.on('value', function(snapshot){
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
  });
}

$('#producto').keyup(function() {
  $(this).val($(this).val().toUpperCase());
});

/*$('#cbAgregarSustitutos').change(function() {
  if($(this).prop('checked')) {
    $('#collapseSustitutos').collapse('show')
    mostrarSustitutos();
  }else {
    $('#collapseSustitutos').collapse('hide')
  }
});*/

$('#cbAgregarSustitutos').on('switchChange.bootstrapSwitch', function(event, state) {
  if(state) {
    $('#collapseSustitutos').collapse('show');

  }else {
    $('#collapseSustitutos').collapse('hide');
  }
});

$('#producto').keypress(function(e) {
  let claveProducto = $(this).val();

  if (e.which == 13) {
    if(claveProducto.length > 0) {
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
      });
      $(this).parent().removeClass('has-error');
      $('#helpBlockProducto').addClass('hidden');
    }
    else {
      $(this).parent().addClass('has-error');
      $('#helpBlockProducto').removeClass('hidden');
    }
  }
});

$('#btnGenerarFormula').click(function() {
  obtenerFormulaBase();
  mostrarSustitutos();
});

function obtenerFormulaBase() {
  let tabla = $(`#tabla-subProductos`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
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
          filas += `<tr  id="fila-${subProducto}" class="info">
                      <td>${subProducto}</td>
                      <td>${subProductos[subProducto].nombre}</td>
                      <td>${subProductos[subProducto].valorConstante}</td>
                      <td>${(subProductos[subProducto].valorConstante*numBatidas).toFixed(4)}</td>
                    </tr>`;
                      //<td class="text-center"><button onclick="quitarSubProducto('fila-${subProducto}')" type="button" class="btn btn-danger btn-sm"><i class="fa fa-times"></i></button></td>

        }
        else {
          filas += `<tr id="fila-${subProducto}" >
                      <td>${subProducto}</td>
                      <td>${subProductos[subProducto].nombre}</td>
                      <td>${subProductos[subProducto].valorConstante}</td>
                      <td>${(subProductos[subProducto].valorConstante*numBatidas).toFixed(4)}</td>
                    </tr>`;
                      //<td class="text-center"><button onclick="quitarSubProducto('fila-${subProducto}')" type="button" class="btn btn-danger btn-sm"><i class="fa fa-times"></i></button></td>
        }
        i++;
      }
      //$('#tabla-subProductos tbody').html(filas);
      tabla.rows.add($(filas)).columns.adjust().draw();
    }else{
      $.toaster({priority: 'danger', title: 'Error', message: `El producto con la clave ${claveProducto} no existe`});
    }
  });

  $('#btnGuardarBatida').attr('disabled', false);
  //$('#cbAgregarSustitutos').bootstrapToggle('enable')
  $('input[name="cbAgregarSustitutos"]').bootstrapSwitch('toggleReadonly', true, false);
}

function mostrarSustitutos() {
  // let tabla = $(`#tabla-sustitutos`).DataTable({
  //   destroy: true,
  //   "lengthChange": false,
  //   "scrollY": "200px",
  //   "scrollCollapse": true,
  //   "language": {
  //     "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
  //   },
  //   "searching": false,
  //   "paging": false,
  //   "bInfo" : false
  // });

  let claveProducto = $('#producto').val();
  let numBatidas = $('#numBatidas').val();
  let rutaFormulaciones = db.ref(`formulaciones/${claveProducto}/subProductos`);
  rutaFormulaciones.on('value', function(snapshot) {
    let subProductos = snapshot.val();
    //tabla.clear();
    let filas = "";
    let i = 0;

    for(let subProducto in subProductos) {
      if(subProductos[subProducto].sustitutos != undefined) {
        let sustitutos = subProductos[subProducto].sustitutos;

        for(let sustituto in sustitutos) {
          if(i%2 == 0) {
            filas += `<tr id="fila-${subProducto}" class="info" data-claveSubProducto="${subProducto}">
                        <td>${sustituto}</td>
                        <td>${sustitutos[sustituto].nombre}</td>
                        <td>${sustitutos[sustituto].valorConstante}</td>
                        <td>${(sustitutos[sustituto].valorConstante*numBatidas).toFixed(4)}</td>
                        <td class="text-center"><input id="cb-${sustituto}" class="toggle-checkbox" type="checkbox" data-size="mini" data-on-color="success" data-off-color="danger" data-on-text="Sí" data-off-text="No"/></td>
                      </tr>`;
          }
          else {
            filas += `<tr id="fila-${subProducto}" data-claveSubProducto="${subProducto}">
                        <td>${sustituto}</td>
                        <td>${sustitutos[sustituto].nombre}</td>
                        <td>${sustitutos[sustituto].valorConstante}</td>
                        <td>${(sustitutos[sustituto].valorConstante*numBatidas).toFixed(4)}</td>
                        <td class="text-center"><input id="cb-${sustituto}" class="toggle-checkbox" type="checkbox" data-size="mini" data-on-color="success" data-off-color="danger" data-on-text="Sí" data-off-text="No"/></td>
                      </tr>`;
          }
          i++;
        }
      }
      else {
        console.log('No tiene sustituto');
      }
    }
    $('#tabla-sustitutos tbody').html(filas)
    //tabla.rows.add($(filas)).columns.adjust().draw();
    $('.toggle-checkbox').bootstrapSwitch();
  });
}

function quitarSubProducto(idFila){
  $(`#${idFila}`).remove();
}

function guardarBatida() {
  let seUsaronSustitutos = $('#cbAgregarSustitutos').bootstrapSwitch('state');
  if(seUsaronSustitutos) {
    let numBatidas = $('#numBatidas').val();
    let clave = $('#clave').val();
    let fechaCaptura = moment().format('DD/MM/YYYY');
    let claveProducto = $('#producto').val();
    let nombreProducto = $('#nombreProducto').val();

    let listaSubProductos = [], listaClaves = [];
    let claveSubProducto, nombreSubProducto, valorConstante;
    let claveBorrar, claveSustituto, nombreSustituto, valorConstanteSustituto, checkbox;

    $("#tabla-subProductos tbody tr").each(function (i) {
      $(this).children("td").each(function (j) {
        switch (j) {
          case 0:
            claveSubProducto = $(this).text();
            break;
          case 1:
            nombreSubProducto = $(this).text();
            break;
          case 3:
            valorConstante = $(this).text();
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

    $('#tabla-sustitutos tbody tr').each(function (i) {
      claveBorrar = $(this).attr('data-claveSubProducto');
      $(this).children("td").each(function (j) {
        switch (j) {
          case 0:
            claveSustituto = $(this).text();
            break;
          case 1:
            nombreSustituto = $(this).text();
            break;
          case 3:
            valorConstanteSustituto = $(this).text();
            break;
          case 4:
            checkbox = $(`cb-${claveSustituto}`).bootstrapSwitch('state');
            break;
        }
      });

      if(checkbox) {
        let posicion = listaClaves.indexOf(claveBorrar);
        listaSubProductos.splice(posicion, 1);
        let datosSustituto = {
          nombre: nombreSustituto,
          valorConstante: valorConstanteSustituto
        };

        listaSubProductos.push(datosSustituto);
        listaClaves.push(claveSustituto);
      }

      let datos = {
        nombre: nombreSubProducto,
        valorConstante: valorConstante
      };

      listaSubProductos.push(datos);
      listaClaves.push(claveSubProducto);
    });

    let rutaBatidas = db.ref('batidas');

    let batida = {
      numBatidas: numBatidas,
      claveBatida: clave,
      fechaCaptura: fechaCaptura,
      claveProducto: claveProducto,
      nombreProducto: nombreProducto,
      estado: "En proceso"
    };

    let keyBatida = rutaBatidas.push(batida).getKey();

    for (let i in listaSubProductos) {
      let rutaBatida = db.ref(`batidas/${keyBatida}/subProductos/${listaClaves[i]}`);
      rutaBatida.set(listaSubProductos[i]);
    }

    $('#producto').val('');
    $('#nombreProducto').val('');
    $('#numBatidas').val('');
    $('#tabla-subProductos tbody').html('');
    $('#btnGuardarBatida').attr('disabled', true);
    obtenerClaveBatida();
  }
  else {
    let numBatidas = $('#numBatidas').val();
    let clave = $('#clave').val();
    let fechaCaptura = moment().format('DD/MM/YYYY');
    let claveProducto = $('#producto').val();
    let nombreProducto = $('#nombreProducto').val();

    let listaSubProductos = [], listaClaves = [];
    let claveSubProducto, nombreSubProducto, valorConstante;

    $("#tabla-subProductos tbody tr").each(function (i) {
      $(this).children("td").each(function (j) {
        switch (j) {
          case 0:
            claveSubProducto = $(this).text();
            break;
          case 1:
            nombreSubProducto = $(this).text();
            break;
          case 3:
            valorConstante = $(this).text();
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
      numBatidas: numBatidas,
      claveBatida: clave,
      fechaCaptura: fechaCaptura,
      claveProducto: claveProducto,
      nombreProducto: nombreProducto,
      estado: "En proceso"
    };

    let keyBatida = rutaBatidas.push(batida).getKey();

    for (let i in listaSubProductos) {
      let rutaBatida = db.ref(`batidas/${keyBatida}/subProductos/${listaClaves[i]}`);
      rutaBatida.set(listaSubProductos[i]);
    }

    $('#producto').val('');
    $('#nombreProducto').val('');
    $('#numBatidas').val('');
    $('#tabla-subProductos tbody').html('');
    $('#btnGuardarBatida').attr('disabled', true);
    obtenerClaveBatida();
  }


}

function mostrarBatidas() {
  let tabla = $(`#tabla-batidasRegistradas`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "500px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "paging": false,
    "bInfo" : false
  });
  let rutaBatidas = db.ref('batidas');
  rutaBatidas.orderByChild("estado") .equalTo("En proceso").on('value', function(snap) {
    let batidas = snap.val();
    let filas = "";
    tabla.clear();

    for(let batida in batidas) {
      filas += `<tr>
                  <td>${batidas[batida].claveBatida}</td>
                  <td>${batidas[batida].claveProducto}</td>
                  <td>${batidas[batida].nombreProducto}</td>
                  <td>${batidas[batida].numBatidas}</td>
                  <td>${batidas[batida].fechaCaptura}</td>
                  <td class="text-center"><button onclick="abrirModalEditar('${batida}')" class="btn btn-warning btn-sm"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button></td>
                  <td class="text-center"><button onclick="abrirModalFinalizar('${batida}')" class="btn btn-success btn-sm"><i class="fa fa-check" aria-hidden="true"></i></button></td>
                </tr>`;
    }
    // $('#loader1').remove();
    // $('#tabla-batidasRegistradas tbody').html(filas)
    // $('#tabla-batidasRegistradas').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function abrirModalEditar(idBatida){
  $('#modalEditar').modal('show');
  mostrarSubProductos(idBatida);
  $('#btnGuardarCambios').attr('onclick', `guardarCambiosBatida('${idBatida}')`);
}

function mostrarSubProductos(idBatida) {
  /*let tabla = $(`#tablaModalEditar`).DataTable({
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
  });*/
  let rutaSubProductos = db.ref(`batidas/${idBatida}/subProductos`);
  rutaSubProductos.on('value', function(snap){
    let subProductos = snap.val();
    let filas = "";
    //tabla.clear();

    for(let subProducto in subProductos) {
      filas += `<tr>
                  <td>${subProducto}</td>
                  <td>${subProductos[subProducto].nombre}</td>
                  <td><input class="form-control" value="${subProductos[subProducto].valorConstante}"></td>
                </tr>`;
    }

    $('#tablaModalEditar tbody').html(filas);
    //tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function guardarCambiosBatida(idBatida){
  let listaValoresConstantes = [], listaClaves = [];
  let claveSubProducto, valorConstante;

  $("#tablaModalEditar tbody tr").each(function (i)
  {
    $(this).children("td").each(function (j)
    {
      if(j==0) {
        claveSubProducto = $(this).text();
      }
      if(j==2) {
        valorConstante = $(this).children().val()
      }
    });

    listaClaves.push(claveSubProducto);
    listaValoresConstantes.push(valorConstante);
  });

  for(let i in listaClaves){
    let ruta = db.ref(`batidas/${idBatida}/subProductos/${listaClaves[i]}`);
    ruta.update({
      valorConstante: listaValoresConstantes[i]
    });
  }
  $.toaster({priority: 'info', title: 'Info:', message: `Se actualizó la batida correctamente`});
  $('#modalEditar').modal('hide');

}

function finalizarBatida(idBatida) {
  //let rutaBatidas = db.ref('batidas');
  let rutaBatida = db.ref(`batidas/${idBatida}`);

  /*rutaBatida.once('value', function (snapshot) {
    let batida = snapshot.val();
    let rutaBatidaFinalizada = db.ref(`batidasFinalizadas/${idBatida}`);
    rutaBatidaFinalizada.set(batida);
    rutaBatidas.child(idBatida).remove();
  });*/

  rutaBatida.update({
    estado: "Finalizada"
  });

  $('#modalFinalizar').modal('hide');
}

function abrirModalFinalizar(idBatida) {
  $('#modalFinalizar').modal('show');
  $('#btnFinalizar').attr('onclick', `finalizarBatida('${idBatida}')`);
}

function mostrarBatidasFinalizadas() {
  let tabla = $(`#tabla-batidasFinalizadas`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "500px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    //"searching": false,
    //"paging": false,
    //"bInfo" : false
  });
  // let rutaBatidasFinalizadas = db.ref('batidasFinalizadas');
  let rutaBatidas = db.ref('batidas');
  rutaBatidas.orderByChild("estado").equalTo("Finalizada").on('value', function (snapshot) {
    let batidasFinalizadas = snapshot.val();
    let filas = "";
    tabla.clear();
    for(let batida in batidasFinalizadas) {
      filas += `<tr>
                  <td>${batidasFinalizadas[batida].claveBatida}</td>
                  <td>${batidasFinalizadas[batida].claveProducto}</td>
                  <td>${batidasFinalizadas[batida].nombreProducto}</td>
                  <td>${batidasFinalizadas[batida].numBatidas}</td>
                  <td>${batidasFinalizadas[batida].fechaCaptura}</td>
                </tr>`;
    }

    // $('#loader2').remove();
    // $('#tabla-batidasFinalizadas tbody').html(filas);
    // $('#tabla-batidasFinalizadas').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
  })

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

  $("#cbAgregarSustitutos").bootstrapSwitch();


  $('#fechaCaptura').val(moment().format('YYYY-MM-DD'));

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
