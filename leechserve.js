class Leech{
  canvas;ctx;body;
  threads = null;
  workers = [];
  constructor(args){ //args {visible: Bool, canvasID: String}
    this.test();
    this.body = document.getElementsByTagName("body")[0];

    if(args != undefined && args.canvasID){ //if canvas id is not specified, create one and append to document body
      this.canvas = document.getElementById(canvasID);
    }else{
      //creates this.canvas
      let id = "reservedCanvas"+Math.floor(Math.random() * 10000); // to make sure it wont create any conflicts
      this.canvas = document.createElement('canvas');
      this.canvas.id = id;
      //adds to body
      this.body.appendChild(this.canvas);
    }

    if(args != undefined && args.visible == false){
      this.canvas.style = "display:none";
    }
    this.ctx = this.canvas.getContext('2d');

    if(args != undefined && args.threads){
      if(args.threads == true){
        this.threads = navigator.hardwareConcurrency;
      }else{
        this.threads = args.threads;
      }
    }
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
    console.time("encodingSpeed");
    let bin = this.encode(input);
    let pointer = 0;

    //a*a image looks nicer but wastes some pixels, length*1 image wastes no space but most hosts wont take it
    var length = Math.ceil(bin.length/3/3);
    let a = Math.ceil(Math.sqrt(length));
    this.canvas.width = a;
    this.canvas.height = a;

    let data = this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = this.numfromChars(bin[pointer], bin[pointer+1], bin[pointer+2]);
      data.data[i + 1] = this.numfromChars(bin[pointer+3], bin[pointer+4], bin[pointer+5]);
      data.data[i + 2] = this.numfromChars(bin[pointer+6], bin[pointer+7], bin[pointer+8]);
      data.data[i + 3] = 255; //https://stackoverflow.com/a/22389411
      pointer+=9; // instead of adding 3 three times I add 9 once
    }
    this.ctx.putImageData(data,0,0);
    console.timeEnd("encodingSpeed");
  }
  decodeImage(onDone){//converts image on canvas to normal text, returns String
    console.time("decodingSpeed");
    if(this.threads != null){
      this.multiThreadedDecode(onDone);
    }else{
      return this.singleThreadedDecode(onDone);
    }
  }
  singleThreadedDecode(onDone){
    let data = this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height).data;
    let bin = "";
    for (let i = 0; i < data.length; i += 4) {
      bin += this.charsfromNum(data[i]) + this.charsfromNum(data[i+1]) + this.charsfromNum(data[i+2])
    }
    onDone(this.decode(bin));
    console.timeEnd("decodingSpeed");
  }
  multiThreadedDecode(onDone){
    let finaldata = [];
    //spawn workers
    for(let i = 0; i < this.threads; i++) {
      this.workers.push(new Worker('worker.js'));
      finaldata.push("");

      var self = this;
      this.workers[i].onmessage = function(e) {
        finaldata[i] = e.data;
        if(self.isfull(finaldata)){
          let bin = "";
          finaldata.map(x => {bin += x});
          onDone(self.decode(bin));
          console.timeEnd("decodingSpeed");
        }
      }
    }

    let data = this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height).data;
    data = this.removeEvery(data, 4);
    let workersdata = leech.splitArray(data, this.threads);

    //assign work to workers
    this.workers.map((worker, index) => {
      worker.postMessage(workersdata[index]);
    })
  }
  numfromChars(char1,char2,char3){//takes 3 chars and produces number<255. ("1", "0", " ") => 102
    return this.numfromChar(char1)*100 + this.numfromChar(char2)*10 + this.numfromChar(char3);
  }
  charsfromNum(num){//takes number<255 and produces 3 chars from it. returns Array. 102 => ("1", "0", " ")
    let hundreds = this.getDigit(num, 3);
    let tens = this.getDigit(num, 2);
    let ones = this.getDigit(num, 1);
    return ""+this.charfromNum(hundreds)+this.charfromNum(tens)+this.charfromNum(ones);
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
      switch(num){
        case 0: return "0";
          break;
        case 1: return "1";
          break;
        case 2: return " ";
          break;
      }
  }
  getDigit(number, n) {//finds (n)th num from left in a number. returns Int. (1234, 2) => 3
    return Math.floor((number / Math.pow(10, n - 1)) % 10);
  }
  loadFromUrl(url){//loads and decodes image from remote source
    let parent = this;
    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = function() {
      parent.canvas.width = this.width;
      parent.canvas.height = this.width;

      parent.ctx.drawImage(img, 0, 0);
      leech.decodeImage(function(e){
        parent.body.innerHTML = e;
			});
    }
  }
  saveAsImage(filename){//saves the encoded image
    var link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL();
    link.click();
    link.delete;
  }
  splitArray(arr, n){
    if(n > arr.length/8) n = Math.floor(arr.length/8); // make sure n is reasonable
    let result = [];

    let per = Math.floor(arr.length/n); //chars in one element
    for (var i = 0; i < n - 1; i++) {
    	result.push(arr.slice(i*per, i*per+per))
    }
    result.push(arr.slice((n-1)*per, arr.length))//last one gets 1 leftover char

    return result;
  }
  isfull(arr){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i] == "") return false;
    }
    return true;
  }
  removeEvery(arr, n){
    let thisArray = arr;
    thisArray = thisArray.filter(function(value, index) {
        return (index + 1) % n != 0;
    });
    return thisArray ;
  }
  test(){
    let text = "test, this might not work. [<''{}@%₾] [უტფ8 ტექსტი]";
    if(this.decode(this.encode(text)) == text){
      console.log('Leech loaded | OK');
    }else{
      console.log('Leech loaded | ERR');
    }
  }
  terminateWorkers(){
    for (var i = 0; i < this.threads; i++) {
      this.workers[i].terminate();
    }
  }
}
