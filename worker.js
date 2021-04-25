onmessage = function(e) {
  let result = "";
  let data = e.data;
  data.map(x => {result += charsfromNum(x)});
  postMessage(result);
}
function charsfromNum(num){//takes number<255 and produces 3 chars from it. returns Array. 102 => ("1", "0", " ")
  let hundreds = this.getDigit(num, 3);
  let tens = this.getDigit(num, 2);
  let ones = this.getDigit(num, 1);
  return ""+this.charfromNum(hundreds)+this.charfromNum(tens)+this.charfromNum(ones);
}
function getDigit(number, n) {//finds (n)th num from left in a number. returns Int. (1234, 2) => 3
  return Math.floor((number / Math.pow(10, n - 1)) % 10);
}
function charfromNum(num){//reverse of numfromChar. takes number:Int and outputs corresponding char:String
    switch(num){
      case 0: return "0";
        break;
      case 1: return "1";
        break;
      case 2: return " ";
        break;
    }
}
