
var list = document.getElementById('list');
var taskarray = [];
var currentWaitlist = document.getElementsByClassName("customer");
var currentWaitlistInfo = [];

//Refresh data on load for most up to date waitlist
window.onload = function(){
  fetchData();
}

//Performs get request from waitlistAPI to retrieve most recent waitlist data
async function fetchData() {
    if (currentWaitlist.length >0){
        clearWaitlist(currentWaitlist);
    };
    const rawResponse =  await fetch('https://restaurant-waitlist.herokuapp.com/adminGetWaitlist', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  var response = await rawResponse.json();
  var responseobj = JSON.parse(JSON.stringify(response));
  createList(responseobj.waitlist);
  }

//Creates html elements to hold waitlist data from get request, inserts position in line and stores local data about customer id,email and name
function createList(waitlist){
    for (let i=0; i<waitlist.length;i++){
        var currentperson = waitlist[i];
        var customer = document.createElement("div");
        customer.setAttribute("class","customer");
        customer.setAttribute("id",currentperson.id);
        customer.style.setProperty('--order', currentperson.id);
        
        var customerPosition = document.createElement("p");
        customerPosition.setAttribute("class","customerPos");
        customerPosition.innerHTML = i+1;
        customer.appendChild(customerPosition);

        var customerInfo = document.createElement("div");
        customerInfo.innerHTML = currentperson.name;
        customerInfo.setAttribute("class","customerInfo");

        var buttonContainer = document.createElement("div");
        buttonContainer.setAttribute("class","buttonContainer");


        var tableReadyButton = document.createElement("button");
        tableReadyButton.innerHTML = "Table Ready";
        tableReadyButton.setAttribute("class","tableReadyButton");
        tableReadyButton.setAttribute("onclick","return customerTableReady(this)");

        var removeButton = document.createElement("button");
        removeButton.innerHTML = "Remove";
        removeButton.setAttribute("class","removeButton");
        removeButton.setAttribute("onclick","return removeCustomer(this)");

        
        currentWaitlistInfo.push({"id":currentperson.id,"customername":currentperson.name,"email":currentperson.email})
        buttonContainer.appendChild(tableReadyButton);
        buttonContainer.appendChild(removeButton);
        customer.appendChild(customerInfo);
        customer.appendChild(buttonContainer);
        list.appendChild(customer);

      
    }
}


//Makes POST request to add a new customer into the queue. Customer is automatically added to end of the queue.
function addCustomer() {
    var form = document.getElementById("addCustomerForm");
    var data = {name:form.name.value, email:form.email.value,adminkey:"apipassword"};
    fetch('https://restaurant-waitlist.herokuapp.com/adminJoinWaitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => {
    console.log(response.json());
    fetchData();
  }).catch( error => {
    console.log(error);
  })

  return false;
}

//Makes API request to empty the queue. 
function clearQueue(){
  var data = {adminkey:"apipassword"};
    fetch('https://restaurant-waitlist.herokuapp.com/adminClearQueue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  clearWaitlist(currentWaitlist);
  return false;
}

//Makes DELETE request to the api for a given customer element
function removeCustomer(button){
  var customer = button.parentElement.parentElement;
  var id = customer.id;
  var deleteBody = getNameEmail(id);
  var customername = deleteBody[0];
  var customeremail = deleteBody[1];

  var data = {adminkey:"apipassword",name:customername,email:customeremail};
    fetch('https://restaurant-waitlist.herokuapp.com/adminRemoveUser', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => {
    console.log(response.json());
    //Refreshes the queue upon successful promise
    fetchData();
  }).catch( error => {
    console.log(error);
  })
  
  

  return false;
}

//POST request to https://restaurant-waitlist.herokuapp.com/adminTableReady. Endpoint notifies the user by email
//and removes them from the list. To be used when staff is ready to seat them.
function customerTableReady(button){
  var customer = button.parentElement.parentElement;
  var id = customer.id;
  var deleteBody = getNameEmail(id);
  var customername = deleteBody[0];
  var customeremail = deleteBody[1];

  var data = {adminkey:"apipassword",name:customername,email:customeremail};
    fetch('https://restaurant-waitlist.herokuapp.com/adminTableReady', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => {
    console.log(response.json());
    //Refreshes the queue upon successful promise
    fetchData();
  }).catch( error => {
    console.log(error);
  })
  
  

  return false;
}



//iterates through waitlist objects and corresponding info arrays and clears them. Used for deletion and updates to queue
function clearWaitlist(waitlist){
  while (waitlist[0]){
      waitlist[0].remove();
      currentWaitlistInfo.pop();

  }
}

//Retrieves locally stored customer data based on customer ID for "per user" requests such as removeCustomer()
function getNameEmail(targId){
  for (let i=0;i<currentWaitlistInfo.length;i++){
    var curr = currentWaitlistInfo[i];
    if (curr["id"] == targId){
      return [curr["customername"], curr["email"]]
    }
  }
}