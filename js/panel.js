const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarPedidos();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarPedidos() {
  let pedidosEntradaRef = db.ref('pedidoEntrada/');
  pedidosEntradaRef.on('value', function(snapshot) {
    let pedidos = snapshot.val();
    let row="";

    for(let pedido in pedidos) {
      let estado = "";
      switch(pedidos[pedido].encabezado.estado) {
        case "Pendiente":
          estado = '<td class="no-padding"><i style="color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
        case "En proceso":
          estado = '<td class="no-padding"><i style="color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
        case "Lista":
          estado = '<td class="no-padding"><i style="color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
      }

      let diaCaptura = pedidos[pedido].encabezado.fechaCaptura.substr(0,2);
      let mesCaptura = pedidos[pedido].encabezado.fechaCaptura.substr(3,2);
      let añoCaptura = pedidos[pedido].encabezado.fechaCaptura.substr(6,4);
      let fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
      moment.locale('es');
      let fechaCapturaMostrar = moment(fechaCaptura).format('DD MMMM YYYY');

      row += '<tr style="padding:0px 0px 0px;" class="no-pading">' +
               '<td>' + pedido +'</td>' +
               '<td>' + fechaCapturaMostrar + '</td>' +
               '<td>' + pedidos[pedido].encabezado.tienda +'</td>' +
               '<td>' + pedidos[pedido].encabezado.ruta +'</td>' +
               '<td class="no-padding"><button type="button" class="btn btn-info btn-sm"><span style="padding-bottom:0px;" class="glyphicon glyphicon-print"></span></button></td>' +
               estado +
             '</tr>';
    }

    $('#tablaPedidos tbody').empty().append(row);
  });
}

function guardarFechaRuta(idPedidoPadre) {
  let pedidoPadreRef = db.ref('pedidoPadre/');
  let nuevaFechaRuta = $('#fechaRuta-'+idPedidoPadre).val();
  pedidoPadreRef.child(idPedidoPadre).update({
    fechaRuta: nuevaFechaRuta
  });
}

function guardarRuta(idPedidoPadre) {
  let pedidoPadreRef = db.ref('pedidoPadre/');
  let nuevaRuta = $('#ruta-'+idPedidoPadre).val();
  pedidoPadreRef.child(idPedidoPadre).update({
    ruta: nuevaRuta
  });
}

function mostrarPedidosEnProceso() {
  let pedidosPadreRef = db.ref('pedidoPadre');
  pedidosPadreRef.on('value', function(snapshot) {
    let pedidosPadre = snapshot.val();
    let row = "";
    $('#tablaPedidosEnProceso tbody').empty();
    for(pedidoPadre in pedidosPadre) {
      let tr = $('<tr/>');
      let td = $('<td/>');
      let div = $('<div/>', {'class': 'input-group date', 'style': 'width: 200px;'});
      let input = $('<input/>', {
        'class': 'form-control',
        'type': 'text',
        'placeholder': 'Fecha de ruta',
        'id': 'fechaRuta-'+pedidoPadre
      });

      //let div1 = '<div class="input-group-addon btn btn-primary"><span class="glyphicon glyphicon-calendar"></span></div>';

      let button = $('<button/>', {
        'class': 'btn btn-primary',
        'onclick': 'guardarFechaRuta("'+pedidoPadre+'")',
        'html': '<i class="fa fa-floppy-o" aria-hidden="true"></i>'
      });

      let td2 = $('<td/>');
      let div2 = $('<div/>', {'class': 'input-group', 'style': 'width: 200px;'});
      let input2 = $('<input/>', {
        'class': 'form-control',
        'type': 'text',
        'style': '',
        'placeholder': 'Ruta',
        'id': 'ruta-'+pedidoPadre
      });

      let span2 = $('<span/>', {'class': 'input-group-btn'});

      let button2 = $('<button/>', {
        'class': 'btn btn-primary',
        'onclick': 'guardarRuta("'+pedidoPadre+'")',
        'html': '<i class="fa fa-floppy-o" aria-hidden="true"></i>'
      });

      /*row += '<tr>' +
              '<td>' + pedidoPadre + '</td>' +
              '<td>' + pedidosPadre[pedidoPadre].fechaCreacionPadre + '</td>' +
              '<td>' + pedidosPadre[pedidoPadre].fechaRuta + '</td>' +
              '<td><input type="text" class="form-control" style="width: 100px; display:inline-block padding-right: 10px;" placeholder="Nueva fecha de ruta"><button class="btn btn-primary" type="button"><i class="fa fa-floppy-o" aria-hidden="true"></i></button></td>' +
              '<td>' + pedidosPadre[pedidoPadre].ruta + '</td>' +
              '<td></td>' +
             '</tr>';*/

      let diaCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(0,2);
      let mesCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(3,2);
      let añoCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(6,4);
      let fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
      moment.locale('es');
      let fechaCapturaMostrar = moment(fechaCaptura).format('DD MMMM YYYY');

      let fechaRutaMostrar;
      if(pedidosPadre[pedidoPadre].fechaRuta.length > 0) {
        let diaRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(0,2);
        let mesRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(3,2);
        let añoRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(6,4);
        let fechaRuta = mesRuta + '/' + diaRuta + '/' + añoRuta;

        fechaRutaMostrar = moment(fechaRuta).format('DD MMMM YYYY');
      } else {
        fechaRutaMostrar = "Fecha pendiente";
      }

      row = '<td>' + pedidoPadre + '</td>' +
            '<td>' + fechaCapturaMostrar + '</td>' +
            '<td>' + fechaRutaMostrar + '</td>';

      div.append(input);
      div.append('<span class="input-group-addon btn-primary"><i class="glyphicon glyphicon-calendar"></i></span>');
      td.append(div);
      td.append(button);
      tr.append(row);
      tr.append(td);
      tr.append('<td>' + pedidosPadre[pedidoPadre].ruta + '</td>');
      div2.append(input2);
      span2.append(button2);
      div2.append(span2);
      td2.append(div2);
      tr.append(td2);
      tr.append('<td><a class="btn btn-info" href="pedidoPadre.html?id='+pedidoPadre+'">Ver más</a></td>');

      $('#tablaPedidosEnProceso tbody').append(tr);

      $('.input-group.date').datepicker({
        format: "dd/mm/yyyy",
        startDate: "today",
        language: "es"
      });
    }
  });
}

dragula([document.getElementById('tbodyTablaPedidos'), document.getElementById('tbodyTablaPedidoPadre')]);

function generarPedidoPadre() {
  var pedidos = [], claves = [];
  var productosRepetidos = [], productosNoRepetidos = [];

  $("#tablaPedidoPadre tbody tr").each(function (i)
  {
    var clave;
    $(this).children("td").each(function (j)
    {
      if(j == 0) {
        if($(this).text().length > 0) {
          clave = $(this).text();
          claves.push(clave);
        }
      }
    });

    if($(this).attr('id') !="vacio"){
      let pedidoRef = db.ref('pedidoEntrada/'+clave);
      pedidoRef.once('value', function(snapshot) {
        let pedido = snapshot.val();
        pedidos.push(pedido);

        let detalle = pedido.detalle;
        for(let producto in detalle) {
          datosProducto = {
            clave: detalle[producto].clave,
            nombre: detalle[producto].nombre,
            degusPz: detalle[producto].degusPz,
            pedidoPz: detalle[producto].pedidoPz,
            totalKg: detalle[producto].totalKg,
            totalPz: detalle[producto].totalPz
          };

          productosRepetidos.push(datosProducto);
        }
      });
    }
  });

  for(let i in productosRepetidos) {
    if(productosNoRepetidos.length == 0) {
      productosNoRepetidos.push(productosRepetidos[i]);
    }
    else {
      let bandera = false;
      for(let j in productosNoRepetidos) {

        if(productosRepetidos[i].clave == productosNoRepetidos[j].clave) {
          bandera = true;

          let productoNoRepetido = productosNoRepetidos[j];
          let productoRepetido = productosRepetidos[i];

          productoNoRepetido.totalKg = productoNoRepetido.totalKg + productoRepetido.totalKg;
          productoNoRepetido.totalPz = productoNoRepetido.totalPz + productoRepetido.totalPz;
        }
      }
      if(bandera == false) {
        productosNoRepetidos.push(productosRepetidos[i]);
      }
    }
  }

  let fechaCreacionPadre = moment().format('DD/MM/YYYY');
  let pedidoPadreRef = db.ref('pedidoPadre/');
  let datosPedidoPadre = {
    fechaCreacionPadre: fechaCreacionPadre,
    fechaRuta: "",
    ruta: "",
    productos: productosNoRepetidos
  }
  let key = pedidoPadreRef.push(datosPedidoPadre).getKey();

  let pedidoPadreRefKey = db.ref('pedidoPadre/'+key+'/pedidosHijos');
  let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
  let pedidoEntradaRef = db.ref('pedidoEntrada');

  let datosPedidosHijos = {};
  for(let pedido in pedidos) {
    //pedidoPadreRefKey.push(pedidos[pedido]);
    datosPedidosHijos[claves[pedido]] = pedidos[pedido];
    console.log(claves[pedido]);
    pedidoEntradaRef.child(claves[pedido]).remove();
  }

  pedidoPadreRefKey.set(datosPedidosHijos);
  historialPedidosEntradaRef.push(datosPedidosHijos);

  let row = '<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">' +
              '<td scope="row" style="border:none;"></td>' +
              '<td></td>' +
              '<td></td>' +
              '<td></td>' +
              '<td class="no-padding"></td>' +
              '<td class="no-padding"> </td>' +
            '</tr>';
  $('#tbodyTablaPedidoPadre').empty().append(row);

  let notificacionesRef = db.ref('notificaciones/promotoras');
  let notificacion = {
    leida: false,
    mensaje: "Los siguientes pedidos: [] se han integrado en almacen."
  }

  notificacionesRef.push(notificacion);
}

function pedidosRecibidos() {
  $('#pedidosEnProceso').hide();
  $('#historialPedidos').hide();
  $('#pedidosRecibidos').show();

  mostrarPedidos();
}

function pedidosEnProceso() {
  $('#pedidosRecibidos').hide();
  $('#historialPedidos').hide();
  $('#pedidosEnProceso').show();

  mostrarPedidosEnProceso();
}

function historialPedidos() {
  $('#pedidosRecibidos').hide();
  $('#pedidosEnProceso').hide();
  $('#historialPedidos').show();
}
