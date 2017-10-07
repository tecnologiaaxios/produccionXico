const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function getQueryVariable(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    if (user) { //si hay un usuario
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarDatos() {
  let idPedido = getQueryVariable('id');
  let pedidoRef = db.ref('pedidoEntrada/'+idPedido);
  pedidoRef.on('value', function(snapshot) {
    let datos = snapshot.val();

    $('#numPedido').html("Pedido: " + idPedido);
    let diaCaptura = datos.encabezado.fechaCaptura.substr(0,2);
    let mesCaptura = datos.encabezado.fechaCaptura.substr(3,2);
    let añoCaptura = datos.encabezado.fechaCaptura.substr(6,4);
    let fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
    moment.locale('es');
    let fechaCapturaMostrar = moment(fechaCaptura).format('LL');
    $('#fechaPedido').html("Recibido el "+fechaCapturaMostrar);
    $('#tienda').html('Tienda: ' + datos.encabezado.tienda);
    let detalle = datos.detalle;
    $('#cantidad').html('<small class="lead">'+Object.keys(detalle).length+'</small>');
    let trs = "";
    for(let producto in detalle) {
      let datosProducto = detalle[producto];
      trs += `<tr>
              <td>${datosProducto.clave}</td>
              <td>${datosProducto.nombre}</td>
              <td>${datosProducto.degusPz}</td>
              <td>${datosProducto.pedidoPz}</td>
              <td>${datosProducto.totalPz}</td>
              <td>${datosProducto.totalKg}</td>
              <td>${datosProducto.precioUnitario}</td>
              <td>${datosProducto.unidad}</td>
              <td>${datosProducto.cambioFisico}</td>
              <td class="text-center"><button class="btn btn-warning btn-sm"><i class="glyphicon glyphicon-pencil" aria-hidden="true"></i></button></td>
              <td class="text-center"><button class="btn btn-danger btn-sm" onclick="abrirModalEliminarProducto('${producto}')"><i class="glyphicon glyphicon-remove" aria-hidden="true"></i></button></td>
             </tr>`;
    }

    $('#tbodyProductos').empty().append(trs);
  });
}

function abrirModal() {
  $('#modalAgregarProducto').modal('show');
  llenarSelectProductos();
}

function llenarSelectProductos() {
  let idPedido = getQueryVariable('id');
  let pedidoEntradaRef = db.ref(`pedidoEntrada/${idPedido}`);
  pedidoEntradaRef.on('value', function(snapshot) {
    let consorcio = snapshot.val().encabezado.consorcio;

    let productosRef = db.ref('productos/'+consorcio);
    productosRef.on('value', function(snapshot) {
      let productos = snapshot.val();
      let options = '<option value="Seleccionar" id="SeleccionarProducto">Seleccionar</option>';
      for(let producto in productos) {
        options += `<option value="${producto}"> ${producto} ${productos[producto].nombre} ${productos[producto].empaque}</option>`;
      }
      $('#listaProductos').html(options);
    });
  })
}

$('#listaProductos').change(function() {
  let idPedido = getQueryVariable('id');
  let pedidoEntradaRef = db.ref(`pedidoEntrada/${idPedido}`);
  pedidoEntradaRef.on('value', function(snapshot) {
    let consorcio = snapshot.val().encabezado.consorcio;
    let idProducto = $('#listaProductos').val();

    let productoActualRef = db.ref('productos/'+consorcio+'/'+idProducto);
    productoActualRef.on('value', function(snapshot) {
      let producto = snapshot.val();
      $('#nombre').val(producto.nombre);
      $('#empaque').val(producto.empaque);
      $('#precioUnitario').val(producto.precioUnitario);
      $('#unidad').val(producto.unidad);
      $('#claveConsorcio').val(producto.claveConsorcio);
    });
  });

  if(this.value != null || this.value != undefined) {
    $('#productos').parent().removeClass('has-error');
    $('#helpblockProductos').hide();
  } else {
    $('#productos').parent().addClass('has-error');
    $('#helpblockProductos').show();
  }
});

$('#pedidoPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisico = Number($('#cambioFisico').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisico;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);

  if(this.value.length < 1) {
    $('#pedidoPz').parent().addClass('has-error');
    $('#helpblockPedidoPz').show();
  }
  else {
    $('#pedidoPz').parent().removeClass('has-error');
    $('#helpblockPedidoPz').hide();
  }
});

$('#degusPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisico = Number($('#cambioFisico').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisico;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$('#cambioFisico').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisico = Number($(this).val());
  if(cambioFisico == undefined || cambioFisico == null) {
    cambioFisico = 0;
  }
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisico;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

function agregarProducto() {
  let idPedido = getQueryVariable('id');
  let claveProducto = $('#listaProductos').val();
  let nombre = $('#nombre').val();
  let pedidoPz = $('#pedidoPz').val();
  let degusPz = $('#degusPz').val();
  let cambioFisico = $('#cambioFisico').val();
  let unidad = $('#unidad').val();
  let empaque = $('#empaque').val();
  let totalKg = $('#totalKg').val();
  let totalPz = $('#totalPz').val();
  let precioUnitario = $('#precioUnitario').val();
  let claveConsorcio = $('#claveConsorcio').val();
  let pedidoKg = pedidoPz * empaque;

  if(claveProducto != null && claveProducto && undefined && claveProducto != "Seleccionar" && pedidoPz.length > 0) {
    if(cambioFisico.length < 1) {
      cambioFisico = 0;
    }
    if(degusPz.length < 1) {
      degusPz = 0;
    }
    let cambioFisicoKg = cambioFisico * empaque;
    let degusKg = degusPz * empaque;

    let datosProducto = {
      cambioFisico: cambioFisico,
      cambioFisicoKg: cambioFisicoKg,
      clave: claveProducto,
      claveConsorcio: claveConsorcio,
      degusKg: degusKg,
      degusPz: degusPz,
      precioUnitario: precioUnitario,
      totalKg: totalKg,
      totalPz: totalPz,
      unidad: unidad
    }

    let claves = [];

    let $filas = $('#tbodyProductos').children('tr'); //arreglo de hijos (filas)
    console.log($filas);
    $filas.each(function () {
      let clave = $(this)[0].cells[0].innerHTML;
      claves.push(clave);
    });

    if(claves.includes(claveProducto)) {
      $.toaster({priority: 'warning', title: 'Mensaje de información', message: `El producto ${clave} ya se encuentra en el pedido`});
    }
    else {
      let pedidoEntradaRef = db.ref(`pedidoEntrada/${idPedido}/detalle`);
      pedidoEntradaRef.push(datosProducto);
      $.toaster({priority: 'success', title: 'Mensaje de información', message: `Se agregó el producto ${clave} al pedido`});

      $('#listaProductos').val('');
      $('#nombre').val('');
      $('#pedidoPz').val('');
      $('#degusPz').val('');
      $('#cambioFisico').val('');
      $('#unidad').val('');
      $('#empaque').val('');
      $('#totalKg').val('');
      $('#totalPz').val('');
      $('#precioUnitario').val('');
      $('#claveConsorcio').val('');

      $('#modalAgregarProducto').modal('hide');
    }
  }
  else {
    if(claveProducto == null || claveProducto == undefined || claveProducto == "Seleccionar") {
      $('#listaProductos').parent().addClass('has-error');
      $('#helpblockProductos').show();
    }
    else {
      $('#productos').parent().removeClass('has-error');
      $('#helpblockProductos').hide();
    }
    if(pedidoPz.length < 1) {
      $('#pedidoPz').parent().addClass('has-error');
      $('#helpblockPedidoPz').show();
    }
    else {
      $('#pedidoPz').parent().removeClass('has-error');
      $('#helpblockPedidoPz').hide();
    }
  }
}

function abrirModalEliminarProducto(idProducto) {
  $('#modalConfirmarEliminarProducto').modal('show');
  $('#btnConfirmar').attr('onclick', `eliminarProducto("${idProducto}")`);
}

function eliminarProducto(idProducto) {
  let idPedido = getQueryVariable('id');

  db.ref(`pedidoEntrada/${idPedido}/detalle`).child(idProducto).remove();
  $.toaster({priority: 'success', title: 'Mensaje de información', message: `El producto ${idProducto} fue eliminado con exito de este pedido`});
}

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
  mostrarDatos();
  $('[data-toggle="tooltip"]').tooltip();
});

function generarPDF(){
    let contenido= document.getElementById('panel').innerHTML;
    let contenidoOriginal= document.body.innerHTML;
    document.body.innerHTML = contenido;
    window.print();
    document.body.innerHTML = contenidoOriginal;
}
/*function generarPDF() {
  let pdf = new jsPDF('p', 'in', 'letter');

  var source = $('#panel')[0];
  var specialElementHandlers = {
    '#bypassme': function(element, renderer) {
    return true;
    }
  };

  pdf.fromHTML(
    source, // HTML string or DOM elem ref.
    0.5, // x coord
    0.5, // y coord
    {
    'width': 7.5, // max width of content on PDF
    'elementHandlers': specialElementHandlers
  });

  var string = pdf.output('datauristring');
  var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
  var x = window.open();
  x.document.open();
  x.document.write(iframe);
  x.document.close();
}*/

/*function generarPDF() {
  let pdf = new jsPDF();

  pdf.fromHTML($('#panel').get(0), 10, 10, {'width': 180});
  //pdf.autoPrint();
  //pdf.output("dataurlnewwindow"); // this opens a new popup,  after this the PDF opens the print window view but there are browser inconsistencies with how this is handled

  var string = pdf.output('datauristring');
  var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
  var x = window.open();
  x.document.open();
  x.document.write(iframe);
  x.document.close();
}*/
