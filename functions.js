const regexKnowledge = /[A-Za-z][A-Za-z0-9]*\s*:\s*(true|false)(\s*,\s*[A-Za-z][A-Za-z0-9]*:\s*(true|false))*\s*/;
const regexRules = /!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*=>!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*(,!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*=>!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*)*/;
const regexMemberElements = /(&&)|([A-Za-z][A-Za-z0-9]*)/g;

let knowledgeBase = {};
let rulesBase = [];
let answerElement;

class Rule {

    /**
     * @param antecedent deve ser uma Tree/string
     * @param consequent deve ser uma Tree/string
     */
    constructor(antecedent, consequent) {
        this.antecedent = new Member(antecedent);
        this.consequent = new Member(consequent);
    }
}

class Member {

    /**
     * @param value deve ser uma Tree/string
     */
    constructor(value) {
        this.value = value;
    }

    has(term, root = this.value) {
        if (typeof root === 'string') {
            return root === term;
        }
        return this.has(term, root.a) || this.has(term, root.b);
    }
}

class Node {
    constructor(a, b, op) {
        this.a = a;
        this.b = b;
        this.op = op;
    }
}

function initialize() {
    knowledgeBase = {};
    rulesBase = [];
    answerElement = document.getElementById('answer');

    let inputKnowledge = document.getElementById('knowledge').value.toLowerCase().replace(/\s/g, '');
    let inputRules = document.getElementById('rules').value.toLowerCase().replace(/\s/g, '');

    if (!isValid(inputKnowledge, regexKnowledge)) {
        return alert('Base de conhecimento inválida');
    } else if (!isValid(inputRules, regexRules)) {
        return alert('Base de regras inválida');
    }

    inputKnowledge = inputKnowledge.split(',');
    if (inputKnowledge[0] !== '') {
        for (let i = 0; i < inputKnowledge.length; i++) {
            const pair = inputKnowledge[i].split(':');
            knowledgeBase[pair[0]] = Boolean(pair[1]);
        }
        console.log('knowledge', knowledgeBase);
    }

    inputRules = inputRules.split(',');
    if (inputRules[0] !== '') {
        for (let i = 0; i < inputRules.length; i++) {
            const pair = inputRules[i].split('=>');
            rulesBase.push(new Rule(generateTree(pair[0].match(regexMemberElements)),
                                    generateTree(pair[1].match(regexMemberElements))));
        }
        console.log('rules', rulesBase);
    }

    const question = document.getElementById('question').value;
}

function isValid(str, regex, acceptEmpty = true) {
    return (acceptEmpty || str !== '') && str.replace(regex, '') === '';
}

function generateTree(elements) {
    if (elements.length === 1) {
        return elements[0];
    }

    return new Node(elements[0], generateTree(elements.slice(2)), elements[1]);
}
