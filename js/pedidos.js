const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}
 
function mostrarPedidosVerificados() {
	let tabla = $(`#tablaPedidosVerificados`).DataTable({
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "ordering": false
  });

	let rutaPedidosPadre = db.ref(`pedidoPadre`);
	rutaPedidosPadre.on('value', function(snapshot) {
		let pedidosPadre = snapshot.val();

		let filas = "";
		tabla.clear();
		for(let pedidoPadre in pedidosPadre) {
			let pedido = pedidosPadre[pedidoPadre];

			if(pedido.verificado) {
				let dia = pedido.fechaCreacionPadre.substr(0,2),
	        	mes = pedido.fechaCreacionPadre.substr(3,2),
	        	año = pedido.fechaCreacionPadre.substr(6,4),
	        	fechaCaptura = `${mes}/${dia}/${año}`;
	        	
	      moment.locale('es');
	      let fechaMostrar = moment(fechaCaptura).format('LL');

				filas += `<tr>
										<td>${pedido.clave}</td>
										<td>${fechaMostrar}</td>
										<td class="text-center"><a href="pedidoPadre.html?id=${pedidoPadre}" class="btn btn-default btn-sm" type="button"><i class="fa fa-eye" aria-hidden="true"></i> Ver más</a></td>
									</tr>`;
			}
		}
		tabla.rows.add($(filas)).columns.adjust().draw();
	});
}

function mostrarPedidosFinalizados() {
	let tabla = $(`#tablaPedidosFinalizados`).DataTable({
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "ordering": false
  });

	let rutaPedidosPadre = db.ref(`pedidoPadre`);
	rutaPedidosPadre.on('value', function(snapshot) {
		let pedidosPadre = snapshot.val();

		let filas = "";
		tabla.clear();
		for(let pedidoPadre in pedidosPadre) {
			let pedido = pedidosPadre[pedidoPadre];
			
			if(pedido.estado == "Finalizado") {
				let dia = pedido.fechaCreacionPadre.substr(0,2),
	        	mes = pedido.fechaCreacionPadre.substr(3,2),
	        	año = pedido.fechaCreacionPadre.substr(6,4),
	        	fechaCaptura = `${mes}/${dia}/${año}`;
	        	
	      moment.locale('es');
	      let fechaMostrar = moment(fechaCaptura).format('LL');

				filas += `<tr>
										<td>${pedido.clave}</td>
										<td>${fechaMostrar}</td>
										<td class="text-center"><a class="btn btn-default btn-sm" href="pedidoPadre.html?id=${pedidoPadre}"><span class="glyphicon glyphicon-eye-open"></span> Ver más</a></td>
									</tr>`;
			}
		}
		tabla.rows.add($(filas)).columns.adjust().draw();
	});
}

$('#tabPedidosVerificados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

$('#tabPedidosFinalizados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

function haySesion() {
  auth.onAuthStateChanged(function (user) {
	//si hay un usuario
	if (user) {
	  mostrarContador();
	  mostrarPedidosVerificados();
	  mostrarPedidosFinalizados();
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
});