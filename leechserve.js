class Leech{
  canvas;ctx;body;
  threads = null;
  workers = [];
  state = 'Loading source file...';
  display = null;
  constructor(args){ //args {visible: Bool, canvasID: String}
    this.test();
    this.body = document.getElementsByTagName("body")[0];

    if(args != undefined && args.visibleUI){ // if visible == true
      let id = "reservedDiv"+Math.floor(Math.random() * 10000); // to make sure it wont create any conflicts
      this.display = document.createElement('div');
      this.display.id = id;
      this.body.appendChild(this.display);
      this.display = document.getElementById(this.display.id);
      setTimeout(()=>{this.updateHTML()}, 10);
    }

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
      if(parent.display != null){
        parent.state = 'Decoding the source...';
        setTimeout(()=>{parent.updateHTML()},10);
        console.log('ss')
      }
      parent.canvas.width = this.width;
      parent.canvas.height = this.width;

      parent.ctx.drawImage(img, 0, 0);
      setTimeout(()=>{ //without delay ui wont update
        leech.decodeImage(function(e){
          parent.body.innerHTML = e;
  			});
      },10);
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
  updateHTML(){
    let loadingGif = "data:image/gif;base64,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"
    let html = `<div style="
    background-color: #393e46;
    position: absolute; top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
    border-radius: 30px;
    padding: 10 10 10 10;
    border-radius: 1vw;
    padding: 1vw 5vw 1vw 5vw;
    text-align: center;
    color: #eeeeee;
    ">
      <p style="color:#00adb5">leechServe 1.0</p>
      <div style="display:flex"><img style="height:2rem; margin: 0" src="${loadingGif}"><div style="line-height:2rem;position:relative; left: 0.1rem;">${this.state}</div></div>
    </div>`
    this.display.innerHTML = html;
  }
}
