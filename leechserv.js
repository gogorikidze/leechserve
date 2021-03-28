let leechcanvas;
let leechimage;
let ctx;
init();

function init(){
  console.log('Leech loaded');
  //create leechcanvas
  var newcanvas = document.createElement('canvas');
  newcanvas.id = "leechcanvas";
  //add to body
  var body = document.getElementsByTagName("body")[0];
  body.appendChild(newcanvas);
  leechcanvas = document.getElementById('leechcanvas');
  ctx = leechcanvas.getContext('2d');

  //create leechimage
  var newImage = document.createElement('img');
  newImage.id = "leechImage";
  //add to body
  body.appendChild(newImage);
  leechImage = document.getElementById('leechImage');
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

  var length = Math.ceil(bin.length/3);
  leechcanvas.width = Math.ceil(Math.sqrt(length));
  leechcanvas.height = Math.ceil(Math.sqrt(length));

  let data = ctx.getImageData(0,0, leechcanvas.width, leechcanvas.height);
  for (let i = 0; i < data.data.length; i += 4) {
    data.data[i] = numfromChar(bin[pointer]); pointer++
    data.data[i + 1] = numfromChar(bin[pointer]); pointer++
    data.data[i + 2] = numfromChar(bin[pointer]); pointer++
    data.data[i + 3] = 255;
  }
  ctx.putImageData(data,0,0);
}
function decodeImage(input){
  let data = ctx.getImageData(0,0, leechcanvas.width, leechcanvas.height);
  let bin = "";
  for (let i = 0; i < data.data.length; i += 4) {
    bin += charfromNum(data.data[i]);
    bin += charfromNum(data.data[i+1]);
    bin += charfromNum(data.data[i+2]);
  }
  console.log(decode(bin));
  return decode(bin);
}
function numfromChar(char){
  switch(char){
    case "0": return 255;
      break;
    case "1": return 125;
      break;
    case " ": return 0;
      break;
  }
}
function charfromNum(num){
    if(num == 255) return "0";
    if(num == 125) return "1";
    else return " ";
}
function test(){
  let text = "test, this might not work. [<''{}@%₾] [უტფ8 ტექსტი]";
  encodeImage(text);
  decodeImage();
}
function loadFromUrl(url){
  leechImage.src = url;
  leechImage.onload = function(){
    leechcanvas.width = leechImage.width;
    leechcanvas.height = leechImage.height;

    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      let html = decodeImage();
      document.getElementsByTagName("body")[0].innerHTML = html;
    }
  }
}
