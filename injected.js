addListeners();

function addListeners(){
    var isUsed = false;
    window.wasInversion = false;
    var oddsList = document.getElementById('oddsList');
    if (oddsList != null){
        oddsList.addEventListener('DOMNodeInserted', function(data){
            
            isUsed = true;
            if(data.target.id == 'f1'){
                onNodeRemoved();
            }
            isUsed = false;
        });
    }
}

function onNodeRemoved(){
    console.log('fuckin node removed');
    var neddedTableNode = null;
    var tables = oddsList.getElementsByTagName('table');
    for(var i = 0; i < tables.length; i++){
        var tableNode = tables[i];
        if(tableNode.id.indexOf('g') >= 0){
            neddedTableNode = tableNode;
            break;
        }
    }
    
    if (neddedTableNode != null){
        parseTable(neddedTableNode);
    }
}

function parseTable(tableNode){
    var rows = tableNode.rows;
    var pariNumber = getPariNumber(rows);
    var p1Index = getColIndex(rows[0], 'П1');
    var p2Index = getColIndex(rows[0], 'П2');
    if(p1Index && p2Index){
        var bet1Value = getBetValue(rows, p1Index);
        var bet2Value = getBetValue(rows, p2Index);
        console.log('(' + bet1Value + ':' + bet2Value + ')');
        if(hasInversion(pariNumber, bet1Value, bet2Value)){
            checkNeedToMakeBet(pariNumber, bet1Value, bet2Value);
        }
    }
    else{
        console.log('NOT FOUND.')
    }
}

function getColIndex(row, searchValue){
    var cols = row.getElementsByTagName('th');
    for(var i = 0; i < cols.length; i++){
        var col = cols[i];
        var colData = col.innerHTML;
        if(colData.indexOf(searchValue) >= 0){
            return i;
        }
    }
    
    return 0;
}

function getPariNumber(rows){
    var row = rows[1];
    var cols = row.getElementsByTagName('td');
    var cols = row.getElementsByTagName('td');
    var col = cols[0];
    var span = col.getElementsByTagName('span')[0];
    return span.innerHTML;
}

function getBetValue(rows, index){
    var row1 = rows[1];
    var cols = row1.getElementsByTagName('td');
    var col = cols[index];
    var iData = col.getElementsByTagName('i')[0];
    var betValue = iData.innerHTML;
    
    return betValue;
}

function getPreviousBets(pariNumber){
    var previousBetsJson = window.localStorage.getItem('Bets' + pariNumber);
    if(previousBetsJson != null){
        var previousBets = null;
        try{
            previousBets = JSON.parse(previousBetsJson);
        }
        catch(ex){
            console.log(ex);
        }
        
        return previousBets;
    }else{
        console.log('Previous bets not found');
        return null;
    }
}

function setBets(pariNumber, betP1, betP2, wasInversion){
    var bets = {betP1: betP1, betP2: betP2, wasInversion: wasInversion};
    localStorage.setItem('Bets' + pariNumber, JSON.stringify(bets));
}

function checkNeedToMakeBet(pariNumber, betP1, betP2){
    var betsObj = getBetsObj(pariNumber);
    if(betsObj != null && betsObj.betP1 && betsObj.betP2 == null){
        var s = betsObj.betP1 * betsObj.sP1;
        s2 = s - betsObj.sP1;
        var neededK2 = s / s2;
        if(neededK2 > betP2){
            setBetsObj(pariNumber, betsObj.betP1, betsObj.sP1, betP2, s2);
            console.log('Need to end pari. Make Bet for 2 user. Need set ' + s2 + 'grn');
        }
    } else if(betsObj != null && betsObj.betP2 && betsObj.betP1 == null){
        var s = betsObj.betP2 * betsObj.sP2;
        s1 = s - betsObj.sP2;
        var neededK1 = s / s1;
        if(neededK1 > betP1){
            setBetsObj(pariNumber, betP1, s1, betsObj.betP2, betsObj.sP2);
            console.log('Need to end pari. Make Bet for 1 user. Need set ' + s1 + 'grn');
        }
    } else {
        if(betP1 > betP2){
            var s1 = 3;
            if(betP1 <= 2){
                s1 = 3 / (betP1 - 1);
            }
            
            console.log('Need to start pari. Make Bet for 1 user. Need set ' + s1 + 'grn');
            setBetsObj(pariNumber, betP1, null, s1, null);
        } else if (betP2 > betP1){
            var s2 = 3;
            if(betP2 <= 2){
                s2 = 3 / (betP2 - 1);
            }
            
            console.log('Need to start pari. Make Bet for 2 user. Need set ' + s2 + 'grn');
            setBetsObj(pariNumber, null, betP2, null, s2)
        }
    }
}
function hasInversion(pariNumber, betP1, betP2){
    var previousBets = getPreviousBets(pariNumber);
    
    if(previousBets != null && previousBets.wasInversion == true){
        setBets(pariNumber, betP1, betP2, true);
        return true;
    }else if(previousBets != null) {
        var previousBetsRatio = parseFloat(previousBets.betP1) / parseFloat(previousBets.betP2);
        var betsRatio = betP1 / betP2;
        console.log('previous ratio(' + previousBets.betP1 + ':' + previousBets.betP2 + ') = ' + previousBetsRatio + ' , bets ratio(' + betP1 + ':' + betP2 + ') = ' + betsRatio + ' , wasInversion = ' + previousBets.wasInversion);
        
        if(previousBetsRatio > 1 && betsRatio < 1 ){
            setBets(pariNumber, betP1, betP2, true);
            return true;
        } else if (previousBetsRatio < 1 && betsRatio > 1){
            setBets(pariNumber, betP1, betP2, true);
            return true;
        }else{
            setBets(pariNumber, betP1, betP2, false);
        }
    }else{
        setBets(pariNumber, betP1, betP2, false);
    }
    
    return false;
}

function getBetsObj(pariNumber){
    var betsObjJson = window.localStorage.getItem('BetsObj' + pariNumber);
    if(betsObjJson != null){
        var betsObj = null;
        try{
            betsObj = JSON.parse(betsObjJson);
        }
        catch(ex){
            console.log(ex);
        }
        
        return betsObj;
    }else{
        console.log('Previous bets not found');
        return null;
    }
}

function setBetsObj(pariNumber, betP1, betP2, sP1, sP2){
    var bets = {betP1: betP1, betP2: betP2, sP1: sP1, sP2: sP2};
    localStorage.setItem('BetsObj' + pariNumber, JSON.stringify(bets));
}

function isNeedToMakeBet2(betP1, betP2){
    console.log();
    if(betP1 > betP2){
        var s1 = 3;
        var s2 = (betP1 * s1) / betP2;
        var s = s2 + s1;
        console.log('(' + betP1 + ' * ' + s1 + ' = ' + betP1 * s1 + '); (' + betP2 + ' * ' + s2 + ' = ' + betP2 * s2 + '); s = ' + s + ';');
        if(s < s1 * betP1){
            alert('URAAAAAAAAA; s2 = ' + s2);
        }
    }else if (betP1 < betP2){
        var s2 = 3;
        var s1 = (betP2 * s2) / betP1;
        var s = s1 + s2;
        console.log('(' + betP1 + ' * ' + s1 + ' = ' + betP1 * s1 + '); (' + betP2 + ' * ' + s2 + ' = ' + betP2 * s2 + '); s = ' + s + ';');
        if(s < s2 * betP2){
            alert('URAAAAAAAAA; s1 = ' + s1);
        }
    }
    
    
}

function isNeedToMakeBet(previousBetP1, previousBetP2, betP1, betP2, wasInversion){
    var previousBetsRatio = parseFloat(previousBetP1) / parseFloat(previousBetP2);
    var betsRatio = betP1 / betP2;
    console.log('previous ratio(' + previousBetP1 + ':' + previousBetP2 + ') = ' + previousBetsRatio + ' , bets ratio(' + betP1 + ':' + betP2 + ') = ' + betsRatio + ' , wasInversion = ' + wasInversion);
    
    if(previousBetsRatio > 1 && betsRatio < 1 ){
        window.wasInversion = true;
        if(betP2 > 2){
            return true;
        }
    } else if (previousBetsRatio < 1 && betsRatio > 1){
        window.wasInversion = true;
        if(betP1 > 2){
            return true;
        }
    }else if(previousBetsRatio == betsRatio && wasInversion && ((betsRatio > 1 && betP1 > 2) || (betsRatio < 1 && betP2 > 2))){
        window.wasInversion = false;
        return true;
    }
    
    return false;
}

