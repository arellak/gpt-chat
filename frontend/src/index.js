// @ts-nocheck

function setAPIKey(){
  const apiKey = document.querySelector(".apiInput").value;
  fetch("http://127.0.0.1:3000/apiKey", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        key: apiKey
      })
    })
    .then(response => response.json())
    .then(data => {
      if(data.message === "Invalid api key."){
        document.querySelector(".apiInput").value = "";
        document.querySelector(".apiInput").placeholder = "Invalid api key.";
        return;
      }
      else {
        window.localStorage.setItem("apiKey", apiKey);
        keyIsSet();
      }
    }
  );
}

async function generate(){
  const content = document.querySelector(".input").value;

  if(content === "") {
    emptyInput();
    return;
  }

  addContextToStorage({"role": "user", "content": content});
  clearInput();
  await fetch("http://127.0.0.1:3000/chatapi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "role": "user",
      "content": content,
      "messages": window.localStorage.getItem("context"),
      apiKey: window.localStorage.getItem("apiKey")
    })
  })
  .then(response => response.json())
  .then(data => {
    addContextToStorage({"role": "assistant", "content": data.content});
    addContent(content, data.content);
  });
}

function addContextToStorage(msg){
  const currentContext = JSON.parse(window.localStorage.getItem("context"));
  if(currentContext === null){
    window.localStorage.setItem("context", JSON.stringify([msg]));
  }
  else {
    const newContext = [];
    currentContext.forEach(context => {
      newContext.push(context);
    });
    newContext.push(msg);
    window.localStorage.setItem("context", JSON.stringify(newContext));
  }
}


function addContent(lastInput, lastOutput){
  const input = document.createElement("p");
  input.innerText = `You: ${lastInput}`;
  input.classList.add("user_input");

  const output = document.createElement("p");
  output.innerText = `Bot: ${lastOutput}`;
  output.classList.add("bot_output");

  document.querySelector(".outputDiv").appendChild(input);
  document.querySelector(".outputDiv").appendChild(output);
  window.scrollTo(0, document.body.scrollHeight);
}

/*
  * This function checks if the api key is set.
  * If it is set, it will display the main container.
  * If it is not set, it will display the api container.
*/
function keyIsSet(){
  if(window.localStorage.getItem("apiKey") !== null){
    document.querySelector(".main-container").style.display = "flex";
    document.querySelector(".outputDiv").style.display = "block";
    document.querySelector(".apiContainer").style.display = "none";
  }
  else {
    document.querySelector(".main-container").style.display = "none";
    document.querySelector(".outputDiv").style.display = "none";
    document.querySelector(".apiContainer").style.display = "block";
  }
}

function logout(){
  window.localStorage.removeItem("apiKey");
  keyIsSet();
}

function resetSession(){
  window.localStorage.removeItem("context");
  window.location.reload();
}

function emptyInput(){
  addContent("emptiness..", "I'm sorry, I don't understand.");
}

function clearInput(){
  document.querySelector(".input").value = "";
}


// utility stuff
window.addEventListener("load", () => {
  keyIsSet();
});

document.querySelector(".input").addEventListener("keydown", function(event){
  if(event.key === "Enter"){
    generate();
  }
});