function guardarPedido(){
	var fechaCaptura = $('#fechaCaptura').val();
	var fechaRuta = $('#fechaRuta').val();
	var ruta = $('#ruta').val();
	var tienda = $('#tienda').val();

	var claveProducto = $('#claveProducto').val();
	var nombreProducto = $('#nombreProducto').val();
	var pedidoPz = $('#pedidoPz').val();
	var degusPz = $('#degusPz').val();
	var totalPz = $('#totalPz').val();
	var totalKg = $('#totalKg').val();




	var db = firebase.database().ref('pedidoEntrada/');
	var key = db.push().getKey();

	var Pedido = {
		fechaCaptura: fechaCaptura,
		fechaRuta: fechaRuta,
		ruta: ruta,
		tienda: tienda
	};

	var Detalle = {
		claveProducto: claveProducto,
		nombreProducto: nombreProducto,
		pedidoPz: pedidoPz,
		degusPz: degusPz,
		totalPz: totalPz,
		totalKg: totalKg
	};

	var misPedidos = firebase.database().ref('pedidoEntrada/'+key+'/encabezado/');
	misPedidos.set(Pedido);
	var miDetalle = firebase.database().ref('pedidoEntrada/'+key+'/detalle/');
	miDetalle.push(Detalle);
	/*var keyDetalle = miDetalle.push().getKey();	
	var detalle = firebase.database().ref('pedidoEntrada/'+key+'/detalle/'+keyDetalle+'/');
	detalle.set(Detalle);*/
	console.log(Pedido);
	console.log(Detalle);
	//alert(JSON.stringify(Pedido));


}

