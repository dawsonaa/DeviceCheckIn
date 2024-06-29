let doc;
let firstnameDoc;
let lastnameDoc;
let serialDoc;

const script = document.createElement("script");
script.src =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.3.1/jspdf.umd.min.js";
script.defer = true;
script.addEventListener("load", () => {
  // Define the jsPDF library within this scope
  const jsPDF = window.jspdf.jsPDF;
  doc = new jsPDF();
  console.log("jsPDF loaded");
});
document.head.appendChild(script);

const canvas = document.getElementById("signature-pad");
let signaturePad;
const signScript = document.createElement("script");
signScript.src =
  "https://cdnjs.cloudflare.com/ajax/libs/signature_pad/1.5.3/signature_pad.min.js";
signScript.defer = true;
signScript.addEventListener("load", () => {
  signaturePad = new SignaturePad(canvas, {
    backgroundColor: "rgb(255, 255, 255)"
  });
  console.log("signature pad loaded");
});
document.head.appendChild(signScript);
const ctx = canvas.getContext("2d");

//Query required stuff

let newCustomerRequired = document
  .getElementById("new-customer")
  .querySelectorAll("input[required], textarea[required]");

const customerFirstNameElement = document.getElementById("customer-first-name");
const customerLastNameElement = document.getElementById("customer-last-name");
const customerEmailElement = document
  .getElementById("customer-email")
  .querySelector("span");
const customerPhoneElement = document
  .getElementById("customer-phone")
  .querySelector("span");
const customerAddressElement = document
  .getElementById("customer-address")
  .querySelector("span");
const customerDeviceMakeElement = document
  .getElementById("customer-device-make")
  .querySelector("span");
const customerDeviceSerialElement = document
  .getElementById("customer-device-serial")
  .querySelector("span");
const customerDeviceModelElement = document.getElementById("customer-device-model").querySelector("span");
const customerDeviceUsernameElement = document.getElementById("customer-device-username").querySelector("span");
const customerDevicePasswordElement = document.getElementById("customer-device-password").querySelector("span");
const customerDeviceSummaryElement = document
  .getElementById("customer-device-summary")
  .querySelector("span");
const submitSummary = document.getElementById("submit-Summary");

const newCustomerDiv = document.getElementById("new-customer");
const newDeviceDiv = document.getElementById("new-device");

// Get the phone number input field
const phoneInput = document.getElementById("phone");

// Add an event listener to format the input
phoneInput.addEventListener("input", (event) => {
  // Remove all non-numeric characters
  const digits = event.target.value.replace(/\D/g, "");

  // Format the number with dashes
  const formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
    6
  )}`;

  // Set the input value to the formatted number
  event.target.value = formatted;
});

const form = document.getElementById("customer-form");
const submitButton = document.getElementById("submit-button");
const confirmSubmitButton = document.getElementById("confirmSubmit-button");

function validateForm() {
  var invalidElements = [];
  var emptyRequiredFields = [];
  var invalidFormatFields = [];

  for (var i = 0; i < form.elements.length; i++) {
    if (!form.elements[i].checkValidity()) {
      invalidElements.push(form.elements[i]);
      if (
        form.elements[i].hasAttribute("required") &&
        form.elements[i].value === ""
      ) {
        emptyRequiredFields.push(form.elements[i]);
      } else {
        invalidFormatFields.push(form.elements[i]);
      }
    }
  }

  if (invalidElements.length > 0) {
    var errorMessage = "Please correct the following fields:\n";

    for (var j = 0; j < invalidElements.length; j++) {
      if (
        invalidElements[j].hasAttribute("required") &&
        invalidElements[j].value === ""
      ) {
        errorMessage +=
          invalidElements[j].labels[0].textContent +
          " (required field is empty)\n";
      } else {
        errorMessage +=
          invalidElements[j].labels[0].textContent + " (invalid format)\n";
      }
    }

    errorMessage = errorMessage.slice(0, -2); // Remove the last comma and space
    alert(errorMessage);
    return false;
  } else {
    console.log("all forms filled out successfully");
    return true;
  }
}

const lineHeight = 6;
const maxWidth = 180;
let y;
let signatureData; //START HERE

let customerNameX;
let customerNameY;
let customerNameWidth;
let deviceSerialNumberX;
let deviceSerialNumberY;
let deviceSerialNumberWidth;
let hasBeenSigned = 0;

function signPdf() {
  // Add signature and date
  const signatureX = 10;
  const signatureY = y - 20 + lineHeight * 2;
  const signatureWidth = maxWidth / 2;
  const signatureHeight = lineHeight * 4;

  //doc.rect(signatureX, signatureY, signatureWidth, signatureHeight);
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(
    signatureX,
    signatureY + signatureHeight,
    signatureX + signatureWidth + 30,
    signatureY + signatureHeight
  );

  doc.text(
    "Client Signature",
    signatureX + 5,
    1 + signatureY + signatureHeight - lineHeight / 2
  ); //signatureX + 5, 1 + signatureY + signatureHeight - (lineHeight/2))

  // Function to convert signature data to image
  const signatureToImage = (data) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = data;
    });
  };

  // Function to add signature image to PDF
  const addSignatureImageToPdf = async (imageData) => {
    try {
      const signatureImage = await signatureToImage(imageData);
      const aspectRatio = signatureImage.width / signatureImage.height;
      const imageHeight = signatureHeight - lineHeight;
      const imageWidth = imageHeight * aspectRatio;
      const imageX = signatureX + signatureWidth - imageWidth - 5;
      const imageY = signatureY + 2; // + lineHeight * 1.5;
      doc.addImage(
        signatureImage.src,
        "PNG",
        imageX + 30,
        imageY + 2,
        imageWidth,
        imageHeight
      );
      // Add date text to PDF
      const dateX = imageX + imageWidth + 10;
      const dateY = imageY + imageHeight / 2 + 5;
      //doc.setFontSize(11);
      doc.text(
        "Date: " + new Date().toLocaleDateString(),
        signatureX + 5,
        signatureY + signatureHeight + lineHeight
      ); //signatureX + 5, signatureY + signatureHeight + lineHeight
      hasBeenSigned = 1;
    } catch (error) {
      console.log(error);
    }
  };

  // Add signature to PDF when the user is done
  const saveSignature = () => {
    signatureData = signaturePad.toDataURL();
    addSignatureImageToPdf(signatureData);
  };

  // Add event listeners to signature pad
  signaturePad.onEnd = saveSignature;
}

function generatePdf() {
  doc.setFontSize(11);
  doc.setLineWidth(0.5);
  // Get the customer name and device serial number
  const customerName = firstnameDoc + " " + lastnameDoc;
  const deviceSerialNumber = serialDoc;

  console.log("Customer name generated: ", customerName);

  // Replace "_" characters in clientName and deviceSerialNumber with actual values
  const clientName = "Client Name: ";
  const clientNameUnderline = customerName;
  const deviceSerialNumberLabel = "        Device Serial Number: ";
  const deviceSerialNumberUnderline = deviceSerialNumber;

  const centerText = `Computer repairs not covered under warranty will be charged a $25 diagnostic fee, and an additional $150 if the problem can be fixed in one hour. If the repair will exceed one hour, an estimate will be created and the customer will be notified of the estimated cost to complete the repair. Should the customer choose not to continue with the repair the $25 diagnostic fee still applies. All work will be at a rate of $150/hour. YOUR COMPANY HERE Solutions is not responsible for any loss of data. By signing this form the customer agrees to pay all applicable fees before computer being returned. All merchandise must be picked up within 30-days of notification. All fees will be paid in full before merchandise is released. All merchandise left after 30-days will be considered abandoned and disposed of at the company's discretion. Disposal fees can be charged back to the customer.`;

  //const signatureAndDate = 'Client Signature ____________________________   Date ______________________';

  // Split the text into words for line breaking
  const words = (
    clientName +
    clientNameUnderline +
    "      " +
    deviceSerialNumberLabel +
    deviceSerialNumberUnderline +
    "\n \n " +
    centerText +
    "\n \n "
  ).split(" "); // + signatureAndDate
  let line = "";
  y = 10;

  // Loop through each word and break lines as needed
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const lineWidth =
      (doc.getStringUnitWidth(testLine) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;

    if (lineWidth > maxWidth) {
      doc.text(line, 10, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }

    if (words[i].includes("\n")) {
      doc.text(line, 10, y);
      line = "";
      y += lineHeight;
    }
  }

  // Output the final line
  doc.text(line, 10, y);

  // Underline the customer name and device serial number
  const underlineOffset = 1.5;
  customerNameX = doc.getTextWidth(clientName) + underlineOffset + 9;
  customerNameY = 10.5;
  customerNameWidth = doc.getTextWidth(clientNameUnderline);
  deviceSerialNumberX =
    doc.getTextWidth(clientName) +
    customerNameWidth +
    doc.getTextWidth(deviceSerialNumberLabel) +
    underlineOffset +
    16;
  deviceSerialNumberY = 10.5;
  deviceSerialNumberWidth = doc.getTextWidth(deviceSerialNumberUnderline);

  doc.line(
    customerNameX - 1,
    customerNameY + 1,
    customerNameX + customerNameWidth,
    customerNameY + 1
  );
  doc.line(
    deviceSerialNumberX - 1,
    deviceSerialNumberY + 1,
    deviceSerialNumberX + deviceSerialNumberWidth,
    deviceSerialNumberY + 1
  );
}

 let deviceMake;
  let deviceModel;
  let deviceSerial;
  let deviceUsername;
  let devicePassword;
  let deviceSummary;

    let customerFirstName;
    let customerLastName;
    let customerEmail;
    let customerPhone;
    let customerAddress;


let jsonCustomerData = "";
let jsonPdfData = "";
//form.addEventListener("submit", (event) => {
submitButton.addEventListener("click", function (event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  //newCustomerDiv.classList.add("hidden");
  submitButton.classList.add("hidden");

  submitSummary.classList.remove("hidden");
  confirmSubmitButton.classList.remove("hidden");

  //Get device information
  deviceMake = document.getElementById("device-make-1").value;
  deviceModel = document.getElementById("device-model-1").value;
  deviceSerial = document.getElementById("device-serial-1").value;
  deviceUsername = document.getElementById("device-username-1").value;
  devicePassword = document.getElementById("device-password-1").value;
  deviceSummary = document.getElementById("device-summary-1").value;

    newCustomerDiv.classList.add("hidden");
    newDeviceDiv.classList.add("hidden");

    customerFirstName = document.getElementById("first-name").value;
    customerLastName = document.getElementById("last-name").value;
    customerEmail = document.getElementById("email").value;
    customerPhone = document.getElementById("phone").value;
    customerAddress = document.getElementById("address").value;

    customerFirstNameElement.innerHTML =
      "First Name: <b>" + customerFirstName + "</b>";
    customerLastNameElement.innerHTML =
      "Last Name: <b>" + customerLastName + "</b>";
    customerEmailElement.innerHTML = "Email: <b>" + customerEmail + "</b>";
    customerPhoneElement.innerHTML = "Phone: <b>" + customerPhone + "</b>";
    customerAddressElement.innerHTML =
      "Address: <b>" + customerAddress + "</b>";
    customerDeviceMakeElement.innerHTML =
      "Device Make: <b>" + deviceMake + "</b>";
    customerDeviceSerialElement.innerHTML =
      "Device Serial: <b>" + deviceSerial + "</b>";
  if (deviceModel.trim().length != 0) {
  customerDeviceModelElement.innerHTML =
      "Device Model: <b>" + deviceModel + "</b>"; }
  if (deviceUsername.trim().length != 0) {
  customerDeviceUsernameElement.innerHTML =
      "Device Username: <b>" + deviceUsername + "</b>";}
  if (devicePassword.trim().length != 0) {  
  customerDevicePasswordElement.innerHTML =
      "Device Password: <b>" + devicePassword + "</b>";}
    customerDeviceSummaryElement.innerHTML =
      "Device Summary: <b>" + deviceSummary + "</b>";

    firstnameDoc = customerFirstName;
    lastnameDoc = customerLastName;
    serialDoc = deviceSerial;
  
  generatePdf();
  signPdf();
});

const declineButton = document.getElementById("declineSubmit-button");
declineButton.addEventListener("click", function () {
  event.preventDefault();
  // perform decline submission logic here
    newCustomerDiv.classList.remove("hidden");
  newDeviceDiv.classList.remove("hidden");
  //newCustomerDiv.classList.remove("hidden");
  submitButton.classList.remove("hidden");

  submitSummary.classList.add("hidden");
  confirmSubmitButton.classList.add("hidden");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  console.log(`Submission declined.`);
});

const confirmButton = document.getElementById("confirmSubmit-button");
confirmButton.addEventListener("click", function () {
  event.preventDefault();
  if (!hasBeenSigned == 1) {
    alert("Please sign");
    return;
  }

const customerData = {
      name: {
        first: customerFirstName,
        last: customerLastName
      },
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      device: {
        make: deviceMake,
        model: deviceModel,
        serial: deviceSerial,
        username: deviceUsername,
        password: devicePassword,
        summary: deviceSummary
      }
    };
  
jsonCustomerData = JSON.stringify(customerData);
    
  /*
    // Code to create a new Microsoft Dynamix account goes here
    const xhr = new XMLHttpRequest();
    const url =
      "https://prod-129.westus.logic.azure.com/workflows/................... Replace with Power Automate manual call link";

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(jsonCustomerData);
    */
    
    console.log("Success: new account created", jsonCustomerData);

  newDeviceDiv.classList.remove("hidden");
  newCustomerDiv.classList.remove("hidden");
  submitButton.classList.remove("hidden");

  submitSummary.classList.add("hidden");
  confirmSubmitButton.classList.add("hidden");

  form.reset();
 
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  doc.save(
    firstnameDoc + "_" + lastnameDoc + "-" + serialDoc + "_" + "repair.pdf"
  );
  hasBeenSigned = 0;
  alert("Device checked in!");
});
