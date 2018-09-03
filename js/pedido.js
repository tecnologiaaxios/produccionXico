const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  mostrarDatos();
});

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

    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarDatos() {
  let idPedido = getQueryVariable('id');
  //let pedidos = JSON.parse(localStorage.getItem('pedidosEntrada'));
  db.ref(`pedidoEntrada/${idPedido}`).on("value", function(snapshot){
  
    let pedido = snapshot.val();

    let encabezado = pedido.encabezado,
        detalle = pedido.detalle,
        fecha = encabezado.fechaCaptura;

    if((encabezado.numOrden != "") && (typeof encabezado.numOrden != "undefined")) {
      $('#contenedorDatos').prepend(`<p id="numOrden" class="lead"><small>Núm. de orden: <strong>${encabezado.numOrden}</strong></small></p>`);
    }

    $('#keyPedido').html(`Id del pedido: ${idPedido}`);
    $('#clavePedido').html(`Pedido: ${encabezado.clave}`);
    let diaCaptura = fecha.substr(0,2),
        mesCaptura = fecha.substr(3,2),
        añoCaptura = fecha.substr(6,4),
        fechaCaptura = `${mesCaptura}/${diaCaptura}/${añoCaptura}`;
    
    moment.locale('es');
    let fechaCapturaMostrar = moment(fechaCaptura).format('LL');
      
    $('#fechaPedido').html(`Recibido el ${fechaCapturaMostrar}`);
    $('#tienda').html(`Tienda: ${encabezado.tienda}`);

    //let cantidadProductos = encabezado.cantidadProductos;
    let cantidadProductos = Object.keys(detalle).length;
    $('#cantidad').html(`<small class="lead">${cantidadProductos}</small>`);
    let filas = "", kgTotal = 0, degusTotal = 0, pedidoPzTotal = 0, piezaTotal = 0, precioUnitarioTotal = 0, cambioFisicoTotal = 0;

    for(let producto in detalle) {
      let datosProducto = detalle[producto];
      kgTotal += datosProducto.totalKg;
      degusTotal += datosProducto.degusPz;
      pedidoPzTotal += datosProducto.pedidoPz;
      piezaTotal += datosProducto.totalPz;
      precioUnitarioTotal += datosProducto.precioUnitario;
      cambioFisicoTotal += datosProducto.cambioFisicoPz;
      filas += `<tr>
                  <td class="text-center">${datosProducto.clave}</td>
                  <td>${datosProducto.nombre}</td>
                  <td class="text-right">${datosProducto.pedidoPz}</td>
                  <td class="text-right">${datosProducto.degusPz}</td>
                  <td class="text-right">${datosProducto.cambioFisicoPz}</td>
                  <td class="text-right">${datosProducto.totalPz}</td>
                  <td class="text-right">${datosProducto.totalKg}</td>
                  <td class="text-right">$ ${datosProducto.precioUnitario}</td>
                  <td class="text-center">${datosProducto.unidad}</td>
                </tr>`;
    }
    filas += `<tr>
                <td></td>
                <td class="text-right"><strong>Totales</strong></td>
                <td class="text-right"><strong>${pedidoPzTotal}</strong></td>
                <td class="text-right"><strong>${degusTotal}</strong></td>
                <td class="text-right"><strong>${cambioFisicoTotal}</strong></td>
                <td class="text-right"><strong>${piezaTotal}</strong></td>
                <td class="text-right"><strong>${kgTotal.toFixed(4)}</strong></td>
                <td class="text-right"><strong>$ ${precioUnitarioTotal.toFixed(4)}</strong></td>
                <td></td>
              </tr>`;

    $('#productos tbody').html(filas);

    let datatable = $('#productos').DataTable({
      destroy: true,
      autoWidth: true,
      ordering: false,
      paging: false,
      searching: false,
      dom: 'Bfrtip',
      buttons: ['excel'],
      scrollY: "500px",
      scrollCollapse: true,
      language: {
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
          sSortAscending:
            ': Activar para ordenar la columna de manera ascendente',
          sSortDescending:
            ': Activar para ordenar la columna de manera descendente'
        }
      }
    });
  });

  //datatable.rows.add($(filas)).columns.adjust().draw();
}

function generarPDF(){
    let contenido= document.getElementById('panel').innerHTML;
    let contenidoOriginal= document.body.innerHTML;
    document.body.innerHTML = contenido;
    window.print();
    document.body.innerHTML = contenidoOriginal;
}