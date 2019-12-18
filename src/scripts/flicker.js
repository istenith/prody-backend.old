//find the text i want to flicker
const text = document.getElementById("flicker");
console.log(text);

const doFlicker = () => {
    //logic to invert the opacity
    text.classList.toggle('clear');
        
    setTimeout(doFlicker, (Math.random()*500)+1);  
};

setTimeout(doFlicker, (Math.random()*500)+1);