const knowledgeRegex = /[A-Za-z][A-Za-z0-9]*\s*:\s*(true|false)(\s*,\s*[A-Za-z][A-Za-z0-9]*:\s*(true|false))*\s*/;
const rulesRegex = /!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*=>!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*(,!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*=>!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*)*/;

let knowledgeBase = {};
let rulesBase = [];
let answerElement;

class Rule {
    constructor(antecedent, consequent) {
        this.antecedent = antecedent;
        this.consequent = consequent;
    }

    antecedentHas(term) {
        return this.antecedent.match(term) !== null;
    }

    consequentHas(term) {
        return this.consequent.match(term) !== null;
    }
}

function initialize() {
    knowledgeBase = {};
    rulesBase = [];
    answerElement = document.getElementById('answer');

    let inputKnowledge = document.getElementById('knowledge').value.toLowerCase().replace(/\s/g, '');
    let inputRules = document.getElementById('rules').value.toLowerCase().replace(/\s/g, '');

    if (!isValid(inputKnowledge, knowledgeRegex)) {
        return alert('Base de conhecimento inválida');
    } else if (!isValid(inputRules, rulesRegex)) {
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
            rulesBase.push(new Rule(pair[0], pair[1]));
        }
        console.log('rules', rulesBase);
    }

    const question = document.getElementById('question').value;
}

function isValid(str, regex, acceptEmpty = true) {
    return (acceptEmpty || str !== '') && str.replace(regex, '') === '';
}