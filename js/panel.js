var config = {
  apiKey: "AIzaSyA19j6-VLNcXLJfBkfd_lZfFFbzg6z0Imc",
  authDomain: "xico-netcontrol.firebaseapp.com",
  databaseURL: "https://xico-netcontrol.firebaseio.com",
  projectId: "xico-netcontrol",
  storageBucket: "xico-netcontrol.appspot.com",
  messagingSenderId: "248615705793"
};
firebase.initializeApp(config);

const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  obtenerClaveBatida();
  llenarSugerenciasProductos();

  $("#cbAgregarSustitutos").bootstrapSwitch();

  $('#fechaCaptura').val(moment().format('YYYY-MM-DD'));

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });

  let arrBatidas = [];
  db.ref('batidas').orderByChild("estado").equalTo("En proceso").on('value', (batidas) => {
    batidas.forEach((batida) => {
      arrBatidas.push({
        id: batida.key,
        ...batida.val()
      });
    })
    // localStorage.setItem('batidas', JSON.stringify(arrBatidas));
    localforage.setItem('batidas', arrBatidas, err => {
      console.log(err ? err : 'Batidas guardadas en localforage')
      mostrarBatidas();
    });
  });

  let arrBatidasFinalizadas = [];
  db.ref('batidas').orderByChild("estado").equalTo("Finalizada").on('value', (batidas) => {
    batidas.forEach((batida) => {
      arrBatidasFinalizadas.push({
        id: batida.key,
        ...batida.val()
      });
    });
    //localStorage.setItem('batidasFinalizadas', JSON.stringify(arrBatidasFinalizadas));
    localforage.setItem('batidasFinalizadas', arrBatidasFinalizadas, err => {
      console.log(err ? err : 'Batidas finalizadas guardadas en localforage')
      mostrarBatidasFinalizadas();
    });
  });
});

$('#batidasEnProceso').on('shown.bs.tab', () => {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

$('#batidasFinalizadas').on('shown.bs.tab', () => {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

/* $('#linkPedidosVerificados').on('click', (e) => {
  e.preventDefault();

  let arrPedidosVerificados = [], arrPedidosFinalizados = [];
  db.ref(`pedidoPadre`).on('value', (pedidosVerificados) => { 
    pedidosVerificados.forEach(pedidoVerificado => {
      let pedido = pedidoVerificado.val();

      if(pedido.estado == "Verificado") {
        arrPedidosVerificados.push({
          id: pedidoVerificado.key,
          ...pedidoVerificado.val()
        });
      }
      if(pedido.estado == "Finalizado") {
        arrPedidosFinalizados.push({
          id: pedidoVerificado.key,
          ...pedidoVerificado.val()
        });
      }
    });

    localStorage.setItem('pedidosVerificados', JSON.stringify(arrPedidosVerificados));
    localStorage.setItem('pedidosFinalizados', JSON.stringify(arrPedidosFinalizados));
    $(location).attr("href", "pedidosVerificados.html");
  });
}); */

/* $('#linkPedidos').on('click', (e) => {
  e.preventDefault();
  
  let arrPedidos = [];
  db.ref('pedidoEntrada').on('value', (pedidos) => {
    pedidos.forEach((pedido) => {
      arrPedidos.unshift({
        id: pedido.key,
        ...pedido.val()
      });
    });

    let datosPedidos = pedidos.val();

   
    localforage.setItem('pedidos', arrPedidos, err => {
      console.log(err ? err : 'Pedidos guardadas en localforage')
      mostrarBatidasFinalizadas();
    });
    
    
    localforage.setItem('pedidosEntrada', datosPedidos, err => {
      console.log(err ? err : 'Pedidos entrada guardadas en localforage')
      mostrarBatidasFinalizadas();
    });
    $(location).attr('href', 'pedidos.html');
  })
}); */

function llenarSugerenciasProductos() {
  let formulasRef = db.ref(`formulaciones`);
  formulasRef.on('value', function(snap) {
    let productos = snap.val();
    let options = "";
    for(let producto in productos) {
      options += `<option value="${producto}">`;
    }
    $('#sugerenciasProductos').html(options);
  });
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

$('#claveProducto').keypress(function(e) {
  if (e.which == 13) {
    let claveProducto = $(this).val().toUpperCase();

    if(claveProducto.length > 0) {
      let rutaFormulaciones = db.ref(`formulaciones/${claveProducto}`);
      rutaFormulaciones.once('value', function(snapshot){
        if (snapshot.hasChildren()) {
          $('#nombreProducto').val(snapshot.val().nombre);
          $('#numBatidas').attr('readonly', false);
          //$('#btnGenerarFormula').attr('disabled', false);

          $('#tabla-subProductos tbody').html('');
          $('#tabla-sustitutos tbody').html('');
          $('#numBatidas').val('');
          $('#kilosProduccion').val('');
          $('#cbAgregarSustitutos').bootstrapSwitch('state', false);
          $('#cbAgregarSustitutos').bootstrapSwitch('readonly', true, true);
        }else{
          $.toaster({priority: 'danger', title: 'Error', message: `El producto con la clave ${claveProducto} no existe`});
          $('#nombreProducto').val('');
          $('#numBatidas').attr('readonly', false);
          $('#tabla-subProductos tbody').html('');
          $('#tabla-sustitutos tbody').html('');
          $('#numBatidas').val('');
          $('#kilosProduccion').val('');
          $('#cbAgregarSustitutos').bootstrapSwitch('state', false);
          $('#cbAgregarSustitutos').bootstrapSwitch('readonly', true, true);
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
  let numBatidas = Number($('#numBatidas').val());
  if(numBatidas > 0) {
    $('#numBatidas').parent().parent().removeClass('has-error');
    $('#helpBlockNumBatidas').addClass('hidden');

    obtenerFormulaBase();
    calcularKilos();
    mostrarSustitutos();
  }
  else {
    $('#numBatidas').parent().parent().addClass('has-error');
    $('#helpBlockNumBatidas').removeClass('hidden');
    $('#tabla-subProductos tbody').html('');
    $('#tabla-sustitutos tbody').html('');
    $('#kilosProduccion').val('');
    $('#cbAgregarSustitutos').bootstrapSwitch('state', false);
    $('#cbAgregarSustitutos').bootstrapSwitch('readonly', true, true);
  }
});

$("#numBatidas").keyup(function() {
  let numBatidas = $(this).val();
  if(numBatidas.length > 0) {
    $('#btnGenerarFormula').attr('disabled', false);
  }
  else {
    $('#btnGenerarFormula').attr('disabled', true);
  }
});

function calcularKilos() {
  let claveProducto = $('#claveProducto').val().toUpperCase();

  let rutaFormula = db.ref(`formulaciones/${claveProducto}`);
  rutaFormula.once('value', function(snap) {
    if (snap.hasChildren()) {
      let kilosProduccion = snap.val().kilosProduccion;
      let numBatidas = $('#numBatidas').val();

      console.log(kilosProduccion)

      $('#kilosProduccion').val((kilosProduccion*numBatidas).toFixed(4));
    }
  });
}

function obtenerFormulaBase() {
  let tabla = $(`#tabla-subProductos`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "searching": false,
    "paging": false,
    "bInfo" : false
  });

  let claveProducto = $('#claveProducto').val().toUpperCase();
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
          filas += `<tr id="fila-${subProducto}" class="info">
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
  $('input[name="cbAgregarSustitutos"]').bootstrapSwitch('readonly', false, true);
}

function mostrarSustitutos() {
  // let tabla = $(`#tabla-sustitutos`).DataTable({
  //   destroy: true,
  //   "lengthChange": false,
  //   "scrollY": "200px",
  //   "scrollCollapse": true,
  //   "language": {
  //     "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
  //   },
  //   "searching": false,
  //   "paging": false,
  //   "bInfo" : false
  // });

  let claveProducto = $('#claveProducto').val().toUpperCase();
  let numBatidas = $('#numBatidas').val();
  let rutaFormulaciones = db.ref(`formulaciones/${claveProducto}/subProductos`);
  rutaFormulaciones.on('value', function(snapshot) {
    let subProductos = snapshot.val();
    // tabla.clear();
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
    }
    $('#tabla-sustitutos tbody').html(filas)
    // tabla.rows.add($(filas)).columns.adjust().draw();
    $('.toggle-checkbox').bootstrapSwitch();
  });
}

function quitarSubProducto(idFila){
  $(`#${idFila}`).remove();
}

function guardarBatida() {
  let seUsaronSustitutos = $('#cbAgregarSustitutos').bootstrapSwitch('state');
  if(seUsaronSustitutos) {
    let numBatidas = Number($('#numBatidas').val());
    let clave = Number($('#clave').val());
    let fechaString = $('#fechaCaptura').val();
    let date = fechaString.split("-");
    let dia = date[2];
    let mes = date[1];
    let año = date[0];
    let dateObj = new Date(`${mes}/${dia}/${año}`);
    let fechaCaptura = moment(dateObj).format('DD/MM/YYYY');
    let claveProducto = $('#claveProducto').val().toUpperCase();
    let nombreProducto = $('#nombreProducto').val();
    let kilosProduccion = Number($('#kilosProduccion').val());

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
        listaClaves.splice(posicion, 1);
        let datosSustituto = {
          nombre: nombreSustituto,
          valorConstante: valorConstanteSustituto
        };

        listaSubProductos.push(datosSustituto);
        listaClaves.push(claveSustituto);
      }
    });

    let rutaBatidas = db.ref('batidas');

    let batida = {
      numBatidas: numBatidas,
      kilosProduccion: kilosProduccion,
      kilos: 0,
      piezas: 0,
      costo: 0,
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

    $('#claveProducto').val('');
    $('#nombreProducto').val('');
    $('#numBatidas').val('');
    $('#kilosProduccion').val('');
    $('#tabla-subProductos tbody').html('');
    $('#btnGuardarBatida').attr('disabled', true);
    $('#cbAgregarSustitutos').bootstrapSwitch('readonly', true, true);
    $('#tabla-sustitutos tbody').html('');
    $('#collapseSustitutos').collapse('hide');

    obtenerClaveBatida();
  }
  else {
    let numBatidas = Number($('#numBatidas').val());
    let clave = Number($('#clave').val());
    let fechaString = $('#fechaCaptura').val();
    let date = fechaString.split("-");
    let dia = date[2];
    let mes = date[1];
    let año = date[0];
    let dateObj = new Date(`${mes}/${dia}/${año}`);
    let fechaCaptura = moment(dateObj).format('DD/MM/YYYY');
    let claveProducto = $('#claveProducto').val().toUpperCase();
    let nombreProducto = $('#nombreProducto').val();
    let kilosProduccion = Number($('#kilosProduccion').val());

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
      kilosProduccion: kilosProduccion,
      kilos: 0,
      piezas: 0,
      costo: 0,
      estado: "En proceso"
    };

    let keyBatida = rutaBatidas.push(batida).getKey();

    for (let i in listaSubProductos) {
      let rutaBatida = db.ref(`batidas/${keyBatida}/subProductos/${listaClaves[i]}`);
      rutaBatida.set(listaSubProductos[i]);
    }

    $('#claveProducto').val('');
    $('#nombreProducto').val('');
    $('#numBatidas').val('');
    $('#kilosProduccion').val('');
    $('#tabla-subProductos tbody').html('');
    $('#btnGuardarBatida').attr('disabled', true);
    $('#cbAgregarSustitutos').bootstrapSwitch('readonly', true, true);
    $('#tabla-sustitutos tbody').html('');
    $('#collapseSustitutos').collapse('hide');

    obtenerClaveBatida();
  }
}

function mostrarBatidas() {
  //let batidas = JSON.parse(localStorage.getItem('batidas'));
  localforage.getItem('batidas', (err, value) => {
    console.log('Obteniendo batidas de localforage');
    let batidas = value;

    let datatable = $('#tabla-batidasRegistradas').DataTable({
      data: batidas,
      pageLength: 10,
      destroy: true,
      //"searching": false
      //"paging": false,
      //"bInfo" : false
      lengthChange: false,
      scrollY: "500px",
      scrollCollapse: true,
      stripeClasses: ['info', ''],
      columns: [
        { data: 'claveBatida' },
        { data: 'claveProducto' },
        { data: 'nombreProducto' },
        { data: 'numBatidas' },
        { data: 'fechaCaptura' },
        { data: 'id',
          className: 'text-center',
          render: (id) => {
            return `<button onclick="abrirModalEditar('${id}')" class="btn btn-warning btn-sm"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
          }
        },
        { data: 'id', 
          className: 'text-center', 
          render: (id) => { 
            return `<button onclick="abrirModalFinalizar('${id}')" class="btn btn-success btn-sm"><i class="fa fa-check" aria-hidden="true"></i></button>`
          } 
        }
      ],
      language: {
        searchPlaceholder: "Buscar batida",
        sProcessing: 'Procesando...',
        sLengthMenu: 'Mostrar _MENU_ registros',
        sZeroRecords: 'No se encontraron resultados',
        sEmptyTable: 'Ningún dato disponible en esta tabla',
        sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
        sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
        sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
        sInfoPostFix: '',   
        sSearch: '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>',
        sUrl: '',
        sInfoThousands: ',',
        sLoadingRecords: 'Cargando...',
        oPaginate: {
          sFirst: 'Primero',
          sLast: 'Último',
          sNext: 'Siguiente',
          sPrevious: 'Anterior'
        },
        oAria: {
          sSortAscending: ': Activar para ordenar la columna de manera ascendente',
          sSortDescending: ': Activar para ordenar la columna de manera descendente'
        }
      }
    });

    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
  });
}

function abrirModalEditar(idBatida) {
  $('#modalEditar').modal('show');
  $('#kilos').attr('data-idBatida', idBatida);
  mostrarDatosBatida(idBatida);
  $('#btnGuardarCambios').attr('onclick', `guardarCambiosBatida('${idBatida}')`);
}

function mostrarDatosBatida(idBatida) {
  let tabla = $(`#tablaModalEditar`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "paging": false,
    "bInfo" : false,
  });

  let rutaSubProductos = db.ref(`batidas/${idBatida}`);
  rutaSubProductos.on('value', function(snap){
    let kilos = snap.val().kilos;
    let piezas = snap.val().piezas;
    let merma = snap.val().merma;
    let comentarios = snap.val().comentarios;
    if (kilos != undefined && piezas != undefined && merma != undefined && comentarios != undefined) {
      $('#kilos').val(kilos);
      $('#piezas').val(piezas);
      $('#merma').val(merma);
      $('#comentarios').val(comentarios);
    }else{
      $('#kilos').val("");
      $('#piezas').val("");
      $('#merma').val("")
      $('#comentarios').val("");
    }
    let subProductos = snap.val().subProductos;
    let filas = "";
    tabla.clear();
    let i = 0;

    for(let subProducto in subProductos) {
      if(i%2 == 0) {
        filas += `<tr class="info">
                    <td>${subProducto}</td>
                    <td>${subProductos[subProducto].nombre}</td>
                    <td class="text-center"><input class="form-control input-sm" value="${subProductos[subProducto].valorConstante}"></td>
                    <td class="hidden">${subProductos[subProducto].precio}</td>
                  </tr>`;
      }
      else {
        filas += `<tr>
                    <td>${subProducto}</td>
                    <td>${subProductos[subProducto].nombre}</td>
                    <td class="text-center"><input class="form-control input-sm" value="${subProductos[subProducto].valorConstante}"></td>
                    <td class="hidden">${subProductos[subProducto].precio}</td>
                  </tr>`;
      }
      i++;
    }
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

$('#modalEditar').on('shown.bs.modal', function() {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

$('#modalVerDetalles').on('shown.bs.modal', function() {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

function verDetalles(idBatida) {
  let tabla = $(`#tablaModalVer`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "paging": false,
    "bInfo" : false,
  });

  let rutaSubProductos = db.ref(`batidas/${idBatida}`);
  rutaSubProductos.on('value', function(snap) {
    let kilos = snap.val().kilos;
    let piezas = snap.val().piezas;
    let merma = snap.val().merma;
    let comentarios = snap.val().comentarios;

    $('#kilosVer').val(kilos);
    $('#piezasVer').val(piezas);
    $('#mermaVer').val(merma);
    $('#comentariosVer').val(comentarios);

    let subProductos = snap.val().subProductos;
    let filas = "";
    tabla.clear();
    let i = 0;

    for(let subProducto in subProductos) {
      if(i%2 == 0) {
        filas += `<tr class="info">
                    <td>${subProducto}</td>
                    <td>${subProductos[subProducto].nombre}</td>
                    <td class="text-right">${subProductos[subProducto].valorConstante}</td>
                  </tr>`;
      }
      else {
        filas += `<tr>
                    <td>${subProducto}</td>
                    <td>${subProductos[subProducto].nombre}</td>
                    <td class="text-right">${subProductos[subProducto].valorConstante}</td>
                  </tr>`;
      }
      i++;
    }
    tabla.rows.add($(filas)).columns.adjust().draw();
  });

  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
}

function guardarCambiosBatida(idBatida) {
  let kilos = $('#kilos').val();
  let piezas = $('#piezas').val();
  let merma = $('#merma').val();
  let comentarios = $('#comentarios').val();

  if(kilos.length > 0 && piezas.length > 0) {
    let listaValoresConstantes = [], listaClaves = [];
    let claveSubProducto, valorConstante, precio, costo = 0;

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
        /*if(j==3) {
          precio = Number($(this).text());
        }*/
      });

      listaClaves.push(claveSubProducto);
      listaValoresConstantes.push(valorConstante);
      //costo += precio;
    });

    let rutaBatida = db.ref(`batidas/${idBatida}`);
    rutaBatida.update({
      kilos: Number(kilos),
      piezas: Number(piezas),
      merma: Number(merma),
      comentarios: comentarios
    });

    for(let i in listaClaves) {
      let ruta = db.ref(`batidas/${idBatida}/subProductos/${listaClaves[i]}`);
      ruta.update({
        valorConstante: Number(listaValoresConstantes[i])
      });
      let rutaSubProducto = db.ref(`subProductos/${listaClaves[i]}`);
      rutaSubProducto.once('value', function(snap) {
        let precio = snap.val().precioPesos;
        costo += precio*Number(listaValoresConstantes[i]);

        if(i==listaClaves.length-1) {
          costo = (costo/kilos).toFixed(4);
          rutaBatida.update({ costo: Number(costo)})
        }
      });
    }
    $.toaster({priority: 'info', title: 'Info:', message: `Se actualizó la batida correctamente`});
    $('#modalEditar').modal('hide');
  }
  else {
    if(kilos.length < 1) {
      $('#kilos').parent().addClass('has-error');
      $('#helpBlockKilos').removeClass('hidden');
    }
    else {
      $('#kilos').parent().removeClass('has-error');
      $('#helpBlockKilos').addClass('hidden');
    }
    if(piezas.length < 1) {
      $('#piezas').parent().addClass('has-error');
      $('#helpBlockPiezas').removeClass('hidden');
    }
    else {
      $('#piezas').parent().removeClass('has-error');
      $('#helpBlockPiezas').addClass('hidden');
    }
  }
}

$('#kilos').keyup(function() {
  let kilos = $(this).val();

  if(kilos.length < 1) {
    $('#kilos').parent().addClass('has-error');
    $('#helpBlockKilos').removeClass('hidden');

    $('#merma').val('');
  }
  else {
    let idBatida = $(this).attr('data-idBatida');
    let rutaBatida = db.ref(`batidas/${idBatida}`);
    rutaBatida.once('value', function(snap) {
      let kilosProduccion = snap.val().kilosProduccion;
      let merma = ((kilosProduccion - kilos) / kilosProduccion) * 100;
      $('#merma').val(merma.toFixed(4));

      if(merma > 4) {
        $('#merma').parent().parent().removeClass('has-success');
        $('#merma').parent().parent().addClass('has-error');
      }
      else {
        $('#merma').parent().parent().removeClass('has-error');
        $('#merma').parent().parent().addClass('has-success');
      }
    });

    $('#kilos').parent().removeClass('has-error');
    $('#helpBlockKilos').addClass('hidden');
  }
});

function abrirModalVerDetalles(idBatida) {
  $('#modalVerDetalles').modal('show');
  verDetalles(idBatida);
}

$('#piezas').keyup(function() {
  let piezas = $(this).val();

  if(piezas.length < 1) {
    $('#piezas').parent().addClass('has-error');
    $('#helpBlockPiezas').removeClass('hidden');
  }
  else {
    $('#piezas').parent().removeClass('has-error');
    $('#helpBlockPiezas').addClass('hidden');
  }
});

function actualizarProductoDashboard(idBatida) {
  let ruta = db.ref(`batidas/${idBatida}`);

  ruta.once('value', function(snapshot){
    let claveProducto = snapshot.val().claveProducto;
    let nombreProducto = snapshot.val().nombreProducto;
    let costo = snapshot.val().costo;
    let kilos = snapshot.val().kilos;
    let merma = snapshot.val().merma;
    let piezas = snapshot.val().piezas;
    let kilosProduccion = snapshot.val().kilosProduccion;
    let subProductos = snapshot.val().subProductos;
    let fechaCaptura = snapshot.val().fechaCaptura;
    let fechaFinalizada = snapshot.val().fechaFinalizada;

    let costosProduccion = db.ref(`costosProduccion/${claveProducto}`);
    costosProduccion.update({
      costo: costo,
      nombre: nombreProducto,
      kilos: kilos,
      merma: merma,
      piezas: piezas,
      kilosProduccion: kilosProduccion,
      subProductos: subProductos,
      fechaCaptura: fechaCaptura,
      fechaFinalizada: fechaFinalizada
    });

    // costosProduccion.once('value', function(snapshot) {
    //   let datos = snapshot.val();
    //   let historialCostos = datos.historialCostos;
    //
    //   let nuevoHistorialCostos = [
    //     {
    //       fecha: fechaCaptura,
    //       costo: costo
    //     },
    //     historialCostos[0],
    //     historialCostos[1],
    //     historialCostos[2],
    //     historialCostos[3]
    //   ]
    //
    //   costosProduccion.update({
    //     historialCostos: nuevoHistorialCostos
    //   })
    // })
  });
}

function finalizarBatida(idBatida) {
  let rutaBatida = db.ref(`batidas/${idBatida}`);
  let fechaFinalizada = moment().format('DD/MM/YYYY');

  rutaBatida.update({
    estado: "Finalizada",
    fechaFinalizada: fechaFinalizada
  });

  actualizarProductoDashboard(idBatida);

  $('#modalFinalizar').modal('hide');
}

function abrirModalFinalizar(idBatida) {
  $('#modalFinalizar').modal('show');
  $('#btnFinalizar').attr('onclick', `finalizarBatida('${idBatida}')`);
}

function mostrarBatidasFinalizadas() {
  //let batidasFinalizadas = JSON.parse(localStorage.getItem('batidasFinalizadas'));
  localforage.getItem('batidasFinalizadas', (err, value) => {
    console.log('Obteniendo batidas finalizadas de localforage');
    let batidasFinalizadas = value;

    let datatable = $('#tabla-batidasFinalizadas').DataTable({
      data: batidasFinalizadas,
      pageLength: 10,
      destroy: true,
      //"searching": false
      //"paging": false,
      //"bInfo" : false
      lengthChange: false,
      scrollY: "500px",
      scrollCollapse: true,
      stripeClasses: ['info', ''],
      columns: [
        { data: 'claveBatida' },
        { data: 'claveProducto' },
        { data: 'nombreProducto' },
        { data: 'numBatidas' },
        { data: 'fechaCaptura' },
        { data: 'fechaFinalizada' },
        { data: 'id', 
          className: 'text-center', 
          render: (id) => { 
            return `<button type="button" onclick="abrirModalVerDetalles('${id}')" class="btn btn-default btn-sm" data-toggle="tooltip" data-placement="right" title="Ver más"><i class="glyphicon glyphicon-eye-open"></i></button>`
          } 
        }
      ],
      language: {
        searchPlaceholder: "Buscar batida",
        sProcessing: 'Procesando...',
        sLengthMenu: 'Mostrar _MENU_ registros',
        sZeroRecords: 'No se encontraron resultados',
        sEmptyTable: 'Ningún dato disponible en esta tabla',
        sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
        sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
        sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
        sInfoPostFix: '',   
        sSearch: '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>',
        sUrl: '',
        sInfoThousands: ',',
        sLoadingRecords: 'Cargando...',
        oPaginate: {
          sFirst: 'Primero',
          sLast: 'Último',
          sNext: 'Siguiente',
          sPrevious: 'Anterior'
        },
        oAria: {
          sSortAscending: ': Activar para ordenar la columna de manera ascendente',
          sSortDescending: ': Activar para ordenar la columna de manera descendente'
        }
      }
    });

    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
  });
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
  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
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

      lis += `<li>
                <a>
                  <div>
                    <i class="fa fa-comment fa-fw"></i>${arrayNotificaciones[i].mensaje}
                      <span class="pull-right text-muted small">${fecha}</span>
                  </div>
                </a>
              </li>`;
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
