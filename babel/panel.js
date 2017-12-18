"use strict";

var config = {
  apiKey: "AIzaSyA19j6-VLNcXLJfBkfd_lZfFFbzg6z0Imc",
  authDomain: "xico-netcontrol.firebaseapp.com",
  databaseURL: "https://xico-netcontrol.firebaseio.com",
  projectId: "xico-netcontrol",
  storageBucket: "xico-netcontrol.appspot.com",
  messagingSenderId: "248615705793"
};
firebase.initializeApp(config);

var db = firebase.database();
var auth = firebase.auth();

function logout() {
  auth.signOut();
}

function llenarSugerenciasProductos() {
  var formulasRef = db.ref("formulaciones");
  formulasRef.on('value', function (snap) {
    var productos = snap.val();
    var options = "";
    for (var producto in productos) {
      options += "<option value=\"" + producto + "\">";
    }
    $('#sugerenciasProductos').html(options);
  });
}

function obtenerClaveBatida() {
  var rutaBatidas = db.ref('batidas');
  rutaBatidas.on('value', function (snapshot) {
    if (snapshot.hasChildren()) {

      var listabatidas = snapshot.val();

      var keys = Object.keys(listabatidas);
      var last = keys[keys.length - 1];
      var ultimaBatida = listabatidas[last];
      var lastClave = Number(ultimaBatida.claveBatida);
      $('#clave').val(lastClave + 1);
    } else {
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

$('#cbAgregarSustitutos').on('switchChange.bootstrapSwitch', function (event, state) {
  if (state) {
    $('#collapseSustitutos').collapse('show');
  } else {
    $('#collapseSustitutos').collapse('hide');
  }
});

$('#claveProducto').keypress(function (e) {
  if (e.which == 13) {
    var claveProducto = $(this).val().toUpperCase();

    if (claveProducto.length > 0) {
      var rutaFormulaciones = db.ref("formulaciones/" + claveProducto);
      rutaFormulaciones.once('value', function (snapshot) {
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
        } else {
          $.toaster({ priority: 'danger', title: 'Error', message: "El producto con la clave " + claveProducto + " no existe" });
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
    } else {
      $(this).parent().addClass('has-error');
      $('#helpBlockProducto').removeClass('hidden');
    }
  }
});

$('#btnGenerarFormula').click(function () {
  var numBatidas = Number($('#numBatidas').val());
  if (numBatidas > 0) {
    $('#numBatidas').parent().parent().removeClass('has-error');
    $('#helpBlockNumBatidas').addClass('hidden');

    obtenerFormulaBase();
    calcularKilos();
    mostrarSustitutos();
  } else {
    $('#numBatidas').parent().parent().addClass('has-error');
    $('#helpBlockNumBatidas').removeClass('hidden');
    $('#tabla-subProductos tbody').html('');
    $('#tabla-sustitutos tbody').html('');
    $('#kilosProduccion').val('');
    $('#cbAgregarSustitutos').bootstrapSwitch('state', false);
    $('#cbAgregarSustitutos').bootstrapSwitch('readonly', true, true);
  }
});

$("#numBatidas").keyup(function () {
  var numBatidas = $(this).val();
  if (numBatidas.length > 0) {
    $('#btnGenerarFormula').attr('disabled', false);
  } else {
    $('#btnGenerarFormula').attr('disabled', true);
  }
});

function calcularKilos() {
  var claveProducto = $('#claveProducto').val().toUpperCase();

  var rutaFormula = db.ref("formulaciones/" + claveProducto);
  rutaFormula.once('value', function (snap) {
    if (snap.hasChildren()) {
      var kilosProduccion = snap.val().kilosProduccion;
      var numBatidas = $('#numBatidas').val();

      $('#kilosProduccion').val((kilosProduccion * numBatidas).toFixed(4));
    }
  });
}

function obtenerFormulaBase() {
  var tabla = $("#tabla-subProductos").DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "searching": false,
    "paging": false,
    "bInfo": false
  });

  var claveProducto = $('#claveProducto').val().toUpperCase();
  var numBatidas = $('#numBatidas').val();
  var rutaFormulaciones = db.ref("formulaciones/" + claveProducto + "/subProductos");
  rutaFormulaciones.once('value', function (snapshot) {
    if (snapshot.hasChildren()) {
      var subProductos = snapshot.val();
      tabla.clear();
      var filas = "";
      var i = 0;
      for (var subProducto in subProductos) {
        if (i % 2 == 0) {
          filas += "<tr id=\"fila-" + subProducto + "\" class=\"info\">\n                      <td>" + subProducto + "</td>\n                      <td>" + subProductos[subProducto].nombre + "</td>\n                      <td>" + subProductos[subProducto].valorConstante + "</td>\n                      <td>" + (subProductos[subProducto].valorConstante * numBatidas).toFixed(4) + "</td>\n                    </tr>";
          //<td class="text-center"><button onclick="quitarSubProducto('fila-${subProducto}')" type="button" class="btn btn-danger btn-sm"><i class="fa fa-times"></i></button></td>
        } else {
          filas += "<tr id=\"fila-" + subProducto + "\" >\n                      <td>" + subProducto + "</td>\n                      <td>" + subProductos[subProducto].nombre + "</td>\n                      <td>" + subProductos[subProducto].valorConstante + "</td>\n                      <td>" + (subProductos[subProducto].valorConstante * numBatidas).toFixed(4) + "</td>\n                    </tr>";
          //<td class="text-center"><button onclick="quitarSubProducto('fila-${subProducto}')" type="button" class="btn btn-danger btn-sm"><i class="fa fa-times"></i></button></td>
        }
        i++;
      }
      //$('#tabla-subProductos tbody').html(filas);
      tabla.rows.add($(filas)).columns.adjust().draw();
    } else {
      $.toaster({ priority: 'danger', title: 'Error', message: "El producto con la clave " + claveProducto + " no existe" });
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

  var claveProducto = $('#claveProducto').val().toUpperCase();
  var numBatidas = $('#numBatidas').val();
  var rutaFormulaciones = db.ref("formulaciones/" + claveProducto + "/subProductos");
  rutaFormulaciones.on('value', function (snapshot) {
    var subProductos = snapshot.val();
    // tabla.clear();
    var filas = "";
    var i = 0;

    for (var subProducto in subProductos) {
      if (subProductos[subProducto].sustitutos != undefined) {
        var sustitutos = subProductos[subProducto].sustitutos;

        for (var sustituto in sustitutos) {
          if (i % 2 == 0) {
            filas += "<tr id=\"fila-" + subProducto + "\" class=\"info\" data-claveSubProducto=\"" + subProducto + "\">\n                        <td>" + sustituto + "</td>\n                        <td>" + sustitutos[sustituto].nombre + "</td>\n                        <td>" + sustitutos[sustituto].valorConstante + "</td>\n                        <td>" + (sustitutos[sustituto].valorConstante * numBatidas).toFixed(4) + "</td>\n                        <td class=\"text-center\"><input id=\"cb-" + sustituto + "\" class=\"toggle-checkbox\" type=\"checkbox\" data-size=\"mini\" data-on-color=\"success\" data-off-color=\"danger\" data-on-text=\"S\xED\" data-off-text=\"No\"/></td>\n                      </tr>";
          } else {
            filas += "<tr id=\"fila-" + subProducto + "\" data-claveSubProducto=\"" + subProducto + "\">\n                        <td>" + sustituto + "</td>\n                        <td>" + sustitutos[sustituto].nombre + "</td>\n                        <td>" + sustitutos[sustituto].valorConstante + "</td>\n                        <td>" + (sustitutos[sustituto].valorConstante * numBatidas).toFixed(4) + "</td>\n                        <td class=\"text-center\"><input id=\"cb-" + sustituto + "\" class=\"toggle-checkbox\" type=\"checkbox\" data-size=\"mini\" data-on-color=\"success\" data-off-color=\"danger\" data-on-text=\"S\xED\" data-off-text=\"No\"/></td>\n                      </tr>";
          }
          i++;
        }
      }
    }
    $('#tabla-sustitutos tbody').html(filas);
    // tabla.rows.add($(filas)).columns.adjust().draw();
    $('.toggle-checkbox').bootstrapSwitch();
  });
}

function quitarSubProducto(idFila) {
  $("#" + idFila).remove();
}

function guardarBatida() {
  var seUsaronSustitutos = $('#cbAgregarSustitutos').bootstrapSwitch('state');
  if (seUsaronSustitutos) {
    var numBatidas = Number($('#numBatidas').val());
    var clave = Number($('#clave').val());
    var fechaString = $('#fecha').val();
    var date = fechaString.split("-");
    var dia = date[2];
    var mes = date[1];
    var año = date[0];
    var dateObj = new Date(mes + "/" + dia + "/" + año);
    var fechaCaptura = moment(dateObj).format('DD/MM/YYYY');
    var claveProducto = $('#claveProducto').val().toUpperCase();
    var nombreProducto = $('#nombreProducto').val();
    var kilosProduccion = Number($('#kilosProduccion').val());

    var listaSubProductos = [],
        listaClaves = [];
    var claveSubProducto = void 0,
        nombreSubProducto = void 0,
        valorConstante = void 0;
    var claveBorrar = void 0,
        claveSustituto = void 0,
        nombreSustituto = void 0,
        valorConstanteSustituto = void 0,
        checkbox = void 0;

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

      var datos = {
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
            checkbox = $("cb-" + claveSustituto).bootstrapSwitch('state');
            break;
        }
      });

      if (checkbox) {
        var posicion = listaClaves.indexOf(claveBorrar);
        listaSubProductos.splice(posicion, 1);
        listaClaves.splice(posicion, 1);
        var datosSustituto = {
          nombre: nombreSustituto,
          valorConstante: valorConstanteSustituto
        };

        listaSubProductos.push(datosSustituto);
        listaClaves.push(claveSustituto);
      }
    });

    var rutaBatidas = db.ref('batidas');

    var batida = {
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

    var keyBatida = rutaBatidas.push(batida).getKey();

    for (var i in listaSubProductos) {
      var rutaBatida = db.ref("batidas/" + keyBatida + "/subProductos/" + listaClaves[i]);
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
  } else {
    var _numBatidas = Number($('#numBatidas').val());
    var _clave = Number($('#clave').val());
    var _fechaCaptura = moment().format('DD/MM/YYYY');
    var _claveProducto = $('#claveProducto').val().toUpperCase();
    var _nombreProducto = $('#nombreProducto').val();
    var _kilosProduccion = Number($('#kilosProduccion').val());

    var _listaSubProductos = [],
        _listaClaves = [];
    var _claveSubProducto = void 0,
        _nombreSubProducto = void 0,
        _valorConstante = void 0;

    $("#tabla-subProductos tbody tr").each(function (i) {
      $(this).children("td").each(function (j) {
        switch (j) {
          case 0:
            _claveSubProducto = $(this).text();
            break;
          case 1:
            _nombreSubProducto = $(this).text();
            break;
          case 3:
            _valorConstante = $(this).text();
            break;
        }
      });

      var datos = {
        nombre: _nombreSubProducto,
        valorConstante: _valorConstante
      };

      _listaSubProductos.push(datos);
      _listaClaves.push(_claveSubProducto);
    });

    var _rutaBatidas = db.ref('batidas');

    var _batida = {
      numBatidas: _numBatidas,
      claveBatida: _clave,
      fechaCaptura: _fechaCaptura,
      claveProducto: _claveProducto,
      nombreProducto: _nombreProducto,
      kilosProduccion: _kilosProduccion,
      kilos: 0,
      piezas: 0,
      costo: 0,
      estado: "En proceso"
    };

    var _keyBatida = _rutaBatidas.push(_batida).getKey();

    for (var _i in _listaSubProductos) {
      var _rutaBatida = db.ref("batidas/" + _keyBatida + "/subProductos/" + _listaClaves[_i]);
      _rutaBatida.set(_listaSubProductos[_i]);
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
  var tabla = $("#tabla-batidasRegistradas").DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "500px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "searching": false,
    "paging": false,
    "bInfo": false
  });
  var rutaBatidas = db.ref('batidas');
  rutaBatidas.orderByChild("estado").equalTo("En proceso").on('value', function (snap) {
    var batidas = snap.val();
    var filas = "";
    tabla.clear();
    var i = 0;

    for (var batida in batidas) {
      if (i % 2 == 0) {
        filas += "<tr class=\"info\">\n                    <td>" + batidas[batida].claveBatida + "</td>\n                    <td>" + batidas[batida].claveProducto + "</td>\n                    <td>" + batidas[batida].nombreProducto + "</td>\n                    <td>" + batidas[batida].numBatidas + "</td>\n                    <td>" + batidas[batida].fechaCaptura + "</td>\n                    <td class=\"text-center\"><button onclick=\"abrirModalEditar('" + batida + "')\" class=\"btn btn-warning btn-sm\"><i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i></button></td>\n                    <td class=\"text-center\"><button onclick=\"abrirModalFinalizar('" + batida + "')\" class=\"btn btn-success btn-sm\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></button></td>\n                  </tr>";
      } else {
        filas += "<tr>\n                    <td>" + batidas[batida].claveBatida + "</td>\n                    <td>" + batidas[batida].claveProducto + "</td>\n                    <td>" + batidas[batida].nombreProducto + "</td>\n                    <td>" + batidas[batida].numBatidas + "</td>\n                    <td>" + batidas[batida].fechaCaptura + "</td>\n                    <td class=\"text-center\"><button onclick=\"abrirModalEditar('" + batida + "')\" class=\"btn btn-warning btn-sm\"><i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i></button></td>\n                    <td class=\"text-center\"><button onclick=\"abrirModalFinalizar('" + batida + "')\" class=\"btn btn-success btn-sm\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></button></td>\n                  </tr>";
      }
      i++;
    }
    // $('#loader1').remove();
    // $('#tabla-batidasRegistradas tbody').html(filas)
    // $('#tabla-batidasRegistradas').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function abrirModalEditar(idBatida) {
  $('#modalEditar').modal('show');
  $('#kilos').attr('data-idBatida', idBatida);
  mostrarDatosBatida(idBatida);
  $('#btnGuardarCambios').attr('onclick', "guardarCambiosBatida('" + idBatida + "')");
}

function mostrarDatosBatida(idBatida) {
  var tabla = $("#tablaModalEditar").DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "paging": false,
    "bInfo": false
  });

  var rutaSubProductos = db.ref("batidas/" + idBatida);
  rutaSubProductos.on('value', function (snap) {
    var kilos = snap.val().kilos;
    var piezas = snap.val().piezas;
    var merma = snap.val().merma;
    var comentarios = snap.val().comentarios;
    if (kilos != undefined && piezas != undefined && merma != undefined && comentarios != undefined) {
      $('#kilos').val(kilos);
      $('#piezas').val(piezas);
      $('#merma').val(merma);
      $('#comentarios').val(comentarios);
    } else {
      $('#kilos').val("");
      $('#piezas').val("");
      $('#merma').val("");
      $('#comentarios').val("");
    }
    var subProductos = snap.val().subProductos;
    var filas = "";
    tabla.clear();
    var i = 0;

    for (var subProducto in subProductos) {
      if (i % 2 == 0) {
        filas += "<tr class=\"info\">\n                    <td>" + subProducto + "</td>\n                    <td>" + subProductos[subProducto].nombre + "</td>\n                    <td class=\"text-center\"><input class=\"form-control input-sm\" value=\"" + subProductos[subProducto].valorConstante + "\"></td>\n                    <td class=\"hidden\">" + subProductos[subProducto].precio + "</td>\n                  </tr>";
      } else {
        filas += "<tr>\n                    <td>" + subProducto + "</td>\n                    <td>" + subProductos[subProducto].nombre + "</td>\n                    <td class=\"text-center\"><input class=\"form-control input-sm\" value=\"" + subProductos[subProducto].valorConstante + "\"></td>\n                    <td class=\"hidden\">" + subProductos[subProducto].precio + "</td>\n                  </tr>";
      }
      i++;
    }
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

$('#modalEditar').on('shown.bs.modal', function () {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
});

$('#modalVerDetalles').on('shown.bs.modal', function () {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
});

function verDetalles(idBatida) {
  var tabla = $("#tablaModalVer").DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "200px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "paging": false,
    "bInfo": false
  });

  var rutaSubProductos = db.ref("batidas/" + idBatida);
  rutaSubProductos.on('value', function (snap) {
    var kilos = snap.val().kilos;
    var piezas = snap.val().piezas;
    var merma = snap.val().merma;
    var comentarios = snap.val().comentarios;

    $('#kilosVer').val(kilos);
    $('#piezasVer').val(piezas);
    $('#mermaVer').val(merma);
    $('#comentariosVer').val(comentarios);

    var subProductos = snap.val().subProductos;
    var filas = "";
    tabla.clear();
    var i = 0;

    for (var subProducto in subProductos) {
      if (i % 2 == 0) {
        filas += "<tr class=\"info\">\n                    <td>" + subProducto + "</td>\n                    <td>" + subProductos[subProducto].nombre + "</td>\n                    <td class=\"text-right\">" + subProductos[subProducto].valorConstante + "</td>\n                  </tr>";
      } else {
        filas += "<tr>\n                    <td>" + subProducto + "</td>\n                    <td>" + subProductos[subProducto].nombre + "</td>\n                    <td class=\"text-right\">" + subProductos[subProducto].valorConstante + "</td>\n                  </tr>";
      }
      i++;
    }
    tabla.rows.add($(filas)).columns.adjust().draw();
  });

  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
}

function guardarCambiosBatida(idBatida) {
  var kilos = $('#kilos').val();
  var piezas = $('#piezas').val();
  var merma = $('#merma').val();
  var comentarios = $('#comentarios').val();

  if (kilos.length > 0 && piezas.length > 0) {
    (function () {
      var listaValoresConstantes = [],
          listaClaves = [];
      var claveSubProducto = void 0,
          valorConstante = void 0,
          precio = void 0,
          costo = 0;

      $("#tablaModalEditar tbody tr").each(function (i) {
        $(this).children("td").each(function (j) {
          if (j == 0) {
            claveSubProducto = $(this).text();
          }
          if (j == 2) {
            valorConstante = $(this).children().val();
          }
          /*if(j==3) {
            precio = Number($(this).text());
          }*/
        });

        listaClaves.push(claveSubProducto);
        listaValoresConstantes.push(valorConstante);
        //costo += precio;
      });

      var rutaBatida = db.ref("batidas/" + idBatida);
      rutaBatida.update({
        kilos: Number(kilos),
        piezas: Number(piezas),
        merma: Number(merma),
        comentarios: comentarios
      });

      var _loop = function _loop(i) {
        var ruta = db.ref("batidas/" + idBatida + "/subProductos/" + listaClaves[i]);
        ruta.update({
          valorConstante: Number(listaValoresConstantes[i])
        });
        var rutaSubProducto = db.ref("subProductos/" + listaClaves[i]);
        rutaSubProducto.once('value', function (snap) {
          var precio = snap.val().precioPesos;
          costo += precio * Number(listaValoresConstantes[i]);

          if (i == listaClaves.length - 1) {
            costo = (costo / kilos).toFixed(4);

            rutaBatida.update({ costo: Number(costo) });
          }
        });
      };

      for (var i in listaClaves) {
        _loop(i);
      }
      $.toaster({ priority: 'info', title: 'Info:', message: "Se actualiz\xF3 la batida correctamente" });
      $('#modalEditar').modal('hide');
    })();
  } else {
    if (kilos.length < 1) {
      $('#kilos').parent().addClass('has-error');
      $('#helpBlockKilos').removeClass('hidden');
    } else {
      $('#kilos').parent().removeClass('has-error');
      $('#helpBlockKilos').addClass('hidden');
    }
    if (piezas.length < 1) {
      $('#piezas').parent().addClass('has-error');
      $('#helpBlockPiezas').removeClass('hidden');
    } else {
      $('#piezas').parent().removeClass('has-error');
      $('#helpBlockPiezas').addClass('hidden');
    }
  }
}

$('#kilos').keyup(function () {
  var kilos = $(this).val();

  if (kilos.length < 1) {
    $('#kilos').parent().addClass('has-error');
    $('#helpBlockKilos').removeClass('hidden');

    $('#merma').val('');
  } else {
    var idBatida = $(this).attr('data-idBatida');
    var rutaBatida = db.ref("batidas/" + idBatida);
    rutaBatida.once('value', function (snap) {
      var kilosProduccion = snap.val().kilosProduccion;
      var merma = (kilosProduccion - kilos) / kilosProduccion * 100;
      $('#merma').val(merma.toFixed(4));

      if (merma > 4) {
        $('#merma').parent().parent().removeClass('has-success');
        $('#merma').parent().parent().addClass('has-error');
      } else {
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

$('#piezas').keyup(function () {
  var piezas = $(this).val();

  if (piezas.length < 1) {
    $('#piezas').parent().addClass('has-error');
    $('#helpBlockPiezas').removeClass('hidden');
  } else {
    $('#piezas').parent().removeClass('has-error');
    $('#helpBlockPiezas').addClass('hidden');
  }
});

function actualizarProductoDashboard(idBatida) {
  var ruta = db.ref("batidas/" + idBatida);

  ruta.once('value', function (snapshot) {
    var claveProducto = snapshot.val().claveProducto;
    var nombreProducto = snapshot.val().nombreProducto;
    var costo = snapshot.val().costo;
    var kilos = snapshot.val().kilos;
    var merma = snapshot.val().merma;
    var piezas = snapshot.val().piezas;
    var kilosProduccion = snapshot.val().kilosProduccion;
    var subProductos = snapshot.val().subProductos;
    var fechaCaptura = snapshot.val().fechaCaptura;
    var fechaFinalizada = snapshot.val().fechaFinalizada;

    var costosProduccion = db.ref("costosProduccion/" + claveProducto);
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
  var rutaBatida = db.ref("batidas/" + idBatida);
  var fechaFinalizada = moment().format('DD/MM/YYYY');

  rutaBatida.update({
    estado: "Finalizada",
    fechaFinalizada: fechaFinalizada
  });

  actualizarProductoDashboard(idBatida);

  $('#modalFinalizar').modal('hide');
}

function abrirModalFinalizar(idBatida) {
  $('#modalFinalizar').modal('show');
  $('#btnFinalizar').attr('onclick', "finalizarBatida('" + idBatida + "')");
}

function mostrarBatidasFinalizadas() {
  var tabla = $("#tabla-batidasFinalizadas").DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "500px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
      //"searching": false
      //"paging": false,
      //"bInfo" : false
    } });
  var rutaBatidas = db.ref('batidas');
  rutaBatidas.orderByChild("estado").equalTo("Finalizada").on('value', function (snapshot) {
    var batidasFinalizadas = snapshot.val();
    var filas = "";
    tabla.clear();
    var i = 0;
    for (var batida in batidasFinalizadas) {
      if (i % 2 == 0) {
        filas += "<tr class=\"info\">\n                    <td>" + batidasFinalizadas[batida].claveBatida + "</td>\n                    <td>" + batidasFinalizadas[batida].claveProducto + "</td>\n                    <td>" + batidasFinalizadas[batida].nombreProducto + "</td>\n                    <td>" + batidasFinalizadas[batida].numBatidas + "</td>\n                    <td>" + batidasFinalizadas[batida].fechaCaptura + "</td>\n                    <td>" + batidasFinalizadas[batida].fechaFinalizada + "</td>\n                    <td class=\"text-center\"><button type=\"button\" onclick=\"abrirModalVerDetalles('" + batida + "')\" class=\"btn btn-default btn-xs\" data-toggle=\"tooltip\" data-placement=\"right\" title=\"Ver m\xE1s\"><i class=\"glyphicon glyphicon-eye-open\"></i></button></td>\n                  </tr>";
      } else {
        filas += "<tr>\n                  <td>" + batidasFinalizadas[batida].claveBatida + "</td>\n                  <td>" + batidasFinalizadas[batida].claveProducto + "</td>\n                  <td>" + batidasFinalizadas[batida].nombreProducto + "</td>\n                  <td>" + batidasFinalizadas[batida].numBatidas + "</td>\n                  <td>" + batidasFinalizadas[batida].fechaCaptura + "</td>\n                  <td>" + batidasFinalizadas[batida].fechaFinalizada + "</td>\n                  <td class=\"text-center\"><button type=\"button\" onclick=\"abrirModalVerDetalles('" + batida + "')\" class=\"btn btn-default btn-xs\" data-toggle=\"tooltip\" data-placement=\"right\" title=\"Ver m\xE1s\"><i class=\"glyphicon glyphicon-eye-open\"></i></button></td>\n                </tr>";
      }
      i++;
    }

    // $('#loader2').remove();
    // $('#tabla-batidasFinalizadas tbody').html(filas);
    // $('#tabla-batidasFinalizadas').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
    $('[data-toggle="tooltip"]').tooltip();
  });
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarNotificaciones() {
  var usuario = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + usuario + '/lista');
  notificacionesRef.on('value', function (snapshot) {
    var lista = snapshot.val();
    var lis = "";

    var arrayNotificaciones = [];
    for (var notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for (var i in arrayNotificaciones) {
      var date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      var fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>' + '<a>' + '<div>' + '<i class="fa fa-comment fa-fw"></i> ' + arrayNotificaciones[i].mensaje + '<span class="pull-right text-muted small">' + fecha + '</span>' + '</div>' + '</a>' + '</li>';
    }

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
  });
}

function mostrarContador() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.on('value', function (snapshot) {
    var cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    } else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

$(document).ready(function () {
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
});