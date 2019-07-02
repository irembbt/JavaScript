class Trans {
  constructor(v1, v2, sym) {
    this.state_from = v1;
    this.state_to = v2;
    this.trans_symbol = sym;
  }
}

class NFA {
  constructor(value) {
    this.states = [];
    this.transitions = [];
    this.final_state = 0;

    if (typeof value === 'string') {
      this.setStateSize(2);
      this.final_state = 1;
      this.transitions.push(new Trans(0, 1, value));
    }

    if (typeof value === 'number') {
      this.setStateSize(value);
    }
  }

  setStateSize(size) {
    for (let i = 0; i < size; i++) {
      this.states.push(i);
    }
  }

  display() {
    console.log(this.transitions);
    this.transitions.map(t => console.log(`(${t.state_from}, ${t.trans_symbol}, ${t.state_to})`))
  }
}

/*
Check if the character is alphabet
 */
function alphabet(char) {
  return char >= 'a' && char <= 'z'
}

/*
Check if the character is regexOperator
 */
function regexOperator(char) {
  return char === '(' || char === ')' || char === '*' || char === '|' || char === '+';
}

function validRegexChar(char) {
  return alphabet(char) || regexOperator(char);
}

/*
Check if the input is valid regex
 */
function validRegex(regex) {
  if (regex === '') {
    return false;
  }
  regex = regex + '';
  let regexArray = regex.split('');
  for (let i = 0; i < regexArray.length; i++) {
    if (!validRegexChar(regexArray[i])) {
      return false;
    }
  }
  return true;
}


function klenee(nfa) {
  let result = new NFA(nfa.states.length + 2);
  result.transitions.push(new Trans(0, 1, 'E'));

  nfa.transitions.forEach(function (t) {
    result.transitions.push(new Trans(t.state_from + 1,
      t.state_to + 1, t.trans_symbol));
  });

  result.transitions.push(new Trans(nfa.states.length, nfa.states.length + 1, 'E'));
  result.transitions.push(new Trans(nfa.states.length + 1, 1, 'E'));
  result.transitions.push(new Trans(0, nfa.states.length + 1, 'E'));

  result.final_state = nfa.states.length + 1;
  return result;
}

function concat(nfa1, nfa2) {
  console.log('Nfa1;');
  console.log(nfa1);
  console.log('Nfa2;');
  console.log(nfa2);
  console.log('Nfa1 length = ' + nfa1.states.length);
  console.log('Nfa2 length = ' + nfa2.states.length);

  nfa2.states.shift();

  nfa2.transitions.forEach(function (t) {
    nfa1.transitions.push(new Trans(t.state_from + nfa1.states.length - 1,
      t.state_to + nfa1.states.length -1, t.trans_symbol));
  });

  nfa2.states.forEach(function () {
    nfa1.states.push(nfa1.states.length);
  });

  nfa1.final_state = nfa1.states.length - 1;
  console.log('Final NFA;');
  console.log(nfa1);
  return nfa1;

}

function union(nfa1, nfa2) {
  console.log('Nfa1 for union;');
  console.log(nfa1);
  console.log('Nfa2 for union');
  console.log(nfa2);

  let result = new NFA(nfa1.states.length + nfa2.states.length + 2);

  result.transitions.push(new Trans(0, 1, 'E'));

  nfa1.transitions.forEach(function (t) {
    result.transitions.push(new Trans(t.state_from + 1,
      t.state_to + 1, t.trans_symbol));
  });

  result.transitions.push(new Trans(nfa1.states.length,
    nfa1.states.length + nfa2.states.length + 1, 'E'));
  result.transitions.push(new Trans(0,
    nfa1.states.length + 1, 'E'));

  nfa2.transitions.forEach(function (t) {
    result.transitions.push(new Trans(t.state_from + nfa1.states.length + 1,
      t.state_to + nfa1.states.length + 1, t.trans_symbol));
  });

  result.transitions.push(new Trans(nfa2.states.length + nfa1.states.length,
    nfa1.states.length + nfa2.states.length + 1, 'E'));

  result.final_state = nfa1.states.length + nfa2.states.length + 1;
  return result;
}

function compile(regex) {
  if (!validRegex(regex)) {
    console.log('Invalid Regular Expression Input! Please check your input');
    return new NFA();
  }
  let operators = [];
  let operands = [];
  let concat_stack = [];
  let ccflag = false; // Concat flag
  let op, c; // Current character of string
  let para_count = 0; // Counting paragraphs
  let nfa1, nfa2; // Initializing two nfa

  for (let i = 0; i < regex.length; i++) {
    c = regex.charAt(i);
    if (alphabet(c)) {
      operands.push(new NFA(c));
      if (ccflag) {
        operators.push('.');
      } else {
        ccflag = true;
      }
    } else {
      if (c === ')') {
        //ccflag = false;
        if (para_count === 0) {
          console.log('Error: Not acceptable regex syntax. Please check your input');
          return new NFA();
        } else {
          para_count--;
        }
        while (operators.length !== 0 && operators[operators.length - 1] !== ')') {
          op = operators.pop();
          if (op === '.') {
            nfa2 = operands.pop();
            nfa1 = operands.pop();
            operands.push(concat(nfa1, nfa2));
          } else if (op === '|'  || op === '+') {
            nfa2 = operands.pop();

            if (operators.length !== 0 && operators[operators.length - 1 === '.']) {
              concat_stack.push(operands.pop());
              while (operators.length !== 0 && operators[operators.length - 1 === '.']) {
                concat_stack.push(operands.pop());
                operators.pop();
              }
              nfa1 = concat(concat_stack.pop(), concat_stack.pop());
              while (concat_stack.length > 0) {
                nfa1 = concat(nfa1, concat_stack.pop());
              }
            } else {
              nfa1 = operands.pop();
            }
            operands.push(union(nfa1, nfa2));
          }

        }
      } else if (c === '*') {
        operands.push(klenee(operands.pop()));
        ccflag = true;
      } else if (c === '(') {
        operators.push(c);
        para_count++;
      } else if (c === '|' || c === '+') {
        operators.push(c);
        ccflag = false;
      }
    }
  }
  while (operators.length > 0) {
    if (operands.length === 0) {
      console.log('Wrong syntax in regex. Please check your input');
      return new NFA();
    }
    op = operators.pop();
    if (op === '.') {
      nfa2 = operands.pop();
      nfa1 = operands.pop();
      operands.push(concat(nfa1, nfa2));
    } else if (op === '|' || op === '+') {
      nfa2 = operands.pop();
      if (operators.length !== 0 && operators[operators.length - 1] === '.') {
        concat_stack.push(operands.pop());
        while (operators.length !== 0 && operators[operators.length - 1] === '.') {
          concat_stack.push(operands.pop());
          operators.pop();
        }
        nfa1 = concat(concat_stack.pop(), concat_stack.pop());
        while (concat_stack > 0) {
          nfa1 = concat(nfa1, concat_stack.pop());
        }
      } else {
        nfa1 = operands.pop();
      }
      operands.push(union(nfa1, nfa2));
    }
  }
  return operands.pop();
}

/*
let nfa_input = compile('(ab)*c');
nfa_input.display();
*/

function arrayCopy(array1, array2) {
  let length = array1.length;
  for (let i = 0; i < length; i++) {
    array2.push(array1.pop());
  }
}

function program(regex, input) {
  let nfa_input = compile(regex);
  input = input + '';
  let inputArray = input.split('');
  let stack = [];
  let stack2 = [];
  let stack3 = [];
  let initialState = 0;
  stack.push(0);
  while (stack.length !== 0) {
    let state = stack.pop();
    stack3.push(state);
    for (let i = 0; i < nfa_input.transitions.length; i++) {
      if (nfa_input.transitions[i].state_from === state && nfa_input.transitions[i].trans_symbol === 'E') {
        if (!stack.includes(nfa_input.transitions[i].state_to))
        stack.push(nfa_input.transitions[i].state_to);
      }
    }
  }
  arrayCopy(stack3, stack);
  console.log(stack);
  let inputLength = inputArray.length;
  for (let i = 0; i < inputLength; i++) {
    let char = inputArray.shift();
    console.log('Char = ' + char);
    while (stack.length !== 0) {
      let state = stack.pop();
      for (let i = 0; i < nfa_input.transitions.length; i++) {
        /*
        console.log('Look here !');
        console.log(nfa_input.transitions[i].state_from + ' ' + state);
        console.log(nfa_input.transitions[i].trans_symbol + ' ' + char);
        */
        if (nfa_input.transitions[i].state_from === state &&
          nfa_input.transitions[i].trans_symbol === char) {
          stack2.push(nfa_input.transitions[i].state_to);
          console.log(nfa_input.transitions[i].state_to);
        }
      }
    }
    if (stack2.length === 0) {
      console.log('Error occurred!');
    } else {
      console.log(stack2);
      while (stack2.length !== 0) {
        let state = stack2.pop();
        stack.push(state);
        for (let i = 0; i < nfa_input.transitions.length; i++) {
          if (nfa_input.transitions[i].state_from === state && nfa_input.transitions[i].trans_symbol === 'E') {
            stack2.push(nfa_input.transitions[i].state_to);
          }
        }
      }
      console.log('Stack2 = ' + stack2);
      console.log('Stack1 = ' + stack);
    }
  }

  console.log('Stack1 = ' + stack);

  console.log('Final state = ' + nfa_input.final_state);
  
  return stack.includes(nfa_input.final_state);
  /*while (stack.length !== 0 || stack !== undefined){
    for (let i = 0; i < nfa_input.transitions.length; i++) {
      let state = stack.pop();
      if (nfa_input.transitions[i].state_from === state &&
        (nfa_input.transitions[i].trans_symbol === 'E' ||
        nfa_input.transitions[i].trans_symbol === inputArray))
    }
  }*/
  //nfa_input.display();
}
