

/*
Register the div where you want to draw the bloodline chart
*/
function registerBloodLineContainer(container_id, node_click_callback)
{
    registerContainer(container_id, node_click_callback);
}

/*
Draws a tree (top down) based on a json object array, see documentation
*/
function createTree(top_person_id, top_person_pos_x, top_person_pos_y, person_array)
{

    $.each(person_array, function (item, value)
    {
        if (value.ID == top_person_id) {
            createPerson(top_person_pos_x, top_person_pos_y, value);
            AddFamilyMembers(value, person_array);
        }

    });


    function AddFamilyMembers(person, person_array)
    {
        var motherid = "NONE";
        var fatherid = "NONE";

        if (person.Gender == "M")
            fatherid = person.ID;
        if (person.Gender == "F")
            motherid = person.ID;

        $.each(person.Relatives, function (item, value)
        {
            if (value.Type == 'WIFE') {
                motherid = value.ID;
                var wife = findPersonByID(value.ID, person_array);
                createPartner(wife, person.ID);
            }
            if (value.Type == 'HUSB') {
                fatherid = value.ID;
                var husb = findPersonByID(value.ID, person_array);
                createPartner(husb, person.ID);
            }
        });


        $.each(person.Relatives, function (item, value) {
            if (value.Type == 'CHILD') {
                var child = findPersonByID(value.ID, person_array);

                if (motherid == "NONE" && fatherid == "NONE")
                    return true; //continue

                if (motherid == "NONE" && fatherid != "NONE") {
                    createChild(child, null, fatherid);
                }
                else if (motherid != "NONE" && fatherid == "NONE") {

                    createChild(child, motherid, null);
                }
                else {
                    createChild(child, motherid, fatherid);
                }

                AddFamilyMembers(child, person_array);
            }
        });

    }

  

}


function findPersonByID(id, person_array) {
    var ret = null;
    $.each(person_array, function (item, value) {
        if (value.ID == id) {
            ret = value;
            return false;
        }
    });

    return ret;
}


function createPerson(pos_x, pos_y, person) {
    createObjectBox(pos_x, pos_y, person);
    $("#" + person.ID).data("PARTNER_RELID", '');
    $("#" + person.ID).data("PARTNER_RELID", '');
    $("#" + person.ID).data("OBJECT_DATA", person);

}

function createPartner(person, partner_id) {
    var partner = document.getElementById(partner_id);
    var partnerrect = partner.getBoundingClientRect();

    var relationdiv_id = "PARTNER-" + person.ID + "-" + partner_id;

    createRelationBox(partnerrect.left + partner.clientWidth + object_space, partnerrect.top + 27, relationdiv_id);

    var relation = document.getElementById(relationdiv_id);
    var relrect = relation.getBoundingClientRect();

    createObjectBox(partnerrect.left + partner.clientWidth + object_space + relrect.width + object_space, partnerrect.top, person);
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