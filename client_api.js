var list = document.getElementById("list");
var taskarray = [];
var currentWaitlist = document.getElementsByClassName("customer");
var currentWaitlistInfo = [];

//Refresh data on load for most up to date waitlist
window.onload = function () {
  fetchData();
};

//Performs get request from waitlistAPI to retrieve most recent waitlist data
async function fetchData() {
  if (currentWaitlist.length > 0) {
    clearWaitlist(currentWaitlist);
  }
  const rawResponse = await fetch(
    "https://restaurant-waitlist.herokuapp.com/adminGetWaitlist",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  var response = await rawResponse.json();
  var responseobj = JSON.parse(JSON.stringify(response));
  createList(responseobj.waitlist);
}

//Creates html elements to hold waitlist data from get request, inserts position in line and stores local data about customer id,email and name
function createList(waitlist) {
  for (let i = 0; i < waitlist.length; i++) {
    var currentperson = waitlist[i];
    var customer = document.createElement("div");
    customer.setAttribute("class", "customer");
    customer.setAttribute("id", currentperson.id);
    customer.style.setProperty("--order", currentperson.id);

    var customerPosition = document.createElement("p");
    customerPosition.setAttribute("class", "customerPos");
    customerPosition.innerHTML = i + 1;
    customer.appendChild(customerPosition);

    var time = getCurrentTime(currentperson.timestamp);

    var customerInfo = document.createElement("div");
    customerInfo.innerHTML = currentperson.name + " " + time;
    customerInfo.setAttribute("class", "customerInfo");

    currentWaitlistInfo.push({
      id: currentperson.id,
      customername: currentperson.name,
      email: currentperson.email,
    });
    customer.appendChild(customerInfo);
    list.appendChild(customer);
  }
}

//Makes API request to empty the queue.
function clearQueue() {
  var data = { adminkey: "apipassword" };
  fetch("https://restaurant-waitlist.herokuapp.com/adminClearQueue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  clearWaitlist(currentWaitlist);
  return false;
}

//iterates through waitlist objects and corresponding info arrays and clears them. Used for deletion and updates to queue
function clearWaitlist(waitlist) {
  while (waitlist[0]) {
    waitlist[0].remove();
    currentWaitlistInfo.pop();
  }
}

//Retrieves locally stored customer data based on customer ID for "per user" requests such as removeCustomer()
function getNameEmail(targId) {
  for (let i = 0; i < currentWaitlistInfo.length; i++) {
    var curr = currentWaitlistInfo[i];
    if (curr["id"] == targId) {
      return [curr["customername"], curr["email"]];
    }
  }
}

function getCurrentTime(timestamp) {
  var time = timestamp.split(" ")[1].split(":");
  var hours = (time[0] % 12) - 4;
  if (hours <= 0) {
    hours = hours + 12;
  }
  var minutes = time[1];
  var currTime = hours + ":" + minutes;
  return currTime;
  //optional seconds available
  //var seconds = time[2].split(".")[0];
}
