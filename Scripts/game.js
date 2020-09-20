/*--------------------------------------------------------
Üldised funktsioonid, mis reageerivad nuppudele
-------------------------------------------------------*/
/*funktsioon, mis regeerib kasutajapoolsele Play music/Mute nupule*/
function music(button){
    try{
	  var audio = document.getElementsByTagName("audio")[0];
      if(button.value!="Pause"){
        audio.play();
        button.value="Pause";
      }else{
        audio.pause();
        button.value="Play music";
       
      }
    }catch(e){
      console.log(e);
    }
}
/*Nupuvajuts, mis peidab/näitab järgmist 3 kuulikest, mis tuleb lauale*/
function hideNext(button){
    try{
      if(button.value=="Hide next"){
        button.value="Show next";
        showNext=false;
        seenNext=true;
        for(i=0;i<3 ;i++){
        var stl="Images/cell.png";
        //alert(i+" "+next[i]);
        document.getElementById("next"+(i+1)).src=stl;
    }
      }else{
        button.value="Hide next";
        showNext=true;
        addToNext();
      }
    }catch(e){
      //alert(e);
    }
}
/*Credits nupp*/
function credits(){
    alert("Color Lines v2.0\nCopyright 2020 Elar");
}
/*Lehe laadimisel toimub väikene kontroll*/
function checkSettings(){
  if(screen.width<800 || screen.height<600){
    alert("You should increase your display resolution to see full gameboard");
  }
   try{
        document.getElementById("music").value="Mute";
    }catch(e){
    }
}
/*debug functions*/
function textTable(brd){
    tmp=""
    for(i=0;i<brd.length;){ 
        for(j=0;j<9 && i<brd.length;j++,i++){
            tmp+=brd[i]+" ";
        }
        tmp+="\n";
    }
    return tmp;
}
function createTable(brd){
    document.write("<table width='200'>"); 
    for(i=0;i<brd.length;){
        document.write("<tr>"); 
        for(j=0;j<9;j++,i++){
            document.write("<td align='center'>"+brd[i]+"</td>");
        }
        document.write("</tr>"); 
    }
    document.write("</tabel>"); 
}
/*--------------------------------------------------------
Mängu sisemised protseduurid
-------------------------------------------------------*/

//funktsioon, mis genereerib meile järgmised nupud
//num annab ette mittu numbrit lisatakse next massiivi
function generateNext(num){
    next=new Array();
    //vastavalt kasutaja poolt valitud tasemele
    if(level>7) lv=7;
    else lv=level;
    for(i=0;i<num;i++){
        next[i]=Math.ceil(Math.random()*lv);
        //next[i]=3;
    }
}

//funktsioon, mis paneb etteantud massiivi meile vajalikud numbrid
function clearBoard(brd,val){
    for(i=0;i<brd.length;i++){
        brd[i]=val;
    }
    return;
}

//funktsioon, mis leiab palju on laual tühjasid ruute
function emptyCells(){
    var tmp=new Array();
    for(k=0;k<board.length;k++){
        if(board[k]==0){
            tmp.push(k);
        }
    }
    return tmp;
}

//funktsioon, mis kontrollib, ega antud start punktis ei ole ühtegi rida
//kokku saadud, mode näitab mis pidi hakkame otsima
function line(start,mode){
    
    left=true;//kas vasakul on õige värv
    right=true;//kas paremal on õige värv
    step=1;
    var line=new Array();
    while(true){
        switch(mode){
            //kui mode on 9, ehk otsime verdikaalset rida, siis ei ole lisa kontrolli vaja
            case 9:
                break;
            //kui eelmine leitud ruut oli juba paremas või vasakus servas, siis seda teed pidi pole enam tarvis otsida
            case 8:
                if(left && (start-(step-1)*mode)%9 == 8 ){
                    left=false
                }
                if(right && (start+(step-1)*mode)%9 == 0){
                    right=false
                }
                break;
            default:
                if(right && (start+(step-1)*mode)%9 == 8 ){
                    right=false
                }
                if(left && (start-(step-1)*mode)%9 == 0){
                    left=false
                }
        }
        //kontrollime kas vasakul on õige värv
        if(!left || (start-step*mode)<0 || 
          !(board[start-step*mode]==board[start])){
            left=false;            
        }else{
            
            line.push(start-step*mode)
        }
        //kontrollime kas paremal on õige värv
        if(!right || (start+step*mode)>80 || 
          !(board[start+step*mode]==board[start])){
            right=false;            
        }else{
            line.push(start+step*mode)
        }
        
        //document.write(line+"<br />");
        
        //kontrollime kas on jätkuvat rida või mitte
        if(!(right||left)){
            if(line.length>3){
                return line; 
            }else{
                return new Array();
            }            
        }else{
            //on jätkuv rida, läheme edasi kaugemalt otsima
            step++;
        }
        
    }
    return;
}

//funktsioon, mis tagastab meile massivi, kus on ruudud, mis tuleks
//tühjaks teha, kuna seal saadi viis või enam ritta
function score(start){
    //näitab, mis pidi otsida 1-horisontalselt, 10 kagu-loode diagonaalis
    //9 ülevalt alla ja 8 kirde-edela suunas diagonaalselt
    var modes=[1,8,9,10]; 
    var score=new Array();
    for(l=0;l<modes.length;l++){
        var temp=new Array();
        temp=line(start,modes[l]);
        score=score.concat(temp);
    }
    if(score.length!=0){
        score.push(start);
        return score;
    }else{
        return new Array();
    }
}
//vaatame, kas kaks ruutu on omavahel seotud tühjade ruutudega
function isThereAWay(start, end){
    clearBoard(rsBoard,-1);
    /*ruudud, kuhu saame minna eelmiselt tasemelt*/
    var result=new Array();
    result[0]=start;
    //märgime algruudu ära tulemuste tabelis
    rsBoard[start] = 99;
    while(true){
        //selle tasemel ruudud, mida kontrollida järgmisel tasemel
        var temp=new Array();
        var j=0;
        for(var i=0;i<result.length;i++){
            //kontrollime antud ruutudel järgmistele ruutudele saamise võimalust
            var stepResult=nextStep(result[i]);
            //alert(stepResult);
            for(var k=0;k<stepResult.length;k++,j++){
                temp[j]=stepResult[k];
            }
        }
        result=temp;
        //kui leidsime ruudu, siis tagastame tõese väärtuse, kui ei ole enam ruute tagastame väära väärtuse 
        if(temp.length==0) return false;
        for(var i=0;i<result.length;i++){
            if(result[i]==end){
                findWay(start,end);
                return true;
            }
        }
    }
    return false;
}
//Leiame tee rsBoard muutujalt
function findWay(start,end){
    way=new Array();
    var i=0;
    way[i]=end;
    while(true){
        i++;
        
        if(rsBoard[way[i-1]]==99 || way[i-1]==rsBoard[way[i]]){
            return way;
        }
        way[i]=rsBoard[way[i-1]];
    }
    return new Array();
}

//Leiame kuhu me antud ruudus minna saame
function nextStep(start){
        start=parseInt(start);
        var temp=Array();
        //ei ole esimene rida, kontrollime ülemist ruutu
        if(!(start < 9)){
            if(board[start-9]==0 && rsBoard[start-9] ==-1){
                temp.push(start-9);
                rsBoard[start-9]=start;
            }
        }
        //ei ole viimane rida, kontrollime alumist ruut
        if (!(start >71)){
            if(board[start+9]==0 && rsBoard[start+9] ==-1){
                temp.push(start+9);
                rsBoard[start+9]=start;
            }
        }
        //ei ole esimene veerg, kontrollime vasakul olevat ruutu
        if( start%9 != 0 ){
            if(board[start-1]==0 && rsBoard[start-1] ==-1){
                temp.push(start-1);
                rsBoard[start-1]=start;
            }
        }
        //ei ole viimane veerg, kontrollime paremal olevat ruutu
        if( start%9 != 8 ){
            if(board[start+1]==0 && rsBoard[start+1] ==-1){
                temp.push(start+1);
                rsBoard[start+1]=start;
            }
        }
        return temp
}


/*---------------------------------------------------
Graafilised käsud
--------------------------------------------------*/

//funktsioon, mis lisab külje paneelil olevatesse kohtadesse uued nupud
function addToNext(){
    for(i=0;i<3 && showNext;i++){
        var stl="Images/";
        switch (next[i]){
            case 1: stl+="yellow"; break;
            case 2: stl+="red"; break;
            case 3: stl+="blue"; break;
            case 4: stl+="green"; break;
            case 5: stl+="cyan"; break;
            case 6: stl+="violet"; break;
            case 7: stl+="black"; break;
        }
        stl+=".png";
        document.getElementById("next"+(i+1)).src=stl;
    }
    return;
}
//funtksioon, mis tekitab väikese efekti ruudule minekul
function overCell(cell){
    var id=cell.id.substr(4);

    if(!play){
        return;
    }
    if(selected===""){
        if(board[id]!=0){
            var stl="Images/selected_";
            switch (board[id]){
                case 1: stl+="yellow"; break;
                case 2: stl+="red"; break;
                case 3: stl+="blue"; break;
                case 4: stl+="green"; break;
                case 5: stl+="cyan"; break;
                case 6: stl+="violet"; break;
                case 7: stl+="black"; break;
            }
            stl+=".png";
            document.getElementById("cell"+id).src=stl;
        }
    }else{
        if(isThereAWay(selected,id)){
            
            for(i=way.length-2;i>0;i--){
                document.getElementById("cell"+way[i]).src="Images/way_cell.png";
            }
            document.getElementById("cell"+way[0]).src="Images/selected_cell.png";
        }
    }
    return;
}

//funtksioon, mis tekitab väikese efekti ruudult väljudes
function exitCell(cell){
    var id=cell.id.substr(4);
    if(!play){
        return;
    }
    if(selected===""){
        if(board[id]!=0){
            var stl="Images/";
            switch (board[id]){
                case 1: stl+="yellow"; break;
                case 2: stl+="red"; break;
                case 3: stl+="blue"; break;
                case 4: stl+="green"; break;
                case 5: stl+="cyan"; break;
                case 6: stl+="violet"; break;
                case 7: stl+="black"; break;
            }
            stl+=".png";
            document.getElementById("cell"+id).src=stl;
        }
    }else{
        if(way.length>0){
            
            for(i=way.length-2;i>=0;i--){
                document.getElementById("cell"+way[i]).src="Images/cell.png";
            }
            way=new Array();

        }
    }
    return;
}
//deselect selected cell
function deselectCell(cell){
    var id=cell.id.substr(4);

    if(board[id]!=0){
    var stl="Images/";
        switch (board[id]){
            case 1: stl+="yellow"; break;
            case 2: stl+="red"; break;
            case 3: stl+="blue"; break;
            case 4: stl+="green"; break;
            case 5: stl+="cyan"; break;
            case 6: stl+="violet"; break;
            case 7: stl+="black"; break;
        }
        stl+=".png";
        document.getElementById("cell"+id).src=stl;
    }
    selected="";
    return;
}
//funtksioon, mis tekitab väikese efekti ruudu valimisel
function selectCell(cell){
    var id=cell.id.substr(4);
    if(!play){
        return;
    }
    if(selected==="" && board[id]!=0){
        selected=id;
        setTimeout("animate("+id+",true)",250);
    }else if(selected==id && selected !== ""){
        deselectCell(cell);
    }else if(selected !== ""){
        if(isThereAWay(selected,id)){
            i=way.length-2;
            play=false;
            setTimeout("moveStep("+selected+","+i+")",100);            
        }else{
            var t=selected;
            deselectCell(document.getElementById("cell"+t)); 
            selectCell(cell);
        }
    }
    return;
}

//funktsioon, mis animeerib valitud ruudu vilkumist
function animate(id,which){
    if(selected==id ){
            var stl="Images/";
            switch (board[id]){
                case 1: stl+="yellow"; break;
                case 2: stl+="red"; break;
                case 3: stl+="blue"; break;
                case 4: stl+="green"; break;
                case 5: stl+="cyan"; break;
                case 6: stl+="violet"; break;
                case 7: stl+="black"; break;
            }            
            if(which){
                stl+="_sm_";
            }
            stl+=".png";
            document.getElementById("cell"+id).src=stl;
            
        setTimeout("animate("+id+","+(!which)+")",250);
    }
}
//funktsioon, mis animeerib nupu liikumist laual
function moveStep(start,i){
    if(i>=0){
        document.getElementById("cell"+way[i]).src=document.getElementById("cell"+start).src;
        document.getElementById("cell"+start).src="Images/cell.png";
        
        board[way[i]]=board[selected];
        board[selected]=0;
        selected=way[i];
        i--;
        setTimeout("moveStep("+selected+","+i+")",100);
        
    }else{  
        way=new Array();        
       setTimeout("computerStep("+selected+")",100);
       deselectCell(document.getElementById("cell"+selected));
    }
    return;
}

//funktsioon, mis käivitub mängu lõpus
function gameOver(){
    alert("GAME OVER");
    play=false;
    game=false;
}
//funktsioon, mis algatab uue mängu
function newGame(){
    if(game && !confirm("Do you want to abort current game?")){
        return;
    }
    //muutujate algväärtustamine
    level=document.getElementById("level").value;
    game=true;
    play=false;
    clearBoard(board,0);
    player_score=0;
    selected="";
    document.getElementById("score").innerHTML="<strong>000000</strong>";
    
   // alert("test");
    for(i=0;i<81;i++){
        document.getElementById("cell"+i).src="Images/cell.png";
    }
    
    
    //genereerime alguse 4 kuulikest
    generateNext(4);

    //alustame arvutikäikude stsenaariumit
    scoreComputer_select(0);
}

//funktsioon, mis käivitub peale kasutaja käiku
function computerStep(selected){
    //kasutaja käigu keelamine
    play=false;
    //arvutame ega me midagi ra ei saa saata
    scr_array=score(selected);
    if(scr_array.length!=0){
        for(m=0;m<scr_array.length;m++){
            var stl="Images/selected_";
            switch (board[scr_array[m]]){
                case 1: stl+="yellow"; break;
                case 2: stl+="red"; break;
                case 3: stl+="blue"; break;
                case 4: stl+="green"; break;
                case 5: stl+="cyan"; break;
                case 6: stl+="violet"; break;
                case 7: stl+="black"; break;
            }
            stl+=".png";
            document.getElementById("cell"+scr_array[m]).src=stl;
            
        }
        //kui saame ära saata, siis teeme väikese animatsiooni viitega
        setTimeout("scorePlayer()",200);
    }else{
        //alustame arvutikäikude stsenaariumit
          scoreComputer_select(0);
    }
}
//funktsioon, mis käivitub, kui kasutaja on 5 või enam ritta saanud
function scorePlayer(){
    //skoori arvutamine
        if(!showNext && !seenNext){
          player_score=player_score+(scr_array.length+1)*(scr_array.length-4);
        }else{
          player_score=player_score+scr_array.length*(scr_array.length-4);
        }
    document.getElementById("score").innerHTML="<strong>"+(new String(player_score+1000000)).substr(1)+"</strong>"
    //nuppude ärasaatmine
    for(m=0;m<scr_array.length;m++){
        var stl="Images/cell.png";
        document.getElementById("cell"+scr_array[m]).src=stl;
        board[scr_array[m]]=0;
    }
    //alustame arvutikäikude stsenaariumit
    if(level>7){
        scoreComputer_select(0);
    }else{
        play=true;
    }
}
//uue nupu lisamine lauale 
//num määrab, mitmenda elemendi next massiivist laule paneme
function scoreComputer_select(num){
        var emp=emptyCells();
        var n;
        if(emp.length==0){
            gameOver();
        }else{
            n=Math.floor(Math.random()*emp.length);
        }
        board[emp[n]]=next[num];
        var stl="Images/";
        switch (board[emp[n]]){
            case 1: stl+="yellow"; break;
            case 2: stl+="red"; break;
            case 3: stl+="blue"; break;
            case 4: stl+="green"; break;
            case 5: stl+="cyan"; break;
            case 6: stl+="violet"; break;
            case 7: stl+="black"; break;
        }
        stl+=".png";
        document.getElementById("cell"+emp[n]).src=stl;
        scr_array=score(emp[n]);
        for(m=0;m<scr_array.length;m++){
        //alert(m);
            var stl="Images/selected_";
            switch (board[scr_array[m]]){
                case 1: stl+="yellow"; break;
                case 2: stl+="red"; break;
                case 3: stl+="blue"; break;
                case 4: stl+="green"; break;
                case 5: stl+="cyan"; break;
                case 6: stl+="violet"; break;
                case 7: stl+="black"; break;
            }
            stl+=".png";
            document.getElementById("cell"+scr_array[m]).src=stl;
        }
        if(scr_array.length!=0){
            setTimeout("scoreComputer_send("+num+")",200);
        }else{
            scoreComputer_send(num);
        }
}
/*teine samm, mis on lisamisest eraldi, et teha viitega animeerimist, kui on vaja*/
function scoreComputer_send(num){
    if(scr_array.length!=0){
        if(!showNext && !seenNext){
          player_score=player_score+(scr_array.length+1)*(scr_array.length-4);
        }else{
          player_score=player_score+scr_array.length*(scr_array.length-4);
        }
        document.getElementById("score").innerHTML="<strong>"+(new String(player_score+1000000)).substr(1)+"</strong>"
        for(l=0;l<scr_array.length;l++){
            var stl="Images/cell.png";
            document.getElementById("cell"+scr_array[l]).src=stl;
            board[scr_array[l]]=0;
        }
        scr_array=new Array();
    }
    if(emptyCells().length==0){
            gameOver();
    }else{        
        num++;
        if(num>=next.length){
            generateNext(3);
            addToNext();
            seenNext=false;
            play=true;
        }else{
            scoreComputer_select(num);      
        }
    }
}