


var maincontainer;
var svgcontainer;
var last_x = 0;
var object_space = 40;
var level_space = 60;
var allow_dragdrop = false;
var OnNodeClick;








function registerContainer(container_id, node_click_callback) {
    if (typeof maincontainer != 'undefined')
        return;

    OnNodeClick = node_click_callback;

    maincontainer = $("#" + container_id);
    if (typeof maincontainer == 'undefined')
        return;

    maincontainer.attr('id', 'chartcontainer');
    maincontainer.attr('ondragover', 'handle_Dragover(event)');
    maincontainer.attr('ondrop', 'handleObjectDrop(event)');

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('id', 'mainSVG');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    maincontainer.append(svg);
    svgcontainer = $("#mainSVG");


}


function createRelationBox(pos_x, pos_y, id) {
    var div = document.createElement("div");
    div.id = id;

    div.setAttribute('style', 'position:absolute; top:' + pos_y + 'px; left:' + pos_x + 'px');
    div.setAttribute('class', 'relationchartobject');

    if (allow_dragdrop)
    {
        div.setAttribute('ondrop', 'handleObjectDrop(event)');
        div.setAttribute('ondragover', 'handle_Dragover(event)');
        div.setAttribute('draggable', 'true');
        div.setAttribute('ondragstart', 'handle_Dragstart(event)');
    }

    maincontainer.append(div);

    last_x = pos_x;

}


function createObjectBox(pos_x, pos_y,  object_data) {
   
  

    var test = document.elementFromPoint(pos_x, pos_y)
    if (test)
    {
        if (test.id != "chartcontainer")
        {
            $("#chartcontainer").children('div').each(function (i, box) {

                //alert(box.id);
                if (box.offsetLeft + box.clientWidth >= pos_x)
                {
                    var rect = box.getBoundingClientRect();
                    box.setAttribute('style', 'position:absolute; top:' + pos_y + 'px; left:' + (rect.left + box.clientWidth + (object_space * 2)) + 'px');
                }

            });
        }
    }

    var div = document.createElement("div");
    div.id = object_data.ID;

    if (typeof object_data != "undefined" && object_data.hasOwnProperty('Gender'))
    {
      

        if (object_data.Gender == "M")
            div.setAttribute('class', 'malechartobject');
        if (object_data.Gender == "F")
            div.setAttribute('class', 'femalechartobject');
    }
    else
    {
        div.setAttribute('class', 'chartobject');
    }

  
    div.setAttribute('style', 'position:absolute; top:' + pos_y + 'px; left:' + pos_x + 'px');

    if (allow_dragdrop)
    {
        div.setAttribute('ondrop', 'handleObjectDrop(event)');
        div.setAttribute('ondragover', 'handle_Dragover(event)');
        div.setAttribute('draggable', 'true');
        div.setAttribute('ondragstart', 'handle_Dragstart(event)');
    }

    var fullname = document.createElement("p");
    fullname.id = object_data.ID + "-FULLNAME";
    fullname.setAttribute('class', 'chartobject_paragraph');
    fullname.setAttribute('onClick', 'OnNodeClick(event, this)')
    fullname.innerText = object_data.FullName || '';
    div.appendChild(fullname);

    var birthdate = document.createElement("p");
    birthdate.id = object_data.ID + "-BIRTHDATE";
    birthdate.setAttribute('class', 'chartobject_paragraph');
    birthdate.innerText = object_data.BirthDate || '';
    div.appendChild(birthdate);

    maincontainer.append(div);



    last_x = pos_x;
    last = pos_y;

}

function createObjectPath(obj1_id, obj2_id, pathtype)
{
    var svgNS = "http://www.w3.org/2000/svg"
    var p = document.createElementNS(svgNS,"path");
    p.setAttributeNS(null, 'id', 'path_' + obj1_id + '_' + obj2_id);
    p.setAttributeNS(null, 'd', 'M0 0');

    svgcontainer.append(p);

    $("#" + p.id).data("PATHTYPE", pathtype);
    $("#" + p.id).data("START_ELEMENT_ID", obj1_id);
    $("#" + p.id).data("END_ELEMENT_ID", obj2_id);
}

function createObjectLine(obj1_id, obj2_id, pathtype) {
    var svgNS = "http://www.w3.org/2000/svg"
    var line = document.createElementNS(svgNS, "line");
    line.setAttributeNS(null, 'id', 'line_' + obj1_id + '_' + obj2_id);
   
    svgcontainer.append(line);

    $("#" + line.id).data("PATHTYPE", pathtype);
    $("#" + line.id).data("START_ELEMENT_ID", obj1_id);
    $("#" + line.id).data("END_ELEMENT_ID", obj2_id);
}


function handle_Dragover(ev) {
    ev.preventDefault();
    return false;
}

function handle_Dragstart(ev)
{

    var style = window.getComputedStyle(ev.target, null);
    var transdata = { dragged_id: '-', leftoffset: 0, topoffset: 0 };
    transdata.dragged_id = ev.target.id;
    transdata.leftoffset = (parseInt(style.getPropertyValue("left"), 10) - ev.clientX);
    transdata.topoffset = (parseInt(style.getPropertyValue("top"), 10) - ev.clientY);
    ev.dataTransfer.setData("text", JSON.stringify(transdata));
   
}



function handleObjectDrop(ev)
{

    var transdata = JSON.parse(ev.dataTransfer.getData("text"));
    var element = document.getElementById(transdata.dragged_id);
    if (transdata.dragged_id.indexOf("PARTNER-") > -1) {
        element.setAttribute('style', 'position:absolute; top:' + (ev.clientY + parseInt(transdata.topoffset, 10)) + 'px; left:' + (ev.clientX + parseInt(transdata.leftoffset, 10)) + 'px;width:20px;height:10px');
    } else {
        element.setAttribute('style', 'position:absolute; top:' + (ev.clientY + parseInt(transdata.topoffset, 10)) + 'px; left:' + (ev.clientX + parseInt(transdata.leftoffset, 10)) + 'px');
    }
  
    DrawTree();

    last_x = (ev.clientX + parseInt(transdata.leftoffset, 10));
    last = (ev.clientY + parseInt(transdata.topoffset, 10));

    event.preventDefault();
    return false;
}



function signum(x)
{
    return (x < 0) ? -1 : 1;
}
function absolute(x)
{
    return (x < 0) ? -x : x;
}


function connectGeneaologyPartners(div1_id, div2_id)
{
    var line = $("#line_" + div1_id + '_' + div2_id);
    var startElem = $("#" + div1_id);
    var endElem = $("#" + div2_id);


    // if first element is lower than the second, swap!
    if (startElem.offset().left < endElem.offset().left) {
        var temp = startElem;
        startElem = endElem;
        endElem = temp;
    }

    // get (top, left) corner coordinates of the svg container   
    var svgTop = maincontainer.offset().top;
    var svgLeft = maincontainer.offset().left;

    // get (top, left) coordinates for the two elements
    var startCoord = startElem.offset();
    var endCoord = endElem.offset();

    var startX = startCoord.left + startElem.outerWidth() - svgLeft;
    var startY = startCoord.top + 0.5 * startElem.outerHeight() - svgTop;

    var endX = endCoord.left - svgLeft;
    var endY = endCoord.top + (0.5 * endElem.outerHeight()) - svgTop;

    // check if the svg is big enough to draw the path, if not, set heigh/width
    if (svgcontainer.attr("width") < endX + object_space) svgcontainer.attr("width", endX + object_space);
    if (svgcontainer.attr("height") < (endY + object_space)) svgcontainer.attr("height", (endY + object_space));

   

    line.attr("x1", startX);
    line.attr("y1", startY);
    line.attr("x2", endX);
    line.attr("y2", endY);
  
}


function connectGeneaologyParentChild(div1_id, div2_id)
{

    var path = $("#path_" + div1_id + '_' + div2_id);
    var startElem = $("#" + div1_id);
    var endElem = $("#" + div2_id);



    // if first element is lower than the second, swap!
    if (startElem.offset().top > endElem.offset().top) {
        var temp = startElem;
        startElem = endElem;
        endElem = temp;
    }

    // get (top, left) corner coordinates of the svg container   
    var svgTop = maincontainer.offset().top;
    var svgLeft = maincontainer.offset().left;

    // get (top, left) coordinates for the two elements
    var startCoord = startElem.offset();
    var endCoord = endElem.offset();

    // calculate path's start (x,y)  coords
    // we want the x coordinate to visually result in the element's mid point
    var startX = startCoord.left + 0.5 * startElem.outerWidth() - svgLeft;    // x = left offset + 0.5*width - svg's left offset
    var startY = startCoord.top + startElem.outerHeight() - svgTop;        // y = top offset + height - svg's top offset

    // calculate path's end (x,y) coords
    var endX = endCoord.left + 0.5 * endElem.outerWidth() - svgLeft;
    var endY = endCoord.top - svgTop;

    // check if the svg is big enough to draw the path, if not, set heigh/width
    if (svgcontainer.attr("height") < endY + object_space) svgcontainer.attr("height", endY + object_space);
    if (svgcontainer.attr("width") < (endX + object_space)) svgcontainer.attr("width", (endX + object_space));

    var deltaX = (endX - startX) * 0.15;
    var deltaY = (endY - startY) * 0.15;



    // for further calculations which ever is the shortest distance
    var delta = deltaY < absolute(deltaX) ? deltaY : absolute(deltaX);

    //ADJUST CURVE LINES
    delta += 10;

    // set sweep-flag (counter/clock-wise)
    // if start element is closer to the left edge,
    // draw the first arc counter-clockwise, and the second one clock-wise
    var arc1 = 0; var arc2 = 1;
    if (startX > endX) {
        arc1 = 1;
        arc2 = 0;
    }


     // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end 
     path.attr("d", "M" + startX + " " + startY +
               " V" + (startY + delta) +
               " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (startX + delta * signum(deltaX)) + " " + (startY + 2 * delta) +
               " H" + (endX - delta * signum(deltaX)) +
               " A" + delta + " " + delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3 * delta) +
               " V" + endY);
    


}



function connectDefault(div1_id, div2_id)
{
    var path = $("#path_"+div1_id+'_'+div2_id);
    var startElem =  $("#"+div1_id);
    var endElem = $("#" + div2_id);


    // if first element is lower than the second, swap!
    if (startElem.offset().top > endElem.offset().top) {
        var temp = startElem;
        startElem = endElem;
        endElem = temp;
    }

    // get (top, left) corner coordinates of the svg container   
    var svgTop = maincontainer.offset().top;
    var svgLeft = maincontainer.offset().left;

    // get (top, left) coordinates for the two elements
    var startCoord = startElem.offset();
    var endCoord = endElem.offset();

    // calculate path's start (x,y)  coords
    // we want the x coordinate to visually result in the element's mid point
    var startX = startCoord.left + 0.5 * startElem.outerWidth() - svgLeft;    // x = left offset + 0.5*width - svg's left offset
    var startY = startCoord.top + startElem.outerHeight() - svgTop;        // y = top offset + height - svg's top offset

    // calculate path's end (x,y) coords
    var endX = endCoord.left + 0.5 * endElem.outerWidth() - svgLeft;
    var endY = endCoord.top - svgTop;


    // check if the svg is big enough to draw the path, if not, set heigh/width
    if (svgcontainer.attr("height") < endY + object_space) svgcontainer.attr("height", endY + object_space);
    if (svgcontainer.attr("width") < (endX + object_space)) svgcontainer.attr("width", (endX + object_space));

    var deltaX = (endX - startX) * 0.15;
    var deltaY = (endY - startY) * 0.15;

    // for further calculations which ever is the shortest distance
    var delta = deltaY < absolute(deltaX) ? deltaY : absolute(deltaX);


    // set sweep-flag (counter/clock-wise)
    // if start element is closer to the left edge,
    // draw the first arc counter-clockwise, and the second one clock-wise
    var arc1 = 0; var arc2 = 1;
    if (startX > endX) {
        arc1 = 1;
        arc2 = 0;
    }



   // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end 
   path.attr("d", "M" + startX + " " + startY +
              " V" + (startY + delta) +
              " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (startX + delta * signum(deltaX)) + " " + (startY + 2 * delta) +
              " H" + (endX - delta * signum(deltaX)) +
              " A" + delta + " " + delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3 * delta) +
              " V" + endY);
    


}




function DrawTree()
{
 
    $("#mainSVG").attr("height", "0");
    $("#mainSVG").attr("width", "0");

    $("#mainSVG").children().each(function (i, svgcontent)
    {
        var pathtype = $("#" + svgcontent.id).data("PATHTYPE");
        var divarr = svgcontent.id.split("_");

        //alert(divarr[1]+' - ' + divarr[2]);

        if (pathtype == "CHILD_TO_PARENT" || pathtype == "PARENT_TO_CHILD") {
            connectGeneaologyParentChild(divarr[1], divarr[2]);
        }

        if (pathtype == "PARTNER_TO_PARTNER") {
            connectGeneaologyPartners(divarr[1], divarr[2]);
        }

    });

   
   
}





