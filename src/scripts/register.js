function isPhoneNumber(input) {
    var phoneno = /^([0|\+[0-9]{1,5})?([0-9]{10})$/;
    return phoneno.test(input); 
}

function isEmail(input){      
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(input); 
}

var textboxdiv;
var textbox;
var members;
var input_nodes;

function handleSelectChange(){
    var select=document.getElementById("select");
    var event=select.options[select.selectedIndex].value;
    members = select.options[select.selectedIndex].id;
    input_nodes = document.querySelectorAll('.regMembers > div');
    console.log("EVENT: "+event+" members: "+members);
    for(var i=0;i<input_nodes.length;i++){
        textboxdiv = input_nodes[i].childNodes[1];
        textbox = textboxdiv.firstChild;
        textbox.value = '';
        if(i+2>members){
             input_nodes[i].className='clear';
            continue;
        }
        input_nodes[i].className='member_div';
    }
    document.getElementById('limit_lable').innerHTML = members;
}

function validate(){
    for(var i=0;i<members-1;i++){
        var textboxdiv = input_nodes[i].childNodes[1];
        var textbox = textboxdiv.firstChild;
        if(textbox.value == ''){
            console.log('fail'+i);
            return false
        }
        console.log('pass'+i);
    }
    document.getElementById('regTeam').submit();
    return true;
}

window.onload = handleSelectChange;
