document.addEventListener("DOMContentLoaded",function(){


    audio = document.querySelector("audio");
    let audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 512;
    audio.play();
    frequencyData = new Uint8Array(analyser.frequencyBinCount)

    let canvas = document.querySelector("canvas")
    let c = canvas.getContext("2d")
    let body = document.querySelector("body")
    let rect = body.getBoundingClientRect()

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let w = canvas.width;
    let h = canvas.height;
    let player = {
        x: w/2,
        y: h/2,
        sx: 5,
        sy: 5,
        sizeX:20,
        sizeY:20,
        hittable: true,
        hit:false
    }

    let x = 100;

    let y = w;

    let mouse = {
        x:null,
        y:null
    }


    //player movement

    let isMovingLeft = false
    let isMovingRight = false
    let isMovingUp = false
    let isMovingDown = false
    let lastKeyPressed = null
    let canDash = true
    let dashDelay = 0

    body.addEventListener('keypress', (event) => {
        let key = event.code

        if (key === 'KeyA') {
            isMovingLeft = true
            lastKeyPressed = key
        }
        if (key === 'KeyD') {
            isMovingRight = true
            lastKeyPressed = key
        }
        if (key === 'KeyW') {
            isMovingUp = true
            lastKeyPressed = key
        }
        if (key === 'KeyS') {
            isMovingDown = true
            lastKeyPressed = key
        }
        if(key === 'Space' && canDash && dashDelay==0 && (lastKeyPressed === 'KeyA' || lastKeyPressed === 'KeyD')) {
            player.sx=30
            canDash=false
            player.hittable=false
        }
        else if(key === 'Space' && canDash && dashDelay==0 && (lastKeyPressed === 'KeyW' || lastKeyPressed === 'KeyS')) {
            player.sy=30
            canDash=false
            player.hittable=false
        }
        else {
            player.sx=5
            player.sy=5
            player.hittable=true
        }
    })

    body.addEventListener('keyup', (event) => {
        let key = event.code
        if (key === 'KeyA') {
            isMovingLeft = false
        }
        if (key === 'KeyD') {
            isMovingRight = false
        }
        if (key === 'KeyW') {
            isMovingUp = false
        }
        if (key === 'KeyS') {
            isMovingDown = false
        }
        if(key === 'Space') {
            player.sx=5
            player.sy=5
            player.hittable=true

        }

    })

    //===============


    body.addEventListener("mousemove",function(event){
        mouse.x = event.pageX
        mouse.y = event.pageY
    })


    let delay = 0;
    let trailDelay = 0;
    let frequencyTab = calcAverage(frequencyData);
    let spawnedObj = [];
    let canDisplay = true;
    let reseted = false;
    let avgFerq = 0;
    let songAvg = 0;
    let songSum = 0;
    let totalEllapsedTime = 0;
    let allSongSum = 0;
    let allSongAvg = 0;

    let freq        = 0
    let beatdelay   = 0
    let alpha       = .1
    let wantedAlpha = 1

    function draw(){

        //render diagrams

        beatdelay++
        alpha += (-alpha+wantedAlpha)/100

        if(beatdelay % 100 == 0) {
            wantedAlpha = 1-wantedAlpha
        }

        beatdelay > 300 && freq > 15000
            ? (
                c.fillStyle = "rgba(22, 22, 22, " + alpha + ")",
                    freq = 0
            )
            : (
                c.fillStyle = "rgba(22, 22, 22, " + alpha + ")"
            )

        for(let i in frequencyData) {
            let f = frequencyData[i]

            // ------ TOP DIAGRAM
            c.beginPath()
            c.rect((w-(w/2))-i*15-7.5, h-(h/2), 13, -f)
            c.fill()
            c.beginPath()
            c.rect((w-(w/2))+i*15+7.5, h-(h/2), 13, -f)
            c.fill()

            // ------ BOTTOM DIAGRAM
            c.beginPath()
            c.rect((w-(w/2))-i*15-7.5, h-(h/2), 13, f)
            c.fill()
            c.beginPath()
            c.rect((w-(w/2))+i*15+7.5, h-(h/2), 13, f)
            c.fill()

            freq += f
        }

        //player render

        if(!canDash) {
            dashDelay++
        }
        if(dashDelay >= 100) {
            canDash=true
            dashDelay=0
        }

        isMovingLeft ? player.x-=player.sx : ""
        isMovingRight ? player.x+=player.sx : ""
        isMovingUp ? player.y-=player.sy : ""
        isMovingDown ? player.y+=player.sy : ""

        c.beginPath()
        c.fillStyle = "magenta"
        c.rect(player.x, player.y, player.sizeX, player.sizeY)
        c.fill()

        if(player.y > h) {
            player.y=0
        }
        if(player.y < 0) {
            player.y=h
        }

        if(player.x > w) {
            player.x=0
        }
        if(player.x < 0) {
            player.x=w
        }

        //=============

            //frequencyTab = calcAverage(frequencyData);
        let sum = 0
        for(let i  = 0; i < frequencyData.length ; i++) {

            let f = Math.floor(frequencyData[i]) ;
            sum += f

        }
        avgFerq = sum / frequencyData.length;
        songSum += avgFerq;
        allSongSum += avgFerq;
        songAvg = songSum / delay;
        allSongAvg = allSongSum / totalEllapsedTime;
        if (trailDelay > 0){
            trailDelay = 0;
            c.fillStyle = 'rgba(33,33,33,.3)';
            c.fillRect(0,0,canvas.width,canvas.height);
        }

        analyser.getByteFrequencyData(frequencyData);

        // MUSIC
        c.fillStyle = "#CCCCCC";
        //console.log(avgFerq);
        totalEllapsedTime ++;
        delay ++;
        trailDelay ++;
        if (reseted == true)
        {
            canDisplay = true;
            reseted = false;
        }

        if (canDisplay && (avgFerq > songAvg && delay > 5) || (avgFerq > 100 && delay > 2)){
            songSum = 0;
            delay = 0;

            frequencyTab = calcAverage(frequencyData);
            //console.log(frequencyTab);
            spawnedObj.push(spawnObjects(frequencyTab));
            canDisplay = false;
            reseted = true;



        }
        for(let i  = 0; i < frequencyTab.length ; i++) {

            let f = Math.floor(frequencyTab[i]) ;

            c.beginPath();
            c.rect(i*11, 100, 10, f);
            c.fill()


        }
        c.font = "12px Arial";
        c.fillStyle = "white";
        c.fillText(   Math.floor(frequencyTab[0]), 10, 60);
        c.fillText(   Math.floor(frequencyTab[1]), 50, 60);
        c.fillText(   Math.floor(frequencyTab[2]), 100, 60);
        c.fillText(   Math.floor(frequencyTab[3]), 150, 60);
        c.fillText(   Math.floor(frequencyTab[4]), 200, 60);
        c.fillText(   Math.floor(frequencyTab[5]), 250, 60);
        c.fillText(   Math.floor(frequencyTab[6]), 300, 60);
        c.fillText(   Math.floor(frequencyTab[7]), 350, 60);


        // c.beginPath();
        // c.rect(player.x, player.y, player.sizeX, player.sizeY);
        // c.fill();fill
        //rendu

        //c.fillStyle = "rgb(" + (frequencyTab[3] % 220 + 35) + ',' + (frequencyTab[3] % 220) + ',' + (frequencyTab[3] % 220 + 35) + ')';
        for (let i = 0; i < spawnedObj.length; i++) {
            c.beginPath();

            //c.arc(spawnedObj[i].x, spawnedObj[i].y,spawnedObj[i].size, 0, Math.PI * 2);
            c.rect(spawnedObj[i].x, spawnedObj[i].y, spawnedObj[i].sizeX, spawnedObj[i].sizeY);
            c.fillStyle = spawnedObj[i].fillColor;

            spawnedObj[i].x += spawnedObj[i].xSpeed;
            spawnedObj[i].y += spawnedObj[i].ySpeed;


            if (colision(spawnedObj[i],player)){
                console.log("touched")
                player.hit = true;
            }
            //console.log(spawnedObj[i].kind);


            if(spawnedObj[i].x > w || spawnedObj[i].y > h ){
                spawnedObj.splice(i, 1)
                console.log("deleted")
            }
            c.fill();
        }


        if (!player.hit)
        {
            window.requestAnimationFrame(draw);
        }
        else{
            audio.pause();

        }
    }

    function calcAverage(frequencyTab){





        let intervale = frequencyTab.length /4;
        let results= [];
        let coeffs = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1, 1];

        for (let j = 1; j <= 8; j++) {

            let sum = 0;
            let start = 5 * (j - 1);
            let stop = 5 * j;
            for (let i = start; i < stop; i++) {
                sum += (frequencyTab[i]);
            }

            start += intervale;
            stop += intervale;
            results.push(sum/(5) * coeffs[j - 1]);

        }
        return results
    }
    function spawnObjects(frequencyTab){

        let maxIndex = 0;
        let max = 0
        for (let i = 0; i < frequencyTab.length; i++) {


            if (frequencyTab[i] > max)
            {
                maxIndex = i;

                max = frequencyTab[i];



            }
        }

        //console.log(maxIndex)

        let obstacle = {kind:"", x: 0, y: h/2, xSpeed: 5, ySpeed: 5, fillColor:"white",freqNum:1,size:2,sizeX: 10,sizeY: 10};

        obstacle.kind = setKind(frequencyTab[0]);

        switch (obstacle.kind) {
            case "BassBullet":
                obstacle.fillColor = "red";
                break;
        }

        obstacle.xSpeed = 5 * frequencyTab[6] /80;
        obstacle.y = getRnd(0,h);
        obstacle.ySpeed = 0;
        obstacle.size = 3;






        return obstacle;
    }
    function setKind(freq){
        let kind = "";

        if (freq > 200 && freq < 220){
            kind = "wall"
        }
        if (freq > 220 && freq < 240){
            kind = "sinBullet"
        }
        if (freq > 240){
            kind = "BassBullet"
        }

        return kind;
    }
    function colision(obj,target){
        let collided = false;
        if (obj.x < target.x + target.sizeX &&
            obj.x + target.sizeX > target.x &&
            obj.y < target.y + target.sizeY &&
            obj.sizeY + obj.y > target.y) {
            collided = true;
        }
        return collided;
    }

    window.requestAnimationFrame(draw);

});



function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
function getRnd(min, max) {
    return Math.random() * (max - min) + min;
}

console.log("cc");

/*
*     let bufferSize = 256;

    let frequence = 0;
    let amplitude = 0;
    let maxAmplitude = 0;


    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function(stream) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
            mediaStream = context.createMediaStreamSource(stream);
            let numberOfInputChannels = 2;
            let numberOfOutputChannels = 2;
            if (context.createScriptProcessor) {
                recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            } else {
                recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            }

            recorder.onaudioprocess = function (e) {
                let chanl = e.inputBuffer.getChannelData(0);
                let chanr = e.inputBuffer.getChannelData(1);
                amplitude = 0;
                frequence = 0;
                let mem = 0;
                let l = 0;
                let r = 0;
                for (let i in chanl) {
                    l = chanl[i];
                    r = chanr[i];
                    amplitude += Math.abs(l)+Math.abs(r);
                    if ((l<0 && mem>0) || (l>0 && mem<0))
                        frequence++;
                    mem = l;
                }
                if (maxAmplitude<amplitude)
                    maxAmplitude = amplitude;
                console.log(maxAmplitude)
            }
            mediaStream.connect(recorder);
            recorder.connect(context.destination);

        }).catch(function(err) {
            console.log("Stream not OK");

        });

*
*
*
* c.save()
        c.translate(mouse.x,mouse.y)
        c.strokeStyle = "#AAAAAA";
        c.beginPath()
        c.moveTo(-10, 0);
        c.lineTo(10, 0);
        c.stroke()
        c.beginPath()
        c.moveTo(0,-10);
        c.lineTo(0,10);
        c.stroke()
        c.restore()

        c.save();
        c.translate(player.x,player.y);
        c.rotate(player.a);
        c.beginPath();
        c.fillStyle = "magenta";
        c.arc(0,0,50, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.fillStyle = "black";
        c.arc(-15,-15,10, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.fillStyle = "black";
        c.arc(15,-15,10, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.fillStyle = "black";
        c.arc(0,15,20, 0, Math.PI, false);
        c.fill();

        c.restore();


        //calc

        let dist = Math.sqrt(Math.pow(mouse.x - player.x,2) + Math.pow(mouse.y - player.y,2));

        if (dist < 50){
            if (mouse.x > player.x)
            {
                player.xSpeed = - player.xSpeed
            }
            else{

            }
            player.ySpeed *= -1;
        }
        player.ySpeed += 0.1;



        player.x += player.xSpeed;
        player.y += player.ySpeed;
        player.a += player.rSpeed;

        if (player.y >= h - 50 ){
            player.ySpeed = - player.ySpeed;


        }

        if (player.x >= w - 50 || player.x <= 0){
            player.xSpeed = - player.xSpeed;

        }
*
* */

/*
* cool
*
* for (let i = 0; i < spawnedObj.length; i++) {
            c.beginPath();

            c.arc(spawnedObj[i].x, spawnedObj[i].y,spawnedObj[i].size, 0, Math.PI * 2);
            c.fillStyle = spawnedObj[i].fillColor;
            if (spawnedObj[i].freqNum === 0){
                spawnedObj[i].x +=  spawnedObj[i].xSpeed;
                spawnedObj[i].y +=  spawnedObj[i].ySpeed;

            }
            if (spawnedObj[i].freqNum === 1){
                spawnedObj[i].x +=  spawnedObj[i].xSpeed;
                spawnedObj[i].y += spawnedObj[i].ySpeed;

            }
            if (spawnedObj[i].freqNum === 2){
                spawnedObj[i].x +=  spawnedObj[i].xSpeed;
                spawnedObj[i].y += (frequencyTab[2] / 20) * spawnedObj[i].ySpeed + spawnedObj[i].ySpeed;

            }
            if (spawnedObj[i].freqNum === 5 && spawnedObj[i].size < 20){
                spawnedObj[i].x +=  (frequencyTab[3] / 20) * spawnedObj[i].xSpeed  + spawnedObj[i].xSpeed;
                spawnedObj[i].y +=  spawnedObj[i].ySpeed * (frequencyTab[1] / 20 + spawnedObj[i].ySpeed);
                spawnedObj[i].size += (frequencyTab[3] / 100);

            }else{
            }
            if (spawnedObj[i].size > 1)
            {
                //spawnedObj[i].size -= spawnedObj[i].size / 10;
            }
            c.fill();
        }
*
* for (let i = 0; i < frequencyTab.length; i++) {
            if (frequencyTab[i] > max)
            {
                maxIndex = i;
                max = frequencyTab[i];

                console.log(frequencyTab[i])


            }
        }
*
* */