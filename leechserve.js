class Leech{
  canvas;ctx;body;
  constructor(args){ //args {visible: Bool, canvasID: String}
    this.test();
    this.body = document.getElementsByTagName("body")[0];

    if(args.canvasID){ //if canvas id is not specified, create one and append to document body
      this.canvas = document.getElementById(canvasID);
    }else{
      //creates this.canvas
      let id = "reservedCanvas"+Math.floor(Math.random() * 10000); // to make sure it wont create any conflicts
      this.canvas = document.createElement('canvas');
      this.canvas.id = id;
      //adds to body
      this.body.appendChild(this.canvas);
    }

    if(args.visible == false){
      this.canvas.style = "display:none";
    }
    this.ctx = this.canvas.getContext('2d');
  }
  encode(input) { //converts normal text input:String to binary, returns output:String
      let output = "";
      for (let i=0; i < input.length; i++) {
       	output +=input[i].charCodeAt(0).toString(2) + " ";
      }
      return output;
  }
  decode(input){ //converts binary input:String to normal text, returns output:String
    let output = input.trim().split(" ")
      .map(item => String.fromCharCode(parseInt(item, 2)))
      .join("");
    return output;
  };
  encodeImage(input){ //takes normal text input:String, converts to binary and displays as an image
    var bin = this.encode(input);
    let pointer = 0;

    //a*a image looks nicer but wastes some pixels, length*1 image wastes no space but most hosts wont take it
    var length = Math.ceil(bin.length/3/3);
    let a = Math.ceil(Math.sqrt(length));
    this.canvas.width = a;
    this.canvas.height = a;

    let data = this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = this.numfromChars(bin[pointer], bin[pointer+1], bin[pointer+2]); pointer+=3;
      data.data[i + 1] = this.numfromChars(bin[pointer], bin[pointer+1], bin[pointer+2]); pointer+=3;
      data.data[i + 2] = this.numfromChars(bin[pointer], bin[pointer+1], bin[pointer+2]); pointer+=3;
      data.data[i + 3] = 255; //https://stackoverflow.com/a/22389411
    }
    this.ctx.putImageData(data,0,0);
  }
  decodeImage(){//converts image on canvas to normal text, returns String
    let data = this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
    let bin = "";
    for (let i = 0; i < data.data.length; i += 4) {
      for(let j = 0; j < 3; j++){
        let array = this.charsfromNum(data.data[i+j]);
        bin += array[0];
        bin += array[1];
        bin += array[2];
      }
    }
    return this.decode(bin);
  }
  numfromChars(char1,char2,char3){//takes 3 chars and produces number<255. ("1", "0", " ") => 102
    return this.numfromChar(char1)*100 + this.numfromChar(char2)*10 + this.numfromChar(char3);
  }
  charsfromNum(num){//takes number<255 and produces 3 chars from it. returns Array. 102 => ("1", "0", " ")
    let hundreds = this.getDigit(num, 3);
    let tens = this.getDigit(num, 2);
    let ones = this.getDigit(num, 1);
    return [this.charfromNum(hundreds), this.charfromNum(tens), this.charfromNum(ones)];
  }
  numfromChar(char){//reverse of charsfromNum. takes char:String and outputs corresponding number:Int
    switch(char){
      case "0": return 0;
        break;
      case "1": return 1;
        break;
      case " ": return 2;
        break;
    }
  }
  charfromNum(num){//reverse of numfromChar. takes number:Int and outputs corresponding char:String
      if(num == 0) return "0";
      if(num == 1) return "1";
      else return " ";
  }
  getDigit(number, n) {//finds (n)th num from left in a number. returns Int. (1234, 2) => 3
    return Math.floor((number / Math.pow(10, n - 1)) % 10);
  }
  loadFromUrl(url){//loads and decodes image from remote source
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = function() {
      this.canvas.width = img.width;
      this.canvas.height = img.height;

      this.ctx.drawImage(img, 0, 0);
      let html = this.decodeImage();
      this.body.innerHTML = html;
    }
  }
  saveAsImage(filename){//saves the encoded image
    var link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL();
    link.click();
    link.delete;
  }
  test(){
    let text = "test, this might not work. [<''{}@%₾] [უტფ8 ტექსტი]";
    if(this.decode(this.encode(text)) == text){
      console.log('Leech loaded | OK');
    }else{
      console.log('Leech loaded | ERR');
    }
  }
}
