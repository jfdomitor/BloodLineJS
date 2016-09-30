

function registerBloodLineContainer(container_id, node_click_callback)
{
    registerContainer(container_id, node_click_callback);
}


function createPerson(pos_x, pos_y, person) {
    createObjectBox(pos_x, pos_y, person);
    $("#" + person.ID).data("PARTNER_RELID", '');
    $("#" + person.ID).data("PARTNER_RELID", '');
    $("#" + person.ID).data("OBJECT_DATA", person);

}

function createPartner(person, partner_id) {
    var partner = document.getElementById(partner_id);
    var rect = partner.getBoundingClientRect();

    var relationdiv_id = "PARTNER-" + person.ID + "-" + partner_id;

    createRelationBox(rect.left + partner.clientWidth + object_space, rect.top + 27, relationdiv_id);
    createObjectBox(rect.left + partner.clientWidth + object_space + relation_div_width + object_space, rect.top, person);
    createObjectLine(partner_id, relationdiv_id, "PARTNER_TO_PARTNER");
    createObjectLine(person.ID, relationdiv_id, "PARTNER_TO_PARTNER");

    $("#" + partner_id).data("PARTNER_RELID", relationdiv_id);
    $("#" + person.ID).data("PARTNER_RELID", relationdiv_id);
    $("#" + person.ID).data("OBJECT_DATA", person);


}

function createChild(person, mother_id, father_id) {
    var parent = document.getElementById(mother_id) || document.getElementById(father_id);
    var rect = parent.getBoundingClientRect();
    var parent_partner_rel = $("#" + parent.id).data("PARTNER_RELID");
    var parent_has_rendered_children = $("#" + parent.id).data("HAS_RENDERED_CHILDREN");
   

    createObjectBox(last_x + parent.clientWidth + object_space, rect.top + parent.clientHeight + level_space, person);
    createObjectPath(person.ID, parent_partner_rel, "CHILD_TO_PARENT");

    $("#" + person.ID).data("OBJECT_DATA", person);
}