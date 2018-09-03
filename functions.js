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
        answerElement.value = forwardSolution(question) === undefined ? 'Sem solução' : knowledgeBase[question];
    } else if (document.getElementById('backward').checked) {
        console.log('BACKWARD METHOD');
        answerElement.value = backwardSolution(question) === undefined ? 'Sem solução' : knowledgeBase[question];
    } else {
        console.log('HYBRID METHOD');
        const ret = hybridSolution(question);
        answerElement.value = ret === undefined ? 'Sem solução' : (ret ? knowledgeBase[question] : 'Contradição');
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

    return knowledgeBase[question];
}

function solveTree(root) {
    console.log('solve', root);
    if (typeof root === 'string') {
        const baseValue = knowledgeBase[root.replace(/!/g, '')];
        return baseValue === undefined ? undefined : (booleanValue(root) ? baseValue : !baseValue);
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

function treeContains(root, element) {
    if (typeof root === 'string') {
        return element === root.replace(/!/g, '');
    }
    return treeContains(root.a, element) || treeContains(root.b, element);
}

function findUndefinedElements(root) {
    if (typeof root === 'string') {
        if (knowledgeBase[root] === undefined) {
            return [root];
        }
        return [];
    }

    const ans = findUndefinedElements(root.a);
    const ret = findUndefinedElements(root.b);
    for (let i = 0; i < ret.length; i++) {
        if (ans.indexOf(ret[i]) === -1) {
            ans.push(ret[i]);
        }
    }
    return ans;

}

function backwardSolution(question, alreadyChecked = []) {
    console.log('backward', question);
    if (knowledgeBase[question] !== undefined) {
        return knowledgeBase[question];
    } else if (alreadyChecked.indexOf(question) !== -1) {
        return undefined;
    }

    alreadyChecked.push(question);
    for (let i = 0; i < rulesBase.length; i++) {
        if (treeContains(rulesBase[i].consequent, question)) {
            const sol = solveTree(rulesBase[i].antecedent);
            if (sol === undefined) {
                const needsToResolve = findUndefinedElements(rulesBase[i].antecedent);
                console.log('needsToResolve', needsToResolve);
                needsToResolve.forEach(element => {
                    backwardSolution(element)
                });

                if (solveTree(rulesBase[i].antecedent)) {
                    addToKnowledgeBase(rulesBase[i].consequent);
                }
            } else if (sol) {
                addToKnowledgeBase(rulesBase[i].consequent);
            }
        }
    }

    return knowledgeBase[question];
}

function hybridSolution(question) {
    const bkpKnowledgeBase = Object.assign({}, this.knowledgeBase);

    const forwardSol = this.forwardSolution(question);
    this.knowledgeBase = bkpKnowledgeBase;
    const backwardSol = this.backwardSolution(question);

    if (forwardSol === backwardSol === undefined) {
        return undefined;
    }
    return forwardSol === backwardSol;
}
