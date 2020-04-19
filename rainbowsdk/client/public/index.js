function checkFunc() {

  console.log("in checkFunc()");
  const socket = io.connect('http://localhost:3000/');

  var radios_issue = document.getElementsByName("Issue");
  var radios_moc = document.getElementsByName("MoC");

  var issueClicked;
  var mocClicked;

  for (var i = 0; i < radios_issue.length; i++) {
    if (radios_issue[i].checked) {
      // alert(radios_issue[i].id);
      issueClicked = radios_issue[i].id;
        break;
      }
    }

  for (var j = 0; i < radios_moc.length; i++) {
    if (radios_moc[j].checked) {
      // alert(radios_moc[i].id);
      mocClicked = radios_moc[j].id;
      break;
    }
  }

  socket.emit("addUser", issueClicked);
  console.log(`issueClick: ${issueClicked}`);
  socket.emit('Anonymous', issueClicked);
  socket.on('token', (token)=>{
    console.log(token);
    //window.open("chat.html");
    socket.emit('TEST', token);
  });


  document.getElementById("Next").disabled = true;
  alert("Please Wait while we connect you with our Administrators.\nThank you.");


}


