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
    #allowDragdrop = true;

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

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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
            let pathtype = svgcontent.dataset.PATHTYPE;
            let divarr = svgcontent.id.split("_");

            //alert(divarr[1]+' - ' + divarr[2]);

            if (pathtype == "CHILD_TO_PARENT" || pathtype == "PARENT_TO_CHILD") {
                //this.#connectDefault(divarr[1], divarr[2]);
                this.#connectGenealogyParentChild(divarr[1], divarr[2]);
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
            let motherid = "NONE";
            let fatherid = "NONE";

            if (person.Gender == "M")
                fatherid = person.ID;
            if (person.Gender == "F")
                motherid = person.ID;

            person.Relatives.forEach(value=>
            {
                if (value.Type == 'WIFE') {
                    motherid = value.ID;
                    let wife = instance.#findPersonByID(value.ID, person_array);
                    instance.#createPartner(wife, person.ID);
                }
                if (value.Type == 'HUSB') {
                    fatherid = value.ID;
                    let husb = instance.#findPersonByID(value.ID, person_array);
                    instance.#createPartner(husb, person.ID);
                }
            });


            person.Relatives.forEach(value=>
            {
                if (value.Type == 'CHILD') {
                    let child = instance.#findPersonByID(value.ID, person_array);

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
        let ret = null;
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
        let partnerEl = document.getElementById(partner_id);
        let partnerrect = partnerEl.getBoundingClientRect();

        let relationdiv_id = "PARTNER-" + person.ID + "-" + partner_id;

        this.#createRelationBox(partnerrect.left + partnerEl.clientWidth + this.#objectSpace, partnerrect.top + 27, relationdiv_id);

        let relation = document.getElementById(relationdiv_id);
        let relrect = relation.getBoundingClientRect();

        this.#createObjectBox(partnerrect.left + partnerEl.clientWidth + this.#objectSpace + relrect.width + this.#objectSpace, partnerrect.top, person);
        this.#createObjectLine(partner_id, relationdiv_id, "PARTNER_TO_PARTNER");
        this.#createObjectLine(person.ID, relationdiv_id, "PARTNER_TO_PARTNER");

        let personEl = document.getElementById(person.ID);

        partnerEl.dataset.PARTNER_RELID = relationdiv_id;
        personEl.dataset.PARTNER_RELID = relationdiv_id;
        personEl.dataset.OBJECT_DATA = person;
        
    }

    #createChild(person, mother_id, father_id) {
        let parent = document.getElementById(mother_id) || document.getElementById(father_id);
        let rect = parent.getBoundingClientRect();
        let parent_partner_rel = parent.dataset.PARTNER_RELID;

        this.#createObjectBox(this.#last_x + parent.clientWidth + this.#objectSpace, rect.top + parent.clientHeight + this.#levelSpace, person);
        this.#createObjectPath(person.ID, parent_partner_rel, "CHILD_TO_PARENT");

        let personEl=document.getElementById(person.ID);
        personEl.dataset.OBJECT_DATA = person;
    }


    #createRelationBox(pos_x, pos_y, id) {
        let div = document.createElement("div");
        div.id = id;

        div.setAttribute('style', 'position:absolute; top:' + pos_y + 'px; left:' + pos_x + 'px');
        div.setAttribute('class', 'relationchartobject');

        if (this.#allowDragdrop)
        {
            div.addEventListener('ondrop', this.#handleObjectDrop);
            div.addEventListener('ondragover',this.#handleDragOver);
            div.setAttribute('draggable', 'true');
            div.addEventListener('ondragstart', this.#handleDragStart);
        }

        this.#mainContainer.append(div);

        this.#last_x = pos_x;
    }


    #createObjectBox(pos_x, pos_y,  object_data) 
    {
   
        let test = document.elementFromPoint(pos_x, pos_y)
        if (test)
        {
            if (test.id != "chartcontainer")
            {
                const divs = document.querySelectorAll('div');
                divs.forEach(box => {
                    if (box.offsetLeft + box.clientWidth >= pos_x)
                    {
                        let rect = box.getBoundingClientRect();
                        box.setAttribute('style', 'position:absolute; top:' + pos_y + 'px; left:' + (rect.left + box.clientWidth + (this.#objectSpace * 2)) + 'px');
                    }
                });

            }
        }

        let div = document.createElement("div");
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
            div.addEventListener('ondrop', this.#handleObjectDrop);
            div.addEventListener('ondragover', this.#handleDragOver);
            div.setAttribute('draggable', 'true');
            div.addEventListener('ondragstart', this.#handleDragStart);
        }

        let fullname = document.createElement("p");
        fullname.id = object_data.ID + "-FULLNAME";
        fullname.setAttribute('class', 'chartobject_paragraph');
        fullname.addEventListener('onClick', this.#onNodeClick)
        fullname.innerText = object_data.FullName || '';
        div.appendChild(fullname);

        let birthdate = document.createElement("p");
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
        let svgNS = "http://www.w3.org/2000/svg";
        let p = document.createElementNS(svgNS,"path");
        p.setAttributeNS(null, 'id', 'path_' + obj1_id + '_' + obj2_id);
        p.setAttributeNS(null, 'd', 'M0 0');

        this.#svgContainer.append(p);

        p.dataset.PATHTYPE = pathtype;
        p.dataset.START_ELEMENT_ID = obj1_id;
        p.dataset.END_ELEMENT_ID = obj2_id;
    
    }

    #createObjectLine(obj1_id, obj2_id, pathtype) {
        let svgNS = "http://www.w3.org/2000/svg";
        let line = document.createElementNS(svgNS, "line");
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
        let style = window.getComputedStyle(ev.target, null);
        let transdata = { dragged_id: '-', leftoffset: 0, topoffset: 0 };
        transdata.dragged_id = ev.target.id;
        transdata.leftoffset = (parseInt(style.getPropertyValue("left"), 10) - ev.clientX);
        transdata.topoffset = (parseInt(style.getPropertyValue("top"), 10) - ev.clientY);
        ev.dataTransfer.setData("text", JSON.stringify(transdata));
    }

    

    #handleObjectDrop(ev)
    {
        let transdata = JSON.parse(ev.dataTransfer.getData("text"));
        let element = document.getElementById(transdata.dragged_id);
        if (transdata.dragged_id.indexOf("PARTNER-") > -1) {
            element.setAttribute('style', 'position:absolute; top:' + (ev.clientY + parseInt(transdata.topoffset, 10)) + 'px; left:' + (ev.clientX + parseInt(transdata.leftoffset, 10)) + 'px;width:20px;height:10px');
        } else {
            element.setAttribute('style', 'position:absolute; top:' + (ev.clientY + parseInt(transdata.topoffset, 10)) + 'px; left:' + (ev.clientX + parseInt(transdata.leftoffset, 10)) + 'px');
        }
  
        drawTree();

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
        let line = document.getElementById("line_" + div1_id + '_' + div2_id);
        let startElem = document.getElementById(div1_id);
        let endElem = document.getElementById(div2_id);


        // if first element is lower than the second, swap!
        if (startElem.getBoundingClientRect().left < endElem.getBoundingClientRect().left) {
            let temp = startElem;
            startElem = endElem;
            endElem = temp;
        }

        // get (top, left) corner coordinates of the svg container   
        let svgTop = this.#mainContainer.getBoundingClientRect().top;
        let svgLeft = this.#mainContainer.getBoundingClientRect().left;

        // get (top, left) coordinates for the two elements
        let startCoord = startElem.getBoundingClientRect();
        let endCoord = endElem.getBoundingClientRect();

        let startX = startCoord.left + startElem.offsetWidth - svgLeft;
        let startY = startCoord.top + 0.5 * startElem.offsetHeight - svgTop;

        let endX = endCoord.left - svgLeft;
        let endY = endCoord.top + (0.5 * endElem.offsetHeight) - svgTop;

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


  
    #connectGenealogyParentChild(div1_id, div2_id) {
        let path = document.getElementById(`path_${div1_id}_${div2_id}`);
        let startElem = document.getElementById(div1_id);
        let endElem = document.getElementById(div2_id);
    
        // Ensure startElem is always above endElem
        if (startElem.getBoundingClientRect().top > endElem.getBoundingClientRect().top) {
            [startElem, endElem] = [endElem, startElem]; // Swap using destructuring
        }
    
        // Get SVG container's position
        const { top: svgTop, left: svgLeft } = this.#mainContainer.getBoundingClientRect();
        const adjustedSvgTop = svgTop + window.scrollY;
        const adjustedSvgLeft = svgLeft + window.scrollX;
    
        // Get element positions relative to the document
        const startRect = startElem.getBoundingClientRect();
        const endRect = endElem.getBoundingClientRect();
    
        // Calculate start (x, y) coordinates (midpoint of element)
        const startX = startRect.left + window.scrollX + 0.5 * startElem.offsetWidth - adjustedSvgLeft;
        const startY = startRect.top + window.scrollY + startElem.offsetHeight - adjustedSvgTop;
    
        // Calculate end (x, y) coordinates
        const endX = endRect.left + window.scrollX + 0.5 * endElem.offsetWidth - adjustedSvgLeft;
        const endY = endRect.top + window.scrollY - adjustedSvgTop;
    
        // Ensure the SVG container is big enough
        this.#updateSvgSize(endX, endY);
    
        // Calculate control points for smooth curves
        const deltaX = (endX - startX) * 0.15;
        const deltaY = (endY - startY) * 0.15;
        let delta = Math.min(Math.abs(deltaX), deltaY) + 10; // Adjust curve lines
    
        // Set arc directions (determines curve direction)
        const [arc1, arc2] = startX > endX ? [1, 0] : [0, 1];
    
        // Generate the SVG path data
        const pathData = `
            M ${startX} ${startY}
            V ${startY + delta}
            A ${delta} ${delta} 0 0 ${arc1} ${startX + delta * Math.sign(deltaX)} ${startY + 2 * delta}
            H ${endX - delta * Math.sign(deltaX)}
            A ${delta} ${delta} 0 0 ${arc2} ${endX} ${startY + 3 * delta}
            V ${endY}
        `.trim();
    
        // Apply the path data
        path.setAttribute("d", pathData);
    }
    
    // Helper function to update SVG size dynamically
    #updateSvgSize(endX, endY) {
        const objectSpace = this.#objectSpace;
        const svg = this.#svgContainer;
    
        const currentHeight = parseFloat(svg.getAttribute("height") || 0);
        const currentWidth = parseFloat(svg.getAttribute("width") || 0);
    
        if (currentHeight < endY + objectSpace) {
            svg.setAttribute("height", endY + objectSpace);
        }
        if (currentWidth < endX + objectSpace) {
            svg.setAttribute("width", endX + objectSpace);
        }
    }
    

    #connectDefault(div1_id, div2_id) {
        let path = document.getElementById(`path_${div1_id}_${div2_id}`);
        let startElem = document.getElementById(div1_id);
        let endElem = document.getElementById(div2_id);
    
        // Swap elements if needed (ensure startElem is always higher)
        if (startElem.getBoundingClientRect().top > endElem.getBoundingClientRect().top) {
            [startElem, endElem] = [endElem, startElem]; // Swap using destructuring
        }
    
        // Get SVG container's position
        const svgRect = this.#mainContainer.getBoundingClientRect();
        const svgTop = svgRect.top + window.scrollY;
        const svgLeft = svgRect.left + window.scrollX;
    
        // Get element positions relative to the document
        const startRect = startElem.getBoundingClientRect();
        const endRect = endElem.getBoundingClientRect();
    
        // Calculate start (x, y) coordinates
        const startX = startRect.left + window.scrollX + 0.5 * startElem.offsetWidth - svgLeft;
        const startY = startRect.top + window.scrollY + startElem.offsetHeight - svgTop;
    
        // Calculate end (x, y) coordinates
        const endX = endRect.left + window.scrollX + 0.5 * endElem.offsetWidth - svgLeft;
        const endY = endRect.top + window.scrollY - svgTop;
    
        // Ensure the SVG container is big enough
        this.#updateSvgSize(endX, endY);
    
        // Calculate control points for smooth curves
        const deltaX = (endX - startX) * 0.15;
        const deltaY = (endY - startY) * 0.15;
        const delta = Math.min(Math.abs(deltaX), deltaY);
    
        // Set sweep flags for arc directions
        const [arc1, arc2] = startX > endX ? [1, 0] : [0, 1];
    
        // Generate the SVG path data
        const pathData = `
            M ${startX} ${startY}
            V ${startY + delta}
            A ${delta} ${delta} 0 0 ${arc1} ${startX + delta * Math.sign(deltaX)} ${startY + 2 * delta}
            H ${endX - delta * Math.sign(deltaX)}
            A ${delta} ${delta} 0 0 ${arc2} ${endX} ${startY + 3 * delta}
            V ${endY}
        `.trim();
    
        // Apply the path data
        path.setAttribute("d", pathData);
    }
    
     
}


