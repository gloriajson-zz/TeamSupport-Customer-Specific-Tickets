// ==UserScript==
// @name         Customer Specific Tickets
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Creates new tickets with saved customer data
// @author       Gloria
// @grant        none
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Dashboard*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/TicketTabs*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Tasks*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/KnowledgeBase*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Wiki*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Search*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/WaterCooler*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Calendar*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Users*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Groups*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Customer*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Product*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Asset*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Report*
// @exclude      https://app.teamsupport.com/vcr/*/TicketPreview*
// @exclude      https://app.teamsupport.com/vcr/*/Images*
// @exclude      https://app.teamsupport.com/vcr/*/images*
// @exclude      https://app.teamsupport.com/vcr/*/Audio*
// @exclude      https://app.teamsupport.com/vcr/*/Css*
// @exclude      https://app.teamsupport.com/vcr/*/Js*
// @exclude      https://app.teamsupport.com/Services*
// @exclude      https://app.teamsupport.com/frontend*
// @exclude      https://app.teamsupport.com/Frames*
// @match        https://app.teamsupport.com/vcr/*
// @require      //maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css
// @require      https://cdn.jsdelivr.net/bootstrap.native/2.0.1/bootstrap-native.js

// ==/UserScript==

// constants
var url = "https://app.teamsupport.com/api/xml/";
var orgID = "";
var token = "";
var xhr = new XMLHttpRequest();
var parser = new DOMParser();

document.addEventListener('DOMContentLoaded', main(), false);

function main(){
  console.log("main");
  if(document.getElementsByClassName('btn-toolbar').length == 1){
    var toolbar = document.getElementsByClassName("btn-toolbar")[0]
    var button = document.createElement("button");
    button.appendChild(document.createTextNode("Customer Tickets"));
    button.setAttribute("class", "btn btn-primary");
    button.setAttribute("href", "#");
    button.setAttribute("type", "button");
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#customerTickets");
    button.setAttribute("data-backdrop", "static");
    toolbar.appendChild(button);
  }

  //remove old modal and create new one when button is clicked
  button.addEventListener('click', function(e){
    if(document.getElementById("customerTickets") != null){
      var element = document.getElementById("customerTickets");
      element.parentNode.removeChild(element);
    }

    createModal();

    // if Create was clicked then send a post request
    document.getElementById('cust-create-btn').onclick = function create() {
      var customer = document.getElementById('cform-select-customer').value;
      var product = document.getElementById('cform-select-product').value;
      var type = document.getElementById('cform-select-ticket').value;
      createTickets(customer, product, type);
    }
  });
}

function createModal(){
    // create Resolved Versions modal pop up
    var modal = document.createElement("div");
    modal.className = "modal fade";
    modal.setAttribute("id", "customerTickets");
    modal.role = "dialog";
    modal.setAttribute("tabindex", -1);
    modal.setAttribute("aria-labelledby", "customerTickets");
    modal.setAttribute("aria-hidden", true);
    document.body.appendChild(modal);

    var modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog";
    modalDialog.setAttribute("role","document");
    modalDialog.id = "customerTicketsDialog";
    modal.appendChild(modalDialog);

    var modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.id = "customerTicketsContent";
    modalDialog.appendChild(modalContent);

    //create modal header
    var modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalHeader.id = "customerTicketsHeader";
    modalContent.appendChild(modalHeader);

    // create header title
    var header = document.createElement("h4");
    header.className = "modal-title";
    var hText = document.createTextNode("Create New Tickets");
    header.appendChild(hText);
    modalHeader.appendChild(header);

    // create header close button
    var hbutton = document.createElement("button");
    hbutton.setAttribute("type", "button");
    hbutton.className = "close";
    hbutton.setAttribute("data-dismiss", "modal");
    hbutton.setAttribute("aria-label", "Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden", true);
    span.innerHTML = "&times;";
    hbutton.appendChild(span);
    header.appendChild(hbutton);

    // create form in modal body
    var modalBody = document.createElement("form");
    modalBody.className="modal-body";
    modalBody.id = "customer-body";
    modalContent.appendChild(modalBody);

    populateCustomer();
    createTable();

    //create modal footer
    var modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";
    modalContent.appendChild(modalFooter);

    // create save and close buttons in modal footer
    var xbtn = document.createElement("button");
    var create = document.createTextNode("Create Ticket");
    xbtn.appendChild(create);
    xbtn.id = "cust-create-btn";
    xbtn.type = "button";
    xbtn.setAttribute("data-dismiss", "modal");
    xbtn.className = "btn btn-primary";
    var cbtn = document.createElement("button");
    var close = document.createTextNode("Close");
    cbtn.appendChild(close);
    cbtn.type = "button";
    cbtn.className = "btn btn-default";
    cbtn.setAttribute("data-dismiss", "modal");
    modalFooter.appendChild(xbtn);
    modalFooter.appendChild(cbtn);
}

function populateCustomer(){
  //create customer dropdown with options from API
  var modalBody = document.getElementById("customer-body");
  var cdropdown = document.createElement("div");
  cdropdown.className = "form-group";
  var clabel = document.createElement("label");
  clabel.setAttribute("for","cform-select-customer");
  clabel.innerHTML = "Select a Customer";
  var cselect = document.createElement("select");
  cselect.className = "form-control";
  cselect.setAttribute("id", "cform-select-customer");

  cdropdown.appendChild(clabel);
  cdropdown.appendChild(cselect);
  modalBody.appendChild(cdropdown);

  var customers = getCustomers();
  for(var n=0; n<customers.name.length; ++n){
    var option = document.createElement("option");
    option.setAttribute("value", customers.id[n].innerHTML);
    option.innerHTML = customers.name[n].innerHTML;
    cselect.appendChild(option);
  }

  //create product dropdown with options from API
  var pdropdown = document.createElement("div");
  pdropdown.className = "form-group";
  pdropdown.setAttribute("disabled", "true");
  var plabel = document.createElement("label");
  plabel.setAttribute("for","cform-select-product");
  plabel.innerHTML = "Select a Product";
  var pselect = document.createElement("select");
  pselect.className = "form-control";
  pselect.setAttribute("id", "cform-select-product");

  pdropdown.appendChild(plabel);
  pdropdown.appendChild(pselect);
  modalBody.appendChild(pdropdown);

  document.getElementById('cform-select-customer').onchange = function create() {
    //change product whenever customer changes
    var customerID = document.getElementById('cform-select-customer').value;
    changeProduct(customerID);
  }

  //create ticket type dropdown with options from API
  var tdropdown = document.createElement("div");
  tdropdown.className = "form-group";
  var tlabel = document.createElement("label");
  tlabel.setAttribute("for","cform-select-ticket");
  tlabel.innerHTML = "Select a Ticket Type";
  var tselect = document.createElement("select");
  tselect.className = "form-control";
  tselect.setAttribute("id", "cform-select-ticket");

  tdropdown.appendChild(tlabel);
  tdropdown.appendChild(tselect);
  modalBody.appendChild(tdropdown);

  var types = getTicketTypes();
  for(var t=0; t<types.name.length; ++t){
    option = document.createElement("option");
    option.setAttribute("value", types.id[t].innerHTML);
    option.innerHTML = types.name[t].innerHTML;
    tselect.appendChild(option);
  }
}

//change the product options based on customerID
function changeProduct(customerID){
  document.getElementById("cform-select-product").innerHTML = "";
  if(customerID.length == 0) document.getElementById("cform-select-product").innerHTML = "<option></option>";
  else {
    //get customer specific products from API
    var queryURL = url + "Customers/" + customerID + "/Products";
    xhr.open("GET", queryURL, false, orgID, token);
    xhr.send();
    var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
    var id = xmlDoc.getElementsByTagName("ProductID");
    var name = xmlDoc.getElementsByTagName("Product");

    //populate product dropdown
    var prodDropDown = document.getElementById("cform-select-product");
     for(var i=0; i<name.length; ++i){
       var c = document.createElement("option");
       c.value = id[i].innerHTML;
       c.text = name[i].innerHTML;
       prodDropDown.options.add(c);
    }
  }
}

function getCustomers(){
  //get all the customers through the API
  var queryURL = url + "Customers";
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  var customerID = xmlDoc.getElementsByTagName("OrganizationID");
  var customerName = xmlDoc.getElementsByTagName("Name");

  return {
    id: customerID,
    name: customerName
  };
}

function getTicketTypes(){
  // getting ticket types from api
  var queryURL = url + "Properties/TicketTypes";
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  var ticketTypeID = xmlDoc.getElementsByTagName("TicketTypeID");
  var ticketTypeName = xmlDoc.getElementsByTagName("Name");
  return {
    id: ticketTypeID,
    name: ticketTypeName
  }
}

function createTable(){
  //creating table with addable and editable tickets
  var modalBody = document.getElementById("customer-body");
  var div = document.createElement("div");
  div.setAttribute("class", "table-editable");

  var plus = document.createElement("span");
  plus.setAttribute("class", "table-add glyphicon glyphicon-plus");
  plus.style.color = "#7FFF00";
  plus.style.cursor = "pointer";

  var table = document.createElement("table");
  table.setAttribute("id", "tableCustomerTickets");
  table.setAttribute("class", "table");
  table.setAttribute("style","table-layout:fixed");

  var trh = document.createElement("tr");
  trh.setAttribute("style", "border-bottom:1px solid #DCDCDC");
  var th1 = document.createElement("th");
  th1.style.width = "300px";
  var th2 = document.createElement("th");
  var th3 = document.createElement("th");
  var thadd = document.createElement("th");
  thadd.style.width = "10px";
  thadd.appendChild(plus);

  th1.innerHTML = "Name of Ticket";
  th2.innerHTML = "Priority";
  th3.innerHTML = "Est. Dev. Days";
  trh.appendChild(th1);
  trh.appendChild(th2);
  trh.appendChild(th3);
  trh.appendChild(thadd);

  var trb = document.createElement("tr");
  trb.setAttribute("style", "border-bottom:1px solid #DCDCDC");
  var td1 = document.createElement("td");
  td1.setAttribute("class","ticket_titles");
  var td2 = document.createElement("td");
  td2.setAttribute("class","ticket_priorities");
  var td3 = document.createElement("td");
  td3.setAttribute("class","ticket_devdays");

  //create priority drop down
  var prioritySelect = document.createElement("select");
  prioritySelect.className = "form-control";
  prioritySelect.setAttribute("class", "cform-select-priority");
  var hoption = document.createElement("option");
  hoption.innerHTML = "High";
  hoption.value = "High";
  var moption = document.createElement("option");
  moption.innerHTML = "Medium";
  moption.value = "Medium";
  var loption = document.createElement("option");
  loption.innerHTML = "Low";
  loption.value = "Low";
  prioritySelect.appendChild(hoption);
  prioritySelect.appendChild(moption);
  prioritySelect.appendChild(loption);

  //adding content to row
  td1.innerHTML = "Untitled";
  td1.setAttribute("contenteditable", "true");
  td1.style.padding = "5px";
  td2.appendChild(prioritySelect);
  td2.style.padding = "5px";
  td3.innerHTML = "0.00";
  td3.style.padding = "5px";
  td3.setAttribute("contenteditable", "true");

  //appending to document
  trb.appendChild(td1);
  trb.appendChild(td2);
  trb.appendChild(td3);
  table.appendChild(trh);
  table.appendChild(trb);
  div.appendChild(table);
  modalBody.appendChild(div);

  //creating row that will be cloned when + clicked
  var tdDelete = document.createElement("span");
  var newtrb = trb.cloneNode(true);
  tdDelete.setAttribute("class", "table-remove glyphicon glyphicon-remove");
  tdDelete.setAttribute("style", "color:#8B0000");
  tdDelete.style.width = "10px";
  tdDelete.style.padding = "10px";
  tdDelete.style.cursor = "pointer";
  tdDelete.setAttribute("onclick", "javascript:{"+
    "var row = this.parentNode;"+
    "row.parentNode.removeChild(row);"+
  "}");

  newtrb.appendChild(tdDelete);

  //+ clicked so adding clone
  plus.addEventListener('click', function(e){
    var clonetrb = newtrb.cloneNode(true);
    table.appendChild(clonetrb);
  });

  // x clicked so deleting clone
  tdDelete.addEventListener('click', function(e){
    var row = this.parentNode.parentNode;
    row.parentNode.removeChild(row);
  });
}

function createTickets(customer, product, type){
    // loop through the tickets and create them
    var len = document.getElementsByClassName("ticket_titles").length;
    var table = document.getElementById("tableCustomerTickets");
    var titles = document.getElementsByClassName("ticket_titles");
    var devDays = document.getElementsByClassName("ticket_devdays");
    var priorities = document.getElementsByClassName('cform-select-priority');
    var statusid = "55067";

    //change ticket status id based on ticket type (all new ids are different)
    if(type == "10328"){
      statusid = "55075";
    }else if(type == "10329"){
      statusid = "55085";
    }else if(type == "10330"){
      statusid = "55097";
    }else if(type == "10331"){
      statusid = "93204";
    }else if(type == "10332"){
      statusid = "100464";
    }else if(type == "10333"){
      statusid = "302815";
    }else{
      statusid = "55067";
    }

    for(var t=0; t<len; ++t){
        var title = titles[t].innerHTML;
        var est = devDays[t].innerHTML;
        var priority = priorities[t].value;

        var data =
          '<Ticket>' +
            '<TicketStatusID>' + statusid + '</TicketStatusID>' +
            '<CustomerID>' + customer + '</CustomerID>'+
            '<ProductID>' + product + '</ProductID>'+
            '<TicketTypeId>' + type + '</TicketTypeId>'+
            '<Name>' + title + '</Name>'+
            '<Estimatedevdays>' + Number(est).toFixed(2) + '</Estimatedevdays>'+
            '<Severity>' + priority + '</Severity>'+
          '</Ticket>';

        var xmlData = parser.parseFromString(data,"text/xml");
        var putURL = url + "tickets";
        xhr.open("POST", putURL, false, orgID, token);
        xhr.send(xmlData);
    }

    //force reload so website reflects resolved version change
    location.reload();
}
