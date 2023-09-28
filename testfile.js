const startTime = performance.now();
var map;

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  //console.log(elmnt.querySelector(".closepanel"))
  if (elmnt.querySelector(".closepanel")) {
    // if present, the header is where you move the DIV from:
    elmnt.querySelector(".closepanel").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

        require(["dojo/dom",
            "esri/map", "esri/dijit/BasemapGallery", "esri/dijit/Measurement", "esri/dijit/Scalebar", "esri/dijit/LayerList",
            "esri/layers/FeatureLayer", "esri/toolbars/navigation","esri/geometry/Extent","esri/dijit/Search",
			"esri/dijit/Print", "esri/tasks/PrintTemplate",
			"esri/request", "esri/config","esri/tasks/GeometryService",
			"dojo/_base/array", 
            "dojo/parser",
			"esri/dijit/Popup", "esri/dijit/PopupTemplate","esri/symbols/SimpleFillSymbol", "esri/Color","esri/tasks/BufferParameters",
			"dojo/dom-class", "dojo/dom-construct", "dojo/on",
            "esri/layers/ArcGISDynamicMapServiceLayer",
            "esri/tasks/query", "esri/geometry/Circle",
            "esri/graphic", "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleLineSymbol", "esri/renderers/SimpleRenderer",
            "esri/toolbars/draw", "esri/geometry/Point", "esri/SpatialReference",
			
			
            "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dijit/TitlePane","dijit/layout/AccordionContainer",
            "dojo/domReady!"

        ], function (dom, Map, BasemapGallery, Measurement,Scale,LayerList, FeatureLayer, navigation,Extent,Search,Print, PrintTemplate,
        esriRequest, esriConfig,GeometryService, arrayUtils, parser,Popup,PopupTemplate,SimpleFillSymbol, Color,BufferParameters,domClass,domConstruct,on,ArcGISDynamicMapServiceLayer,Query, Circle,
        Graphic, SimpleMarkerSymbol,SimpleLineSymbol, SimpleRenderer,Draw,Point,SpatialReference) {
            parser.parse();
            
			//////////////Geometry Service///////////////////
			esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
		
			///////Identify///////
			
			var fill = new SimpleFillSymbol("solid", null, new Color("#F5D195"));
			var popup = new Popup({
            fillSymbol: fill,
            titleInBody: false,
			popupWindow: true,
			}, domConstruct.create("div"));
			//Add the dark theme which is customized further in the <style> tag at the top of this page
			domClass.add(popup.domNode, "light");
			
			var template = new PopupTemplate({
          title: "Indian States",
          description: "<br> State Name :  {stname} <br> State Area :  {st_area(shape)} sq.m <br> State Code :  {stcode11}",
          
        });
			
			
			////// FeatureLayer
            var featureLayer = new FeatureLayer("https://umd.nic.in/sramap/rest/services/State/MapServer/0",
			{	mode: FeatureLayer.MODE_AUTO,
        outFields: ["*"],
				infoTemplate: template,
			});
			
      //let dyn = new ArcGISDynamicMapServiceLayer("https://umd.nic.in/sramap/rest/services/State/MapServer")

			
			var layerExtent = new Extent({"xmin":6563252.629577573,"ymin":763215.3863630132,"xmax": 11005161.217284555,"ymax":4554491.989306748,"spatialReference":{"wkid":102100}});
			////// Map 
			map = new Map("mapdiv", {
                basemap: "streets-night-vector",  //For basemaps, navigate to http://arcg.is/1JVo6Wd
                extent: layerExtent,
				infoWindow: popup,
				//center: [ 79.04170931936767,23.362990157005765],
				//zoom: 4,
				
				
            });
			map.addLayers([featureLayer]);
      
      let selectedlayerid = document.getElementById("layerSelection")
      let stateSelector = document.getElementById("stateSelection")
      //////////////////Select layer///////////////////
      map.on("layers-add-result", (obj)=>{   
        //console.log(obj)     
        var select = document.getElementById("layerSelection");
            
            for(var i = 0; i < obj.layers.length; i++)
            {   try {
              for(let k=0;k<obj.layers[i].layer.layerInfos.length;k++){
                var option = document.createElement("OPTION");
                txt = document.createTextNode(obj.layers[i].layer.layerInfos[k].name);
                option.appendChild(txt);
                option.setAttribute("value",obj.layers[i].layer.id);
                select.insertBefore(option,select.lastChild);}
            } catch (error) {              
                var option = document.createElement("OPTION"),
                txt = document.createTextNode(obj.layers[i].layer._name);
                option.appendChild(txt);
                //console.log(typeof(obj.layers[i].layer._name))
                option.setAttribute("value",obj.layers[i].layer.id);
                select.insertBefore(option,select.lastChild);
              }  
            }  

            let statesquery = new Query()
            statesquery.outFields = ["stname"]
            statesquery.returnGeometry = true;
            statesquery.where = "1=1"
            //,featureLayer.SELECTION_NEW,
            featureLayer.queryFeatures(statesquery,(response)=>{
              let statenames = new Array();
              for(let l = 0; l<response.features.length;l++){
                  statenames.push(response.features[l].attributes.stname)
                  statenames.sort()
              }
              //featureLayer.clearSelection();
              for(let l = 0; l<statenames.length;l++){
                var newoption = document.createElement("OPTION");
                let txt = document.createTextNode(statenames[l]);
                newoption.appendChild(txt);
                newoption.setAttribute("value",statenames[l]);
                stateSelector.insertBefore(newoption,stateSelector.lastChild);
              }
              
            })
      })
      
    

      let tb = new Draw(map);      
			var identityButton = document.getElementById("popupfButton")
			identityButton.onclick = function(){
				if(map.infoWindow == popup){
					map.infoWindow = null;
					identityButton.style.backgroundColor = "red"
					
				} else{map.infoWindow = popup;
					identityButton.style.backgroundColor = "green"
				}
				
			}
			let selectedQuery;
      let selectedlayer="------Select a layer------";
            /////////////////Toolbars////////////

            
            selectedlayerid.onchange = ()=>{
              
              if(selectedlayerid.value=="Select a layer"){
                selectedlayer = "------Select a layer------"
              }else{
                selectedlayer = map.getLayer(selectedlayerid.value)
              }
            }
            


            let bufferButton = document.getElementById("dobuffer")
            bufferButton.onclick = () =>{
              //console.log(selectedlayer)
              if(selectedlayer=="------Select a layer------"){
                alert("Please Select a layer to do buffer")
              }else{
              map.infoWindow = null;
              var circleSymb = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_NULL,
                new SimpleLineSymbol(
                  SimpleLineSymbol.STYLE_SOLID,
                  new Color([252, 116, 5]),
                  2
                ), new Color([255, 255, 0, 0.25])
              );
              var circle;
              
              map.disableMapNavigation();
              tb.activate("point")
              var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color([144, 3, 252]), 2),new Color([255,0,0,0.25]))
                selectedlayer.setSelectionSymbol(sfs)
              tb.on("draw-end", addGraphic);
                function addGraphic(evt) {
                    tb.deactivate();
                    map.enableMapNavigation();
                    
                    /////marker symbol and style/////
                    var markerSymbol = new SimpleMarkerSymbol({"color":[5, 252, 194,128],
                    "size":5,"angle":0,"xoffset":0,"yoffset":0,
                    "type":"esriSMS",
                    "style":"esriSMSCircle",
                    "outline":{"color":[10,10,128,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}});
                    
                    circle = new Circle({
                      center: evt.geometry,
                      geodesic: true,
                      radius: Number(document.getElementById("distance").value),
                      radiusUnit: document.getElementById("unit").value,
                    });
                    map.graphics.clear();
                    map.graphics.add(new Graphic(evt.geometry, markerSymbol));
                    var graphic = new Graphic(circle, circleSymb);
                    map.graphics.add(graphic);
                    var query = new Query();
                    query.geometry = circle.getExtent();
                    query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS //SPATIAL_REL_CONTAINS
                    selectedQuery = query;
                    selectedlayer.queryFeatures(query,(response)=>{
                      selectedlayer.selectFeatures(query,FeatureLayer.SELECTION_NEW,(select)=>{})
                      let table = document.getElementById("reporttb")
                      let tbody = table.querySelector("tbody");
                      while (tbody.firstChild) {
                        tbody.removeChild(tbody.firstChild);
                    }
                      let tablediv = document.getElementById("reportTable")
                      tablediv.style.display = "block"
                      let featuresList = response.features
                      let xmax=0,xmin=10000000000,ymax=0,ymin=10000000000;
                      for(let i=0;i<featuresList.length;i++){
                        if(xmax<featuresList[i]._extent.xmax){xmax=featuresList[i]._extent.xmax}
                        if(xmin>featuresList[i]._extent.xmin){xmin=featuresList[i]._extent.xmin}
                        if(ymax<featuresList[i]._extent.ymax){ymax=featuresList[i]._extent.ymax}
                        if(ymin>featuresList[i]._extent.ymin){ymin=featuresList[i]._extent.ymin}
                        let area = featuresList[i].attributes["st_area(shape)"]/1000000
                        const row = document.createElement("tr");
                        row.innerHTML = `<td>${featuresList[i].attributes.stname}</td><td>${featuresList[i].attributes.stname_hi}</td><td>${area}</td><td>${featuresList[i].attributes.stcode11}</td>`;
                        tbody.appendChild(row);
                      }
                      document.getElementById("statecount").innerHTML = `<h6>States\' come under buffer: ${featuresList.length}</h6>`
                      document.getElementById("statecount").style.width = "500px"
                      map.setExtent(new Extent(xmin-100000,ymin-100000,xmax+100000,ymax+100000,new SpatialReference(featuresList[0]._extent.spatialReference)))
                      

                    })
                    
                  }
                  dragElement(document.getElementById("reportTable"))
                  
              
            }}

            ////////////////////////////Special Buttons - Buffer////////////////////////
            document.getElementById("clearGraphics").onclick = ()=>{
              if(selectedlayer == "------Select a layer------"){
                document.getElementById("reportTable").style.display = "none"
              return
            }else{
              tb.deactivate();
              map.graphics.clear();
              let tablediv = document.getElementById("reportTable")
              tablediv.style.display = "none"
              
              selectedlayer.clearSelection()
              map.setExtent(layerExtent)
            }}
            document.getElementById("bufferClose").onclick = ()=>{
              if(selectedlayer == "------Select a layer------"){
                document.getElementById("reportTable").style.display = "none"
                document.getElementById("bufferDiv").style.display = "none"
              return
            }else{
              tb.deactivate();
              map.infoWindow = popup;
              map.graphics.clear();
              document.getElementById("bufferDiv").style.display = "none"
              let tablediv = document.getElementById("reportTable")
              tablediv.style.display = "none"
              selectedlayer.clearSelection()
              map.setExtent(layerExtent)
            }}

            /////////////////////////Special button - stateselection////////////////////////////
            let viewstateButton = document.getElementById("zoomstate")
            viewstateButton.onclick = function(){
              if(stateSelector.value=="------Select a State------" ||stateSelector.value==""){
                alert("Please select a state to view")
              }else{
                var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                  new Color([221, 255, 51]), 5),new Color([255,0,0,0.25]))
                  featureLayer.setSelectionSymbol(sfs)
                let stateselectedquery = new Query()
                stateselectedquery.outFields = ["stname"]
                stateselectedquery.where = "stname = '" + stateSelector.value + "'"
                stateselectedquery.returnGeometry = false;
                featureLayer.selectFeatures(stateselectedquery,featureLayer.SELECTION_NEW,(extresp)=>{
                  let extentvalues = extresp[0]._extent
                  //console.log(extentvalues)
                  map.setExtent(new Extent((extentvalues.xmin)-100000,(extentvalues.ymin)-100000,(extentvalues.xmax)+100000,(extentvalues.ymax)+100000,new SpatialReference({wkid:102100})))
                })
              }
            }
            document.getElementById("zoomClose").onclick = function() {
              featureLayer.clearSelection();
              var x = document.getElementById("aoiDiv").style;
              x.display = "none"
              map.setExtent(layerExtent)
              
            }


			/////////// LayerList
			
			var layerList = new LayerList({
			map: map,
			showLegend: true, 
			layers : {layer: featureLayer.layer}
			}, "layerList");
			layerList.startup();
			
			
			
			/////// print
			
			var printUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";
			var printInfo = esriRequest({
          "url": printUrl,
          "content": { "f": "json" }
        });
        printInfo.then(handlePrintInfo, handleError);

        function handlePrintInfo(resp) {
          var layoutTemplate, templateNames, mapOnlyIndex, templates;

          layoutTemplate = arrayUtils.filter(resp.parameters, function(param, idx) {
            return param.name === "Layout_Template";
          });

          if ( layoutTemplate.length === 0 ) {
            console.log("print service parameters name for templates must be \"Layout_Template\"");
            return;
          }
          templateNames = layoutTemplate[0].choiceList;

          // remove the MAP_ONLY template then add it to the end of the list of templates
          mapOnlyIndex = arrayUtils.indexOf(templateNames, "MAP_ONLY");
          if ( mapOnlyIndex > -1 ) {
            var mapOnly = templateNames.splice(mapOnlyIndex, mapOnlyIndex + 1)[0];
            templateNames.push(mapOnly);
          }

          // create a print template for each choice
          templates = arrayUtils.map(templateNames, function(ch) {
            var plate = new PrintTemplate();
            plate.layout = plate.label = ch;
            plate.format = "PDF";
            plate.layoutOptions = {
              "authorText": "Made by:  Esri's ADM ",
              "copyrightText": "<ESRI>",
              "legendLayers": [featureLayer],
              "titleText": "India States",
              "scalebarUnit": "Kilometers"
            };
            return plate;
          });

          // create the print dijit
          var printer = new Print({
            "map": map,
            "templates": templates,
            url: printUrl
          }, dom.byId("print_button"));
          printer.startup();
        }

        function handleError(err) {
          console.log("Something broke: ", err);
        }
			
			
			////// Search - ESRI World Geocoder Service
            var search = new Search({
			enableButtonMode: true, //this enables the search widget to display as a single button
			enableLabel: false,
			enableInfoWindow: true,
			showInfoWindowOnSelect: false,
			map: map
			}, "search");
			
			
			//////Basemap Gallery
            var basemapGallery = new BasemapGallery({
                showArcGISBasemaps: true,
                map: map
            }, "basemapGallery");
            basemapGallery.startup();

			////// Measurement Tool
            var measurement = new Measurement({
                map: map
            }, dom.byId("measureTool"));
            measurement.startup();
			
                
            /////// scalebar    
            var scalebar = new Scale({
            map: map,
            scalebarUnit: "metric"
          });  
			
		////////////////extent///////////////
		
			let extButton = dom.byId("ext")
			
			extButton.onclick = function(){
				map.setExtent(layerExtent)
			}
            document.getElementById("measureclose").onclick = ()=>{
              document.getElementById("measureDiv").style.display = "none"
              map.infoWindow = popup
            }

        });

function showpanel(id) {
  let x = document.getElementById(id)
    x.style.display = "block"
    dragElement(x)
    //console.log(x)
        
    }
function usemeasure(){
  let x = document.getElementById("measureDiv")
  x.style.display = "block"
  map.infoWindow = null
  dragElement(x)
}


function hidepanel(id){
    document.getElementById(id).style.display = "none"
}


 /*function exportCSVExcel() {
    $('#reporttb').table2excel({
      exclude: ".no-export",
      filename: "buffered_states.xls",
      fileext: ".xls",
      exclude_links: true,
      exclude_inputs: false
    });
  }*/
$("#downloadexcel").click(()=>{
  tableToCSV();
}
 )
  function tableToCSV() {
 
    // Variable to store the final csv data
    var csv_data = [];

    // Get each row data
    var tabl = document.getElementById('reporttb')
    var rows = tabl.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {

        // Get each column data
        var cols = rows[i].querySelectorAll('td,th');

        // Stores each csv row data
        var csvrow = [];
        for (var j = 0; j < cols.length; j++) {

            // Get the text data of each cell
            // of a row and push it to csvrow
            csvrow.push(cols[j].innerHTML);
        }

        // Combine each column value with comma
        csv_data.push(csvrow.join(","));
    }

    // Combine each row data with new line character
    csv_data = csv_data.join('\n');

    // Call this function to download csv file 
    downloadCSVFile(csv_data);

}

function downloadCSVFile(csv_data) {
    CSVFile = new Blob([csv_data], {
        type: "text/csv"
    });
    var temp_link = document.createElement('a');

    temp_link.download = "Buffered_States.csv";
    var url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;

    // This link should not be displayed
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    // Automatically click the link to
    // trigger download
    temp_link.click();
    document.body.removeChild(temp_link);
}

$("#aoiminimise").click(function(){
  $("#aoihide").slideToggle();
})
$("#reportminimise").click(function(){
  if(document.getElementById("reportTable").style.width == "20%"){
    document.getElementById("reportTable").style.width = "80%"
    $("#statecount").show()
    $("#downloadexcel").show()
  }else{
    document.getElementById("reportTable").style.width = "20%"
    $("#statecount").hide()
    $("#downloadexcel").hide()

  }
  
  $("#report").slideToggle();
  
})       
$("#measureminimise").click(function(){
  $("#measurehide").slideToggle();
})
$("#printminimise").click(function(){
  $("#printhide").slideToggle();
}) 
$("#basemapminimise").click(function(){
  $("#basemaphide").slideToggle();
})
$("#layerlistminimise").click(function(){
  $("#layerlisthide").slideToggle();
})
$("#bufferminimise").click(function(){
  $("#bufferhide").slideToggle();
})

const endTime = performance.now();         
        
const executionTime = endTime - startTime;
console.log(`Execution time: ${executionTime} milliseconds`);        
            
		
       
		