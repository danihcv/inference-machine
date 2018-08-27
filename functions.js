const regexKnowledge = /[A-Za-z][A-Za-z0-9]*\s*:\s*(true|false)(\s*,\s*[A-Za-z][A-Za-z0-9]*:\s*(true|false))*\s*/;
const regexRules = /!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*=>!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*(,!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*=>!*[A-Za-z][A-Za-z0-9]*(&&!*[A-Za-z][A-Za-z0-9]*)*)*/;
const regexMemberElements = /(&&)|(!*[A-Za-z][A-Za-z0-9]*)/g;

let knowledgeBase = {};
let rulesBase = [];
let answerElement;

class Rule {

    /**
     * @param antecedent deve ser uma Tree/string
     * @param consequent deve ser uma Tree/string
     */
    constructor(antecedent, consequent) {
        this.antecedent = antecedent;
        this.consequent = consequent;
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

    let inputKnowledge = document.getElementById('knowledge').value.replace(/\s/g, '');
    let inputRules = document.getElementById('rules').value.replace(/\s/g, '');

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

    if (document.getElementById('forward').checked) {
        console.log('FORWARD METHOD');
        answerElement.value = forwardSolution(question);
    } else if (document.getElementById('backward').checked) {
        console.log('BACKWARD METHOD');
    } else {
        console.log('HYBRID METHOD');
    }
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

function forwardSolution(question) {
    let prevKnowledgeSize = -1;
    do {
        prevKnowledgeSize = Object.keys(knowledgeBase).length;

        for (let i = 0; i < rulesBase.length; i++) {
            console.log('---');
            if (solveTree(rulesBase[i].antecedent)) {
                if (!addToKnowledgeBase(rulesBase[i].consequent)) {
                    return 'Contradição';
                }
                console.log('currKB', knowledgeBase);
            }
        }
    } while (prevKnowledgeSize !== Object.keys(knowledgeBase).length);

    return knowledgeBase[question] === undefined ? 'Sem solução' : knowledgeBase[question];
}

function solveTree(root) {
    console.log('solve', root);
    if (typeof root === 'string') {
        const baseValue = knowledgeBase[root.replace(/!/g, '')];
        return baseValue !== undefined && (booleanValue(root) ? baseValue : !baseValue);
    }
    return solveTree(root.a) && solveTree(root.b);
}

function addToKnowledgeBase(root) {
    console.log('add', root);
    if (typeof root === 'string') {
        if (knowledgeBase[root.replace(/!/g, '')] !== undefined) {
            return knowledgeBase[root.replace(/!/g, '')] === booleanValue(root);
        }
        knowledgeBase[root.replace(/!/g, '')] = booleanValue(root);
    } else {
        return addToKnowledgeBase(root.a) && addToKnowledgeBase(root.b);
    }
    return true;
}

function booleanValue(term) {
    if (term[0] === '!') {
        return !booleanValue(term.substr(1));
    }
    return true;
}