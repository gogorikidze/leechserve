let leechcanvas;
let ctx;
let body;
init();

function init(){
  console.log('Leech loaded');
  body = document.getElementsByTagName("body")[0];

  //create leechcanvas
  var newcanvas = document.createElement('canvas');
  newcanvas.id = "leechcanvas";
  //add to body
  body.appendChild(newcanvas);
  leechcanvas = document.getElementById('leechcanvas');
  ctx = leechcanvas.getContext('2d');
}
function encode(input) {
    let output = "";
    for (let i=0; i < input.length; i++) {
     	output +=input[i].charCodeAt(0).toString(2) + " ";
    }
    return output;
}
function decode(input){
  let output = input.trim().split(" ")
    .map(item => String.fromCharCode(parseInt(item, 2)))
    .join("");
  return output;
};
function encodeImage(input){
  var bin = encode(input);
  let pointer = 0;

  var length = Math.ceil(bin.length/3/3);
  leechcanvas.width = Math.ceil(Math.sqrt(length));
  leechcanvas.height = Math.ceil(Math.sqrt(length));

  let data = ctx.getImageData(0,0, leechcanvas.width, leechcanvas.height);
  for (let i = 0; i < data.data.length; i += 4) {
    data.data[i] = numfromChars(bin[pointer], bin[pointer+1], bin[pointer+2]); pointer+=3;
    data.data[i + 1] = numfromChars(bin[pointer], bin[pointer+1], bin[pointer+2]); pointer+=3;
    data.data[i + 2] = numfromChars(bin[pointer], bin[pointer+1], bin[pointer+2]); pointer+=3;
    data.data[i + 3] = 255;
  }
  ctx.putImageData(data,0,0);
  //console.log(data.data);
}
function decodeImage(input){
  let data = ctx.getImageData(0,0, leechcanvas.width, leechcanvas.height);
  let bin = "";
  for (let i = 0; i < data.data.length; i += 4) {
    for(let j = 0; j < 3; j++){
      let array = charsfromNum(data.data[i+j]);
      //console.log(array);
      bin += array[0];
      bin += array[1];
      bin += array[2];
    }
  }
  //console.log(decode(bin));
  return decode(bin);
}
function numfromChar(char){
  switch(char){
    case "0": return 0;
      break;
    case "1": return 1;
      break;
    case " ": return 2;
      break;
  }
}
function numfromChars(char1,char2,char3){
  return numfromChar(char1)*100 + numfromChar(char2)*10 + numfromChar(char3);
}
function charsfromNum(num){
  let hundreds = getDigit(num, 3);
  let tens = getDigit(num, 2);
  let ones = getDigit(num, 1);
  return [charfromNum(hundreds), charfromNum(tens), charfromNum(ones)];
}
function getDigit(number, n) {
  return Math.floor((number / Math.pow(10, n - 1)) % 10);
}
function charfromNum(num){
    if(num == 0) return "0";
    if(num == 1) return "1";
    else return " ";
}
function test(){
  let text = "test, this might not work. [<''{}@%₾] [უტფ8 ტექსტი]";
  encodeImage(text);
  decodeImage();
}
function loadFromUrl(url){
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = url;
  img.onload = function() {
    leechcanvas.width = img.width;
    leechcanvas.height = img.height;

    ctx.drawImage(img, 0, 0);
    let html = decodeImage();
    body.innerHTML = html;
  }
}
