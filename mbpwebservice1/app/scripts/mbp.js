﻿var Partidas = new Array();
var total = 0.0;
var claveadd_id = 0;
var db;
var request;
var currentProd;
var _prodId_ = 0;

function sellsingle() {

    

    $('sendButton').text('Sending request');
    var prodId   = $('#prodtb').val();
    var clientid = $('#clienttb').val();

    var queryString =
        endpoint + '/sellsingle.ashx?prod=' + prodId + '&client=' + clientid + '&format=json';

    $.getJSON(queryString, function (results) {
        showSellSingleResults(results);
    }
    ).fail(function (jqXHR) {
        setStatLabel("danger", "Un error ocurrió")
    })

return false;

}

function showSellSingleResults(results) {
    var vta = results.VENTA;
    $("#statuslabel").removeAttr ("class");
    $('#statuslabel').text('Venta ' + vta + ' hecha');
}


/* Search product======================================================================= /*


/* Step one: On seachProd click */
function populateSearch() {
    
    var endpoint = localStorage.getItem("endpoint");
    var term = $('#searchProdText').val(); 
    
    if (term.length > 0) {
        var url = 
        endpoint + '/search.ashx?q=contains&c=' + term; 
        
        $('#prodSearch ul').empty();
    
        $.getJSON(url, function (results) {
            for (i = 0; i < results.length; i++) { 
                addToProdList(results[i]);
            }
        }
        ).fail(function (jqXHR) {
            setStatLabel("danger", "Un error ocurrió")
        });
        
    }else{
        setStatLabel("warning", 'Escribe un articulo para buscar')
    }
        
 
} 

/* Step 2, add to html, set state. */

function addToProdList(item)
{
    var id = getProdId();
         
    var content = $('<div></div>').html(item.DESCRIP);
          
    var li = $('<li></li>').attr("id", id).attr("class", "list-group-item").html(content).click(function(){
        //Deselecciona las lineas de abajo para agregar el articulo directamente
        //window.alert(item.PRECIO);
        $('#prodtb').val(item.ARTICULO);
        $('#pricetb').val(item.PRECIO); 
         
        $('#p1button').html(item.PRECIO1);
        $("#p1button").unbind('click').click(function(){
            $('#pricetb').val(item.PRECIO1);
        }) 
         
        $('#p2button').html(item.PRECIO2);
        $("#p2button").unbind('click').click(function(){
            $('#pricetb').val(item.PRECIO2);
        }) 
         
        $('#p3button').html(item.PRECIO3);
        $("#p3button").unbind('click').click(function(){
            $('#pricetb').val(item.PRECIO3);
        })
        
        setStatLabel("info", item.DESCRIP); 
        currentProd = item;
         
        saveState();
         
        $('#searchProdModal').modal('hide'); 
         
        // Selecciona la linea de abajo para agregar el articulo directamente
        //selectclaveadd2(item.ARTICULO);
    })
      
    console.log(id + ";");
    $('#prodSearch ul').append(li);
   

       
}

function searchClient(){
    var endpoint = localStorage.getItem("endpoint");
    var term = $('#searchClientText').val(); 
    
    if (term.length > 0)
    {
        var url = 
        endpoint + '/searchclient.ashx?c=' + term;
        
        $('#clientSearch ul').empty(); 
     
        $.getJSON(url, function (results) {
            for (i = 0; i < results.length; i++) { 
            addToClientList(results[i]);
            }
        }
        ).fail(function (jqXHR) {
            setStatLabel("danger", 'Un error ocurrió');
        });
    }else{
       setStatLabel("warning", 'Escribe un cliente para buscar');
    }
     
} 

function addToClientList(result){
    $('#clientSearch ul').append(
         '<li class="list-group-item" id="' +
          result.cliente +  '">' +
          result.nombre + '</li>');
      
    
     
     $(document).on('click', '#' + result.cliente, 
     function(){
         saveState();
         $('#clienttb').val(result.cliente); 
         $('#searchClientModal').modal('hide');
     } );
}



function addProd(results) {
    var endpoint = localStorage.getItem("endpoint");

    var prodId = $('#prodtb').val();

    var queryString = endpoint +  '/prods.ashx?single=true&p=' + prodId;

    var prod = $.getJSON(queryString, function (results) {
        // edit here, result will be an array with multiple product presentations
        instanceProd(results);
    }).fail(function (jqXHR) {
        setStatLabel("danger", "algo fallo :()")
    });


} 

function instanceProd(results) {
    //var price = results.ARTICULO.PRECIO1;
    var price = parseFloat($('#pricetb').val());
    var qty = parseFloat($('#qtytb').val());
    //window.alert(price);
    //if (results.clavesadd.length > 0)
    //{
    //    selectclaveadd(results.clavesadd, results.ARTICULO);
    //}else{
        var newP = {
        Precio: price * qty,
        Cantidad: qty,
        Impuesto: 0,
        Costo: results.ARTICULO.COSTO,
        Descrip: results.ARTICULO.DESCRIP,
        Articulo: results.ARTICULO.ARTICULO, 
        Unique: results.ARTICULO.U
    };
    Partidas.push(newP);
    
    total = total + newP.Precio;

    $("#statuslabel").removeAttr ("class"                                                            );
    $('#statuslabel').addClass   ("alert alert alert-success"                                        );
    $('#statuslabel').text       ('Articulo agregado, total: ' + total                               );
    //$('#prods ul'   ).append     ('<li class="list-group-item">' + results.ARTICULO.DESCRIP + '</li>' );
    
    console.log(JSON.stringify(newP));
    
    var li = $('<li class="list-group-item"></li>').attr("id", results.ARTICULO.U)
    var content = $('<div></div>').html(results.ARTICULO.DESCRIP); 
    
    li.append(content); 
    
    li.click(function(){
        var i = Partidas.length - 1;
        var p = Partidas[i]; 
        
        window.alert(p.Descrip);
        
        $('#tituloPartida').html(p.Descrip);
        
        setNewQty(i, p)
        
        $('#editPartidaModal').modal("show");
        
        //window.alert(p.Articulo); 
    }); 
    
    $('#prods ul').append(li); 
    
    saveState();
    
    //}
}

function setNewQty(partida, data){
    $('#savePartidaButton').unbind('click').click(function(){
        var qty = parseFloat(
            $('#modifyQtyTb').val()
        ); 
        
        Partidas[partida].Cantidad = qty;
        
         $('#' + data.Unique).attr("style", "color:blue;");
        
    });
}

function statCheck2(){
    //window.alert("intentando conexión")
    setStatLabel("info", "intentando conexion");
    
    
    var endpoint = localStorage.getItem("endpoint"); 
    
    var url = endpoint + '/dbstatus.ashx'; 
    
    var stat = $.getJSON(url, function(result){
        if (result.exists == true){
            
            $('#addButton'         ).unbind('click').click(addProd          );    // Add prod to prods to be sent
            $('#terminateButton'   ).unbind('click').click(terminateSell    );    // terminate sell on click
            $('#searchProdButton'  ).unbind('click').click(populateSearch   );    // On search prod click
            $('#validateProdButton').unbind('click').click(validateProd     );    // On validate product button click
            
            setStatLabel("success", "Sistema cargado y listo");
        }else{
            setStatLabel("danger", "No se pudo conectar a la base de datos");
        }
    }).error(function(jqXHR, textStatus, errorThrown){
        $('#addButton'         ).unbind('click').click(addProdOffline       );    // Add prod to prods to be sent
        $('#terminateButton'   ).unbind('click').click(insertPendingSell    );
        $('#searchProdButton'  ).unbind('click').click(searchProdOffline    );
        $('#validateProdButton').unbind('click').click(validateProdOffline  );   // On validate product click
        
        setStatLabel("danger", "No se pudo conectar al servidor: " + textStatus);
    });
}

function instanceProd2(results){
    var price = results.ARTICULO.PRECIO1;
    
    var newP = {
        Precio: price,
        Cantidad: 1,
        Impuesto: 0,
        Costo: results.ARTICULO.COSTO,
        Articulo: results.ARTICULO.ARTICULO, 
        Unique: results.ARTICULO.U}
        
        Partidas.push(newP);
    
        total = total + newP.Precio;

        $("#statuslabel").removeAttr ("class"                                                            );
        $('#statuslabel').addClass   ("alert alert alert-success"                                        );
        $('#statuslabel').text       ('Articulo agregado, total: ' + total                               );
        $('#prods ul'   ).append     ('<li class="list-group-item">' + results.ARTICULO.DESCRIP + '</li>' );
        
        saveState();
}

 

function selectclaveadd2(art){
    // url del articulo 
        var endpoint = localStorage.getItem("endpoint"); 
        var url = endpoint +  '/prods.ashx?single=true&p=' + art;
    
    
        $.getJSON(url, function (results) {
            if (results.clavesadd.length > 0){
                selectclaveadd(results.clavesadd, results.ARTICULO)
            }else{
                instanceProd2(results)
            }
             
        }
        ).fail(function (jqXHR) {
            setStatLabel("danger", 'Un error ocurrió');
        });
        
        
        
}

function selectclaveadd(data, art){
    $('#presList ul').empty();
    $('#clavesaddModal').modal('show');
    //$('#presList ul').append('<li>' + data[0].Dato1 + '</li>') 
    
    for (i = 0; i < data.length; i++) { 
        
        var item = data[i]; 
        
        
        var displayText = item.Clave + '(' + item.Precio + ')';
        
        $('#presList ul').append(
            '<li class="list-group-item" id="' +
            item.Clave +  '">' +
            displayText+ '</li>'); 
        
        //$('#presList ul').append('<li class="list-group-item">' + item.Dato1 +'</li>');
      
   
        $("#presList ul").unbind('click').on('click', '#' + item.Clave, 
            function(){
                var newP = {
                    Precio: item.Precio,
                    Cantidad: 1,
                    Impuesto: 0,
                    Costo: art.COSTO,
                    Articulo: art.ARTICULO
                };
                Partidas.push(newP);
    
                total = total + newP.Precio;
                
                $("#statuslabel"    ).removeAttr ("class"                                                    );
                $('#statuslabel'    ).addClass   ("alert alert alert-success"                                );
                $('#statuslabel'    ).text       ('Articulo agregado, total: ' + total                       );
                $('#prods ul'       ).append     ('<li class="list-group-item">' + art.DESCRIP + '</li>'     );
                $('#clavesaddModal' ).modal      ('hide'                                                     );
        } // function
        ); // on click
        
    } // for
     
    saveState();
    
} //selectclaveadd

function terminateSell() {
   var clientid = $('#clienttb').val();
    
   if (Partidas.length > 0 && clientid.length > 0){
       var endoint = localStorage.getItem("endpoint");

       
       var ob = { "ClientId": clientid, "Partidas": Partidas };

       var data = JSON.stringify(ob);

       var url = endoint + '/makesell.ashx';

       $.ajax({
            type: "POST",
            data: data,
            url: url,
            contentType: "application/json",
            dataType: 'json'
       }).done(function (res) {
            setStatLabel("success", "Venta hecha")
            console.log('res', res);
            // Do something with the result :)
       }); 
   
   // clear state and gui
   
   $('#prods ul').empty();
   Partidas = []; 
   total = 0; 
   
   saveState();
   }
   
}

function showTerminateSellResults(data, status) {
    $('#statuslabel').text(status);
} 

function saveUser(){
    var user = $('#usertb').val(); 
    var password = $('#passwordtb').val();
    
    var endpoint = localStorage.getItem("endpoint"); 
    
    var url = endpoint + '/login.ashx?user=' + user + '&password=' + password; 
    
     $.getJSON(url, function (results) {
        if (results.success = true){
            localStorage.setItem("user", user);
            
            var message = 'Iniciaste sesión como ' + user
            setStatLabel("success", message);
            $('#configModal').modal('hide');
        }else{
            setStatLabel("warning", 'Usuario o contraseñas incorrectos');
            $('#configModal').modal('hide');
        }
    }
    ).fail(function (jqXHR) {
        setStatLabel("danger", "Ocurrió un error al iniciar sesión :()")
    });
    
}

function setStatLabel(style, value){
    $("#statuslabel").removeAttr ("class");
    
    switch (style){
        
        case "info": 
        $("#statuslabel").addClass("alert alert-info");
        break; 
        
        case "success": 
        $("#statuslabel").addClass("alert alert-success");
        break;
        
        case "danger":
        $("#statuslabel").addClass("alert alert-danger");
        break; 
        
        case "warning":
        $("#statuslabel").addClass("alert alert-warning");
        break;
        
        default: 
        $("#statuslabel").addClass("alert alert-info");
        break;
    }
    
    $("#statuslabel").text(value);
}

function generateClaveAddId(){
    claveadd_id += 1; 
    
} 



function validateProd(){
    var prod = $('#prodtb').val(); 
    
    var endpoint = localStorage.getItem("endpoint"); 
    var url = endpoint + "/prods.ashx?single=true&p=" + prod; 
    
    $.getJSON(url, function (results) {
        console.log(results.ARTICULO);
        currentProd = results.ARTICULO;
        setStatLabel("info", results.ARTICULO.DESCRIP); 
        
        $('#p1button').html(results.ARTICULO.PRECIO1);
        $('#p2button').html(results.ARTICULO.PRECIO2);
        $('#p3button').html(results.ARTICULO.PRECIO3);
        
        saveState();
        
    }
    ).fail(function (jqXHR) {
        setStatLabel("danger", "Ocurrió un al obtener la información del servidor")
    });
    
} 


$('#qtytb').on('input', function(){
    text = $('#qtytb').val(); 
    
    selectPrice();
})  

function selectPrice(){
    var qty = parseFloat( $('#qtytb').val());
    var price = currentProd.C1 + ", " + currentProd.C2 + ", " + currentProd.C3
    
    console.log(qty); 
    console.log(price);
    
    if (currentProd){
        
        
        if (qty < currentProd.C2) {
            console.log("P1");
            $('#pricetb').val(currentProd.PRECIO1);
            return;
            
        } 
        
        if (qty >= currentProd.C2 && qty < currentProd.C3){
            console.log("P2");
            $('#pricetb').val(currentProd.PRECIO2);
            return;
            
        }
        
        
        
        if (qty >= currentProd.C3){
            console.log("P3");
            $('#pricetb').val(currentProd.PRECIO3);
            
        } 
        
    }
} 


/* 
===========================================================================================
                                 Offline operations 
===========================================================================================
*/

function validateProdOffline(){
    
    var prod = $('#prodtb').val(); 
    
    read(prod, function(result){
        
        currentProd = result; 
        setStatLabel("info", result.DESCRIP); 
        
        saveState()
        
    })
    
} 

function removePendingSale(id){
    var transaction = db.transaction(["ventas"], "readwrite"); 
    
    transaction.oncomplete = function(event) {
    
    };

    transaction.onerror = function(event) {
        
    };

    // create an object store on the transaction
    var objectStore = transaction.objectStore("ventas");

    // Delete the specified record out of the object store
    var objectStoreRequest = objectStore.delete(id);

    objectStoreRequest.onsuccess = function(event) {
    // report the success of our delete operation
        
    };
}

function terminateSell2(item) {
   
   var clientid = $('#clienttb').val();
    
   if (clientid.length > 0){
       var endpoint = localStorage.getItem("endpoint");

       
       var ob = { "ClientId": item.CLIENTE, "Partidas": item.PARTIDAS };

       var data = JSON.stringify(ob);

       var url = endpoint + '//makesell.ashx';

       $.ajax({
            type: "POST",
            data: data,
            url: url,
            contentType: "application/json",
            dataType: 'json'
       }).done(function (res) {
           console.log("i'm going to remove entry")
            removePendingSale(item.id)
           
            setStatLabel("success", "Venta hecha")
            console.log('res', res);
            // Do something with the result :)
       }); 
   
   // clear state and gui
   $('#prods ul').empty();
   Partidas = []; 
   total = 0; 
   
   saveState();
    
   }
   
} 

function renderPendingSales(){
    getPendingSales(function(items){
        var c = 0; 
        var l = items.length; 
        
        for (c = 0; c < l; c++){
            var item = items[c];
            var div = $('<div class="list-group-item"></div>')
            var span = '<span>' + "venta: " + item.id + ", importe: " + item.PRECIO + '<span>';
            var button = $('<button>Enviar a MyBusiness</button>').click(
                function(){
                    //window.alert(item.id);
                    terminateSell2(item);
                }
            )
            
            div.append(span);
            div.append(button);
            
            $('#pendingSalesList ul').append(div);
            
        }
        
    })
} 

function read(key) {
   var transaction = db.transaction(["prods"]);
   var objectStore = transaction.objectStore("prods");
   var request = objectStore.get(key);
   
   request.onerror = function(event) {
      setStatLabel("danger", "no se pudo extraer información de la base de datos");
   };
   
   request.onsuccess = function(event) {
      if(request.result) {
         //window.alert(request.result);
         $('#prodtb').val(request.result.ARTICULO);
         currentProd = request.result; 
         saveState();
      }
      
      else {
         setStatLabel("danger", "no se pudo extraer información de la base de datos");
      }
   };
} 

function read(key, callback) {
   var transaction = db.transaction(["prods"]);
   var objectStore = transaction.objectStore("prods");
   var request = objectStore.get(key);
   
   request.onerror = function(event) {
      setStatLabel("danger", "no se pudo extraer información de la base de datos");
   };
   
   request.onsuccess = function(event) {
      if(request.result) {
         //window.alert(request.result);
         callback(request.result);
      }
      
      else {
         setStatLabel("danger", "no se pudo extraer información de la base de datos");
      }
   };
} 

function searchProdOffline()
{
    var key = $('#searchProdText').val();
    var data = read(key);
    if (data){
        $('#prodtb').val(data.DESCRIP);
    }
} 

function insertPendingSell(){ 
    
    var d = new Date();
    var fecha = d.toLocaleDateString();
    var CANTIDAD = $('#qtytb').val();
    var cliente = $('#clienttb').val();
    var qty = $('#qtytb').val()
    
    var newvta = {PRECIO: total, CLIENTE: cliente, USUFECHA: fecha, cantidad: qty, PARTIDAS: Partidas}; 
    
    
    
    var request = db.transaction('ventas', "readwrite")
        .objectStore("ventas")
        .add(newvta);
                                 
    request.onsuccess = function(event) {
        console.log("Venta agregada a pendientes"); 
        setStatLabel("sucess", "Venta agregada a pendientes");
    };
    
    
}

function opendb(){
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 

    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
 
    if (!window.indexedDB) {
        window.alert("Your browser doesn't support a stable version of IndexedDB.");
    }else{
        //window.alert("Listo para conectarse");
    }
     
    
    var request = window.indexedDB.open("mbptest8", 1);
 
    request.onerror = function(event) {
        console.log("error: ");
    };
 
    request.onsuccess = function(event) {
        db = request.result;
        console.log("success: "+ db);
    };
 
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        var prodStore = db.createObjectStore("prods" , {keyPath: "SP"                       });
        var sellStore = db.createObjectStore("ventas", {keyPath: "id", autoIncrement: true  }); 
        
         
        
    }
} 

function syncdb(){
    
    setStatLabel("info", "Sincronizando bases de datos");
    var endpoint = localStorage.getItem("endpoint"); 
    
    var url = endpoint + "/prods.ashx?take=5000" 
    
    
    $.getJSON(url, function (results) {
        var count = 0; 
        
        for (count = 0; count < results.length; count++){
            var item = results[count]; 
            
            var request = db.transaction('prods', "readwrite")
                .objectStore("prods")
                .add(item);
                                 
            request.onsuccess = function(event) {
                console.log(item.DESCRIP + " agregado"); 
                setStatLabel("info", item.DESCRIP + " agregado");
            };
         
            request.onerror = function(event) {
                
                var request = db.transaction('prods', "readwrite")
                .objectStore("prods")
                .put(item);
                
                console.log(item.DESCRIP + " actualizado"); 
                setStatLabel("info", item.DESCRIP + " actualizado");
                       
            }

        } // for
        
        //setStatLabel("success", "Bases de datos sincronizadas con exito");
        
    }// function
    ).fail(function (jqXHR) {
        window.alert("Error al descargar información del servidor :()")
    }).done(function(){
        setStatLabel("success", "Bases de datos sincronizadas con exito");
    }).complete(function(){
        setStatLabel("success", "Bases de datos sincronizadas con exito");
    });
    
}

function addProdOffline(){
   var transaction = db.transaction(["prods"]);
   var objectStore = transaction.objectStore("prods");
   var key = $('#prodtb').val();
   var request = objectStore.get(key);
   
   request.onerror = function(event) {
      setStatLabel("danger", "no se pudo extraer información de la base de datos");
   };
   
   request.onsuccess = function(event) {
      if(request.result) {
         
         instanceProdOffline(request.result);
         
      }
      
      else {
         setStatLabel("danger", "no se pudo extraer información de la base de datos");
      }
   };
} 

function instanceProdOffline(prod){
    var price = parseFloat($('#pricetb').val()); 
    var qty = parseFloat($('#qtytb').val());
    //if (results.clavesadd.length > 0)
    //{
        //selectclaveadd(results.clavesadd, results.ARTICULO);
    //}else{
        var newP = {
        Precio: price * qty,
        Cantidad: qty,
        Impuesto: 0,
        Costo: 0,
        Articulo: prod.ARTICULO
    };
    Partidas.push(newP);
    
    total = total + newP.Precio;

    $("#statuslabel").removeAttr ("class"                                                            );
    $('#statuslabel').addClass   ("alert alert alert-success"                                        );
    $('#statuslabel').text       ('Articulo agregado, total: ' + total                               );
    $('#prods ul'   ).append     ('<li class="list-group-item">' + prod.DESCRIP + '</li>'            );
    
    saveState();
    
    //}
}

function getPendingSales(callback){
    var trans = db.transaction("ventas", "readwrite");
    var store = trans.objectStore("ventas");
    var items = [];
 
    trans.oncomplete = function(evt) {  
        callback(items);
    };
 
    var cursorRequest = store.openCursor();
 
    cursorRequest.onerror = function(error) {
        console.log(error);
    };
 
    cursorRequest.onsuccess = function(evt) {                    
        var cursor = evt.target.result;
        if (cursor) {
            items.push(cursor.value);
            cursor.continue();
        }
    };
} 

function getProdId(){ 
    _prodId_ = _prodId_ + 1;
    
    var hashids = new Hashids("valerizont201948mu"), 
        id = hashids.encode(_prodId_); 
        
    return "#" + id;
} 


function saveState(){
    var client = $('#clienttb' ).val(); 
    var prod   = $('#prodtb'   ).val();
    var _price = $('#pricetb'  ).val();
    var _qty   = $('#qtytb'    ).val();
     
    var _price = parseFloat(_price   ); 
    var _qty   = parseFloat(_qty     );
    
    localStorage.setItem("partidas"            , JSON.stringify(Partidas)           ); 
    localStorage.setItem("total"               , total              ); 
    localStorage.setItem("currentProd"         , currentProd        ); 
    localStorage.setItem("prodId"              , _prodId_           ); 
    localStorage.setItem("cliente"             , client             ); 
    localStorage.setItem("producto"            , prod               ); 
    localStorage.setItem("price"               , _price             ); 
    localStorage.setItem("qty"                 , _qty               );
    
    console.log("cantidad" + _qty)
}

function getState(){
    
    var client = localStorage.getItem("cliente");
    var prod = localStorage.getItem("producto"); 
    var _qty = localStorage.getItem("qty");
    var _price = localStorage.getItem("price");
    
    console.log("==cantitad" + _qty);
    console.log("Get state");
    
    currentProd  = localStorage.getItem("currentProd"); 
    
    Partidas =  JSON.parse(
        localStorage.getItem("partidas")); 
    
    if (!Partidas){
        Partidas = new Array();
    }
     
    total = localStorage.getItem("total"); 
    if (!total){
        window.alert(total);
        total = 0;
    }
    
    
        $("#qtytb").val(_qty);
    
        $('#pricetb').val(_price);
    
    
    $('#clienttb').val(client); 
    $('#prodtb'  ).val(prod  ); 
    
    
    
}