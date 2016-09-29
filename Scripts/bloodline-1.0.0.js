
//SETTINGS
var linecolor = "black";
var linewidth = "6";


function registerBloodLineContainer(container_id) {
    if (typeof maincontainer != 'undefined')
        return;

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


function createPerson(pos_x, pos_y, id, label, person) {
    createObjectBox(pos_x, pos_y, id, label, person);
    $("#" + id).data("PARTNER_RELID", '');
    $("#" + id).data("PARTNER_RELID", '');
    $("#" + id).data("HAS_RENDERED_CHILDREN", 'NO');
}

function createPartner(id, label, partner_id, person) {
    var partner = document.getElementById(partner_id);
    var rect = partner.getBoundingClientRect();

    var relationdiv_id = "PARTNER-" + id + "-" + partner_id;

    createRelationBox(rect.left + 220, rect.top + 26, relationdiv_id);
    createObjectBox(rect.left + 290, rect.top, id, label, person);
    createObjectLine(partner_id, relationdiv_id, "PARTNER_TO_PARTNER");
    createObjectLine(id, relationdiv_id, "PARTNER_TO_PARTNER");

    $("#" + partner_id).data("PARTNER_RELID", relationdiv_id);
    $("#" + id).data("PARTNER_RELID", relationdiv_id);
    $("#" + id).data("HAS_RENDERED_CHILDREN", 'NO');


}

function createChild(id, label, mother_id, father_id, person) {
    var parent = document.getElementById(mother_id) || document.getElementById(father_id);
    var rect = parent.getBoundingClientRect();
    var parent_partner_rel = $("#" + parent.id).data("PARTNER_RELID");
    var parent_has_rendered_children = $("#" + parent.id).data("HAS_RENDERED_CHILDREN");
    //if (parent_has_rendered_children == "NO")
    //   last_x = 0;

    createObjectBox(last_x + 270, rect.top + 110, id, label, person);
    createObjectPath(id, parent_partner_rel, "CHILD_TO_PARENT");

    $("#" + parent.id).data("HAS_RENDERED_CHILDREN", "YES");
}