function getApp()
{
    return new BloodLineJS();
}

class BloodLineJS
{

    #mainContainer;
    #svgContainer;
    #onNodeClick;
    #last_x = 0;
    #last_y = 0;
    #objectSpace = 40;
    #levelSpace = 60;
    #allowDragdrop = false;

    constructor()
    {
    }

    registerContainer(elementid, nodeClickCallback) 
    {

        this.#mainContainer = document.getElementById(elementid);
        if (!this.#mainContainer)
        {
            console.error('Could not set main container');
        }

        this.#onNodeClick = nodeClickCallback;

    
        this.#mainContainer.setAttribute('id', 'chartcontainer');
        this.#mainContainer.addEventListener('ondragover', this.#handleDragOver);
        this.#mainContainer.addEventListener('ondrop', this.#handleObjectDrop);

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('id', 'mainSVG');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        this.#mainContainer.append(svg);
        this.#svgContainer = svg;

    }

    drawTree()
    {
        
        this.#svgContainer.setAttribute("height", "0");
        this.#svgContainer.setAttribute("width", "0");

        Array.from(this.#svgContainer.children).forEach(svgcontent=>
        {
            var pathtype = svgcontent.dataset.PATHTYPE;
            var divarr = svgcontent.id.split("_");

            //alert(divarr[1]+' - ' + divarr[2]);

            if (pathtype == "CHILD_TO_PARENT" || pathtype == "PARENT_TO_CHILD") {
                this.#connectGeneaologyParentChild(divarr[1], divarr[2]);
            }

            if (pathtype == "PARTNER_TO_PARTNER") {
                this.#connectGeneaologyPartners(divarr[1], divarr[2]);
            }

        });

    }

    
    //Draws a tree (top down) based on a json object array, see documentation
    createTree(top_person_id, top_person_pos_x, top_person_pos_y, person_array)
    {


        person_array.forEach(value=>
        {
            if (value.ID == top_person_id) {
                this.#createPerson(top_person_pos_x, top_person_pos_y, value);
                addMembers(value, person_array, this);
            }
        });


        function addMembers(person, person_array, instance)
        {
            var motherid = "NONE";
            var fatherid = "NONE";

            if (person.Gender == "M")
                fatherid = person.ID;
            if (person.Gender == "F")
                motherid = person.ID;

            person.Relatives.forEach(value=>
            {
                if (value.Type == 'WIFE') {
                    motherid = value.ID;
                    var wife = instance.#findPersonByID(value.ID, person_array);
                    instance.#createPartner(wife, person.ID);
                }
                if (value.Type == 'HUSB') {
                    fatherid = value.ID;
                    var husb = instance.#findPersonByID(value.ID, person_array);
                    instance.#createPartner(husb, person.ID);
                }
            });


            person.Relatives.forEach(value=>
            {
                if (value.Type == 'CHILD') {
                    var child = instance.#findPersonByID(value.ID, person_array);

                    if (motherid == "NONE" && fatherid == "NONE")
                        return true; //continue

                    if (motherid == "NONE" && fatherid != "NONE") {
                        instance.#createChild(child, null, fatherid);
                    }
                    else if (motherid != "NONE" && fatherid == "NONE") {

                        instance.#createChild(child, motherid, null);
                    }
                    else {
                        instance.#createChild(child, motherid, fatherid);
                    }

                    addMembers(child, person_array,instance);
                }
            });

        }
    }


     #findPersonByID(id, person_array) 
     {
        var ret = null;
        person_array.forEach(value=>
        {
            if (value.ID == id) {
                ret = value;
                return false;
            }
        });

        return ret;
    }


     #createPerson(pos_x, pos_y, person) 
     {
        this.#createObjectBox(pos_x, pos_y, person);
        let person_div = document.getElementById(person.ID);
        person_div.dataset.PARTNER_RELID = "";
        person_div.dataset.PARTNER_RELID = "";
        person_div.dataset.OBJECT_DATA = "";
    }

    #createPartner(person, partner_id) 
    {
        var partnerEl = document.getElementById(partner_id);
        var partnerrect = partnerEl.getBoundingClientRect();

        var relationdiv_id = "PARTNER-" + person.ID + "-" + partner_id;

        this.#createRelationBox(partnerrect.left + partnerEl.clientWidth + this.#objectSpace, partnerrect.top + 27, relationdiv_id);

        var relation = document.getElementById(relationdiv_id);
        var relrect = relation.getBoundingClientRect();

        this.#createObjectBox(partnerrect.left + partnerEl.clientWidth + this.#objectSpace + relrect.width + this.#objectSpace, partnerrect.top, person);
        this.#createObjectLine(partner_id, relationdiv_id, "PARTNER_TO_PARTNER");
        this.#createObjectLine(person.ID, relationdiv_id, "PARTNER_TO_PARTNER");

        var personEl = document.getElementById(person.ID);

        partnerEl.dataset.PARTNER_RELID = relationdiv_id;
        personEl.dataset.PARTNER_RELID = relationdiv_id;
        personEl.dataset.OBJECT_DATA = person;
        
    }

    #createChild(person, mother_id, father_id) {
        var parent = document.getElementById(mother_id) || document.getElementById(father_id);
        var rect = parent.getBoundingClientRect();
        var parent_partner_rel = parent.dataset.PARTNER_RELID;

        this.#createObjectBox(this.#last_x + parent.clientWidth + this.#objectSpace, rect.top + parent.clientHeight + this.#levelSpace, person);
        this.#createObjectPath(person.ID, parent_partner_rel, "CHILD_TO_PARENT");

        let personEl=document.getElementById(person.ID);
        personEl.dataset.OBJECT_DATA = person;
    }


    #createRelationBox(pos_x, pos_y, id) {
        var div = document.createElement("div");
        div.id = id;

        div.setAttribute('style', 'position:absolute; top:' + pos_y + 'px; left:' + pos_x + 'px');
        div.setAttribute('class', 'relationchartobject');

        if (this.#allowDragdrop)
        {
            div.addEventListener('ondrop', handleObjectDrop);
            div.addEventListener('ondragover',handle_Dragover);
            div.setAttribute('draggable', 'true');
            div.addEventListener('ondragstart', handle_Dragstart);
        }

        this.#mainContainer.append(div);

        this.#last_x = pos_x;
    }


    #createObjectBox(pos_x, pos_y,  object_data) 
    {
   
        var test = document.elementFromPoint(pos_x, pos_y)
        if (test)
        {
            if (test.id != "chartcontainer")
            {
                const divs = document.querySelectorAll('div');
                divs.forEach(box => {
                    if (box.offsetLeft + box.clientWidth >= pos_x)
                    {
                        var rect = box.getBoundingClientRect();
                        box.setAttribute('style', 'position:absolute; top:' + pos_y + 'px; left:' + (rect.left + box.clientWidth + (this.#objectSpace * 2)) + 'px');
                    }
                });

            }
        }

        var div = document.createElement("div");
        div.id = object_data.ID;

        if (object_data && object_data.hasOwnProperty('Gender'))
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

        if (this.#allowDragdrop)
        {
            div.addEventListener('ondrop', handleObjectDrop);
            div.addEventListener('ondragover', handleDragOver);
            div.setAttribute('draggable', 'true');
            div.addEventListener('ondragstart', handleDragstart);
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

        this.#mainContainer.append(div);

        this.#last_x = pos_x;
        this.#last_y = pos_y;

    }

    #createObjectPath(obj1_id, obj2_id, pathtype)
    {
        var svgNS = "http://www.w3.org/2000/svg";
        var p = document.createElementNS(svgNS,"path");
        p.setAttributeNS(null, 'id', 'path_' + obj1_id + '_' + obj2_id);
        p.setAttributeNS(null, 'd', 'M0 0');

        this.#svgContainer.append(p);

        p.dataset.PATHTYPE = pathtype;
        p.dataset.START_ELEMENT_ID = obj1_id;
        p.dataset.END_ELEMENT_ID = obj2_id;
    
    }

    #createObjectLine(obj1_id, obj2_id, pathtype) {
        var svgNS = "http://www.w3.org/2000/svg";
        var line = document.createElementNS(svgNS, "line");
        line.setAttributeNS(null, 'id', 'line_' + obj1_id + '_' + obj2_id);
    
        this.#svgContainer.append(line);

        line.dataset.PATHTYPE = pathtype;
        line.dataset.START_ELEMENT_ID = obj1_id;
        line.dataset.END_ELEMENT_ID = obj2_id;
    }


    #handleDragOver(ev) 
    {
      ev.preventDefault();
      return false;
    }

    #handleDragStart(ev)
    {
        var style = window.getComputedStyle(ev.target, null);
        var transdata = { dragged_id: '-', leftoffset: 0, topoffset: 0 };
        transdata.dragged_id = ev.target.id;
        transdata.leftoffset = (parseInt(style.getPropertyValue("left"), 10) - ev.clientX);
        transdata.topoffset = (parseInt(style.getPropertyValue("top"), 10) - ev.clientY);
        ev.dataTransfer.setData("text", JSON.stringify(transdata));
    }

    

    #handleObjectDrop(ev)
    {
        var transdata = JSON.parse(ev.dataTransfer.getData("text"));
        var element = document.getElementById(transdata.dragged_id);
        if (transdata.dragged_id.indexOf("PARTNER-") > -1) {
            element.setAttribute('style', 'position:absolute; top:' + (ev.clientY + parseInt(transdata.topoffset, 10)) + 'px; left:' + (ev.clientX + parseInt(transdata.leftoffset, 10)) + 'px;width:20px;height:10px');
        } else {
            element.setAttribute('style', 'position:absolute; top:' + (ev.clientY + parseInt(transdata.topoffset, 10)) + 'px; left:' + (ev.clientX + parseInt(transdata.leftoffset, 10)) + 'px');
        }
  
        DrawTree();

        this.last_x = (ev.clientX + parseInt(transdata.leftoffset, 10));
        last = (ev.clientY + parseInt(transdata.topoffset, 10));

        ev.preventDefault();
        return false;
    }

    #signum(x)
    {
        return (x < 0) ? -1 : 1;
    }

    #absolute(x)
    {
        return (x < 0) ? -x : x;
    }


    #connectGeneaologyPartners(div1_id, div2_id)
    {
        var line = document.getElementById("line_" + div1_id + '_' + div2_id);
        var startElem = document.getElementById(div1_id);
        var endElem = document.getElementById(div2_id);


        // if first element is lower than the second, swap!
        if (startElem.getBoundingClientRect().left < endElem.getBoundingClientRect().left) {
            var temp = startElem;
            startElem = endElem;
            endElem = temp;
        }

        // get (top, left) corner coordinates of the svg container   
        var svgTop = this.#mainContainer.getBoundingClientRect().top;
        var svgLeft = this.#mainContainer.getBoundingClientRect().left;

        // get (top, left) coordinates for the two elements
        var startCoord = startElem.getBoundingClientRect();
        var endCoord = endElem.getBoundingClientRect();

        var startX = startCoord.left + startElem.offsetWidth - svgLeft;
        var startY = startCoord.top + 0.5 * startElem.offsetHeight - svgTop;

        var endX = endCoord.left - svgLeft;
        var endY = endCoord.top + (0.5 * endElem.offsetHeight) - svgTop;

        // check if the svg is big enough to draw the path, if not, set heigh/width
        let svgheight = this.#svgContainer.getAttribute("width");
        let svgwidth = this.#svgContainer.getAttribute("height");

        if (svgwidth < (endX + this.#objectSpace)) this.#svgContainer.setAttribute("width", endX + this.#objectSpace);
        if (svgheight < (endY + this.#objectSpace)) this.#svgContainer.setAttribute("height", (endY + this.#objectSpace));

        line.setAttribute("x1", startX);
        line.setAttribute("y1", startY);
        line.setAttribute("x2", endX);
        line.setAttribute("y2", endY);
  
    }


    #connectGeneaologyParentChild(div1_id, div2_id)
    {

        var path = document.getElementById("path_" + div1_id + '_' + div2_id);
        var startElem = document.getElementById(div1_id);
        var endElem = document.getElementById(div2_id);


        // if first element is lower than the second, swap!
        if (startElem.getBoundingClientRect().top > endElem.getBoundingClientRect().top) {
            var temp = startElem;
            startElem = endElem;
            endElem = temp;
        }

        // get (top, left) corner coordinates of the svg container   
        var svgTop = this.#mainContainer.getBoundingClientRect().top;
        var svgLeft = this.#mainContainer.getBoundingClientRect().left;

        // get (top, left) coordinates for the two elements
        var startCoord = startElem.getBoundingClientRect();
        var endCoord = endElem.getBoundingClientRect();

        // calculate path's start (x,y)  coords
        // we want the x coordinate to visually result in the element's mid point
        var startX = startCoord.left + 0.5 * startElem.offsetWidth - svgLeft;    // x = left offset + 0.5*width - svg's left offset
        var startY = startCoord.top + startElem.offsetHeight - svgTop;        // y = top offset + height - svg's top offset

        // calculate path's end (x,y) coords
        var endX = endCoord.left + 0.5 * endElem.offsetWidth - svgLeft;
        var endY = endCoord.top - svgTop;

        // check if the svg is big enough to draw the path, if not, set heigh/width
        let svgheight = this.#svgContainer.getAttribute("width");
        let svgwidth = this.#svgContainer.getAttribute("height");
        if (svgheight < (endY + this.#objectSpace)) this.#svgContainer.setAttribute("height", endY + this.#objectSpace);
        if (svgwidth < (endX + this.#objectSpace)) this.#svgContainer.setAttribute("width", (endX + this.#objectSpace));

        var deltaX = (endX - startX) * 0.15;
        var deltaY = (endY - startY) * 0.15;



        // for further calculations which ever is the shortest distance
        var delta = deltaY < this.#absolute(deltaX) ? deltaY : this.#absolute(deltaX);

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
        path.setAttribute("d", "M" + startX + " " + startY +
                " V" + (startY + delta) +
                " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (startX + delta * this.#signum(deltaX)) + " " + (startY + 2 * delta) +
                " H" + (endX - delta * this.#signum(deltaX)) +
                " A" + delta + " " + delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3 * delta) +
                " V" + endY);
    


    }


    #connectDefault(div1_id, div2_id)
    {
        var path = document.getElementById("path_" + div1_id + '_' + div2_id);
        var startElem = document.getElementById(div1_id);
        var endElem = document.getElementById(div2_id);

        // if first element is lower than the second, swap!
        if (startElem.offset().top > endElem.offset().top) {
            var temp = startElem;
            startElem = endElem;
            endElem = temp;
        }

        // get (top, left) corner coordinates of the svg container   
        var svgTop = this.#mainContainer.offset().top;
        var svgLeft = this.#mainContainer.offset().left;

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
        if (this.#svgContainer.attr("height") < endY + this.#objectSpace) this.#svgContainer.attr("height", endY + this.#objectSpace);
        if (this.#svgContainer.attr("width") < (endX + this.#objectSpace)) this.#svgContainer.attr("width", (endX + this.#objectSpace));

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


}


